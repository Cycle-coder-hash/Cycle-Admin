import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { APP_CONFIG } from "../core/config/env";

export interface IEbookService {
  fetchEbooks(): Promise<any[]>;
  createEbook(payload: any): Promise<any>;
  updateEbook(id: number, payload: any): Promise<any>;
  deleteEbook(id: number): Promise<{ success: boolean }>;
  uploadPdf(file: File): Promise<string>;
  uploadImage(base64Data: string): Promise<string>;
}

export class EbookService extends HttpClient implements IEbookService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchEbooks(): Promise<any[]> {
    try {
      const data = await this.get<{ success?: boolean; ebooks?: any[] }>("/ebooks");
      if (data?.success && Array.isArray(data.ebooks)) return data.ebooks;
    } catch (err) {
      console.warn("[fetchEbooks unreachable, falling back to Supabase settings]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.free_ebooks&select=value");
      if (rows && rows[0]?.value) {
        return JSON.parse(rows[0].value);
      }
    } catch {}
    return [];
  }

  public async createEbook(payload: any): Promise<any> {
    const finalPayload = { ...payload };

    // Auto-intercept base64 PDFs to upload to cloud storage
    if (finalPayload.fileUrl && typeof finalPayload.fileUrl === "string" && finalPayload.fileUrl.startsWith("data:")) {
      try {
        const cleanBase64 = finalPayload.fileUrl.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const syntheticFile = new File([blob], finalPayload.fileName || "document.pdf", { type: "application/pdf" });
        finalPayload.fileUrl = await this.uploadPdf(syntheticFile);
      } catch (guardErr) {
        console.warn("[Auto-upload PDF Base64 notice]:", guardErr);
      }
    }

    try {
      const data = await this.post<{ success?: boolean; ebook?: any }>("/ebooks", finalPayload);
      if (data?.success && data.ebook) return data.ebook;
    } catch (err) {
      console.warn("[createEbook primary failed, saving to Supabase settings]:", err);
    }

    const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.free_ebooks&select=value");
    let existing: any[] = [];
    if (rows && rows[0]?.value) existing = JSON.parse(rows[0].value);

    const newEbook = {
      id: Date.now(),
      ...finalPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    existing.unshift(newEbook);
    await this.supabase.post("settings", {
      key: "free_ebooks",
      value: JSON.stringify(existing),
    }, { Prefer: "resolution=merge-duplicates" });

    return newEbook;
  }

  public async updateEbook(id: number, payload: any): Promise<any> {
    const finalPayload = { ...payload };

    if (finalPayload.fileUrl && typeof finalPayload.fileUrl === "string" && finalPayload.fileUrl.startsWith("data:")) {
      try {
        const cleanBase64 = finalPayload.fileUrl.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const syntheticFile = new File([blob], finalPayload.fileName || "document.pdf", { type: "application/pdf" });
        finalPayload.fileUrl = await this.uploadPdf(syntheticFile);
      } catch (guardErr) {
        console.warn("[Auto-upload PDF Base64 notice]:", guardErr);
      }
    }

    try {
      const data = await this.put<{ success?: boolean; ebook?: any }>(`/ebooks/${id}`, finalPayload);
      if (data?.success && data.ebook) return data.ebook;
    } catch (err) {
      console.warn("[updateEbook primary failed, updating Supabase settings]:", err);
    }

    const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.free_ebooks&select=value");
    let existing: any[] = [];
    if (rows && rows[0]?.value) existing = JSON.parse(rows[0].value);

    const idx = existing.findIndex((e: any) => e.id === id);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...finalPayload, updatedAt: new Date().toISOString() };
      await this.supabase.post("settings", {
        key: "free_ebooks",
        value: JSON.stringify(existing),
      }, { Prefer: "resolution=merge-duplicates" });
      return existing[idx];
    }
    return { id, ...finalPayload };
  }

  public async deleteEbook(id: number): Promise<{ success: boolean }> {
    try {
      const data = await this.delete<{ success?: boolean }>(`/ebooks/${id}`);
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[deleteEbook primary failed, updating Supabase settings]:", err);
    }

    const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.free_ebooks&select=value");
    if (rows && rows[0]?.value) {
      const existing = JSON.parse(rows[0].value);
      const filtered = existing.filter((e: any) => e.id !== id);
      await this.supabase.post("settings", {
        key: "free_ebooks",
        value: JSON.stringify(filtered),
      }, { Prefer: "resolution=merge-duplicates" });
    }
    return { success: true };
  }

  public async uploadPdf(file: File): Promise<string> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    // 1. Primary: Backend Cloud endpoint (Cloudflare R2 storage)
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const apiRoot = APP_CONFIG.API_BASE.replace(/\/api\/admin\/?$/, "");
      const res = await fetch(`${apiRoot}/api/upload/file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": APP_CONFIG.MASTER_KEY,
        },
        body: JSON.stringify({
          base64,
          filename: safeName,
          contentType: file.type || "application/pdf",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url && typeof data.url === "string" && data.url.startsWith("http")) {
          return data.url;
        }
      }
    } catch (apiErr) {
      console.warn("[Backend upload proxy notice, trying Supabase fallback]:", apiErr);
    }

    // 2. Fallback: Supabase Storage "ebooks" bucket
    try {
      const uniqueName = `${Date.now()}_${safeName}`;
      const supaRes = await fetch(
        `${APP_CONFIG.SUPABASE_URL.replace(/\/rest\/v1\/?$/, "")}/storage/v1/object/ebooks/${uniqueName}`,
        {
          method: "POST",
          headers: {
            apikey: APP_CONFIG.SUPABASE_KEY,
            Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
            "Content-Type": file.type || "application/pdf",
          },
          body: file,
        }
      );

      if (supaRes.ok) {
        return `${APP_CONFIG.SUPABASE_URL.replace(/\/rest\/v1\/?$/, "")}/storage/v1/object/public/ebooks/${uniqueName}`;
      }
    } catch (supaErr) {
      console.warn("[Direct Supabase Storage upload error]:", supaErr);
    }

    throw new Error("Unable to upload PDF to cloud storage. Please check your internet connection.");
  }

  public async uploadImage(base64Data: string): Promise<string> {
    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    // 1. Primary: Backend Cloud endpoint (Cloudflare R2 storage)
    try {
      const apiRoot = APP_CONFIG.API_BASE.replace(/\/api\/admin\/?$/, "");
      const res = await fetch(`${apiRoot}/api/upload/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": APP_CONFIG.MASTER_KEY,
        },
        body: JSON.stringify({
          base64: cleanBase64,
          filename: `owner_profile_${Date.now()}.png`,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.url) return json.url;
      }
    } catch (e) {
      console.warn("[Backend uploadImage notice, trying ImgBB fallback]:", e);
    }

    // 2. Fallback: ImgBB
    const IMGBB_KEY = APP_CONFIG.IMGBB_KEY;
    const fd = new FormData();
    fd.append("key", IMGBB_KEY);
    fd.append("image", cleanBase64);
    fd.append("name", `owner_profile_${Date.now()}`);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    if (json?.success && (json.data?.display_url || json.data?.url)) {
      return json.data.display_url || json.data.url;
    }
    throw new Error(json?.error?.message || "ImgBB upload failed");
  }
}

export const defaultEbookService = new EbookService();
