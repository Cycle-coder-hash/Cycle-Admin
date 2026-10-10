import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { defaultEbookService, EbookService } from "./EbookService";
import { APP_CONFIG } from "../core/config/env";

export interface IOwnerProfileService {
  fetchProfile(): Promise<any>;
  updateProfile(payload: any): Promise<any>;
}

export class OwnerProfileService extends HttpClient implements IOwnerProfileService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter,
    private readonly ebookService: EbookService = defaultEbookService
  ) {
    super(apiBase);
  }

  public async fetchProfile(): Promise<any> {
    try {
      const data = await this.get<{ success?: boolean; profile?: any }>("/owner-profile");
      if (data?.success && data.profile) return data.profile;
    } catch (err) {
      console.warn("[fetchOwnerProfile primary failed, fetching from Supabase settings]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.owner_profile&select=value");
      if (rows && rows[0]?.value) {
        return JSON.parse(rows[0].value);
      }
    } catch (err) {
      console.warn("[Supabase owner profile fallback error]:", err);
    }
    return null;
  }

  public async updateProfile(payload: any): Promise<any> {
    let updatedProfile = { ...payload };

    if (payload.photoUrl && payload.photoUrl.startsWith("data:image/")) {
      try {
        const cdnUrl = await this.ebookService.uploadImage(payload.photoUrl);
        updatedProfile.photoUrl = cdnUrl;
      } catch (uploadErr) {
        console.warn("[ImgBB auto-upload failed, keeping base64]:", uploadErr);
      }
    }

    if (payload.profile2PhotoUrl && payload.profile2PhotoUrl.startsWith("data:image/")) {
      try {
        const cdnUrl2 = await this.ebookService.uploadImage(payload.profile2PhotoUrl);
        updatedProfile.profile2PhotoUrl = cdnUrl2;
      } catch (uploadErr) {
        console.warn("[ImgBB auto-upload for profile2PhotoUrl failed, keeping base64]:", uploadErr);
      }
    }

    let savedSuccessfully = false;

    try {
      const data = await this.post<{ success?: boolean; profile?: any }>("/owner-profile", updatedProfile);
      if (data?.success && data.profile) {
        updatedProfile = data.profile;
        savedSuccessfully = true;
      }
    } catch (err) {
      console.warn("[updateOwnerProfile primary failed, syncing directly to Supabase]:", err);
    }

    try {
      await this.supabase.post("settings", {
        key: "owner_profile",
        value: JSON.stringify(updatedProfile),
      }, { Prefer: "resolution=merge-duplicates" });
      savedSuccessfully = true;
    } catch (err) {
      console.warn("[Supabase direct owner_profile upsert error]:", err);
    }

    if (!savedSuccessfully) {
      throw new Error("Failed to save Owner Profile to both backend API and Supabase database.");
    }

    return updatedProfile;
  }
}

export const defaultOwnerProfileService = new OwnerProfileService();
