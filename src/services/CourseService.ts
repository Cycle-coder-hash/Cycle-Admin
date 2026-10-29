import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { APP_CONFIG } from "../core/config/env";
import { CourseAlbumMeta, CourseClass, CourseId } from "../lib/types";

export interface ICourseService {
  fetchCourseAlbumMeta(courseId: CourseId): Promise<CourseAlbumMeta>;
  updateCourseAlbumMeta(courseId: CourseId, payload: Partial<CourseAlbumMeta>): Promise<CourseAlbumMeta>;
  fetchCourseClasses(courseId: CourseId): Promise<CourseClass[]>;
  createCourseClass(courseId: CourseId, payload: any): Promise<CourseClass>;
  updateCourseClass(courseId: CourseId, classId: string, payload: Partial<CourseClass>): Promise<CourseClass>;
  deleteCourseClass(courseId: CourseId, classId: string): Promise<boolean>;
  reorderCourseClasses(courseId: CourseId, orderedClassIds: string[]): Promise<CourseClass[]>;
  reorderEbooks(orderedIds: number[]): Promise<any[]>;
}

export class CourseService extends HttpClient implements ICourseService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchCourseAlbumMeta(courseId: CourseId): Promise<CourseAlbumMeta> {
    try {
      const data = await this.get<{ success?: boolean; meta?: CourseAlbumMeta }>(
        `/courses/${courseId}/meta`
      );
      if (data?.success && data.meta) return data.meta;
    } catch (err) {
      console.warn(`[fetchCourseAlbumMeta primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const defaultMeta: CourseAlbumMeta =
      courseId === "basic-to-advance"
        ? {
            id: "basic-to-advance",
            title: "Cycle of Chart Basic to Advance Course",
            titleBn: "সাইকেল অফ চার্ট বেসিক টু অ্যাডভান্স কোর্স",
            subtitle: "Complete Institutional Trading Curriculum from zero to master",
            subtitleBn: "শূন্য থেকে মাস্টার লেভেল পর্যন্ত সম্পূর্ণ প্রাতিষ্ঠানিক ট্রেডিং কোর্স",
            description:
              "A complete professional video curriculum covering Market Structure, Candlestick Anatomy, Candle Range Theory (CRT), Institutional Order Flow, Liquidity Sweeps, and Risk Execution.",
            bundleId: 2,
            priceBdt: "2499",
            priceUsd: "19.99",
            badgeText: "Most Popular",
            features: [
              "Full Candle Range Theory (CRT) Anatomy",
              "Liquidity Sweeps & FVG Mechanics",
              "Order Flow & Execution Psychology",
              "Lifetime Class Replay & Study Material",
            ],
            thumbnailUrl: "",
            isPublished: true,
          }
        : {
            id: "cycle-blueprint",
            title: "Cycle of Chart — Professional Trading Blueprint",
            titleBn: "সাইকেল অফ চার্ট — প্রফেশনাল ট্রেডিং ব্লুপ্রিন্ট",
            subtitle: "Elite Algorithmic Models, Macro Session Timing & High-RR Execution",
            subtitleBn: "এলিট অ্যালগরিদমিক মডেল, ম্যাক্রো টাইমিং ও হাই-আরআর এক্সিকিউশন",
            description:
              "An advanced professional trading blueprint covering Algorithmic Cycles, Power of 3 (AMD), Macro Timing, HTF to LTF Fractal Confirmation, and Live Market Execution Case Studies.",
            bundleId: 4,
            priceBdt: "4999",
            priceUsd: "39.99",
            badgeText: "Elite Masterclass",
            features: [
              "Algorithmic Cycle & AMD Mechanics",
              "Macro Timing & Session Killzones",
              "High-Probability Entry Frameworks (1:5+ RR)",
              "Exclusive Institutional Case Studies",
            ],
            thumbnailUrl: "",
            isPublished: true,
          };

    try {
      const key = `course_album_meta_${courseId.replace(/-/g, "_")}`;
      const rows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.${key}&select=value`);
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        return { ...defaultMeta, ...parsed, id: courseId, bundleId: defaultMeta.bundleId };
      }
    } catch {}
    return defaultMeta;
  }

  public async updateCourseAlbumMeta(
    courseId: CourseId,
    payload: Partial<CourseAlbumMeta>
  ): Promise<CourseAlbumMeta> {
    try {
      const data = await this.put<{ success?: boolean; meta?: CourseAlbumMeta }>(
        `/courses/${courseId}/meta`,
        payload
      );
      if (data?.success && data.meta) return data.meta;
    } catch (err) {
      console.warn(`[updateCourseAlbumMeta primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const current = await this.fetchCourseAlbumMeta(courseId);
    const updated: CourseAlbumMeta = {
      ...current,
      ...payload,
      id: courseId,
      bundleId: current.bundleId,
    };
    const key = `course_album_meta_${courseId.replace(/-/g, "_")}`;
    try {
      await fetch(`${APP_CONFIG.SUPABASE_URL}/settings?on_conflict=key`, {
        method: "POST",
        headers: {
          apikey: APP_CONFIG.SUPABASE_KEY,
          Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key, value: JSON.stringify(updated) }),
      });
    } catch (err) {
      console.warn("[updateCourseAlbumMeta Supabase error]:", err);
    }
    return updated;
  }

  public async fetchCourseClasses(courseId: CourseId): Promise<CourseClass[]> {
    try {
      const data = await this.get<{ success?: boolean; classes?: CourseClass[] }>(
        `/courses/${courseId}/classes`
      );
      if (data?.success && Array.isArray(data.classes)) return data.classes;
    } catch (err) {
      console.warn(`[fetchCourseClasses primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const key = `course_classes_${courseId.replace(/-/g, "_")}`;
    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.${key}&select=value`);
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      }
    } catch {}
    return [];
  }

  public async createCourseClass(
    courseId: CourseId,
    payload: {
      title: string;
      description?: string;
      videoUrl: string;
      duration?: string;
      order?: number;
      isPublished?: boolean;
      resourceLink?: string;
    }
  ): Promise<CourseClass> {
    try {
      const data = await this.post<{ success?: boolean; class?: CourseClass }>(
        `/courses/${courseId}/classes`,
        payload
      );
      if (data?.success && data.class) return data.class;
    } catch (err) {
      console.warn(`[createCourseClass primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const existing = await this.fetchCourseClasses(courseId);
    const now = new Date().toISOString();
    const nextOrder =
      payload.order !== undefined && payload.order > 0 ? payload.order : existing.length + 1;
    const newClass: CourseClass = {
      id: `class-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courseId,
      title: payload.title.trim(),
      description: payload.description?.trim() || "",
      videoUrl: payload.videoUrl.trim(),
      duration: payload.duration?.trim() || "45 min",
      order: nextOrder,
      isPublished: payload.isPublished !== undefined ? payload.isPublished : true,
      resourceLink: payload.resourceLink?.trim() || "",
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...existing, newClass].sort((a, b) => (a.order || 0) - (b.order || 0));
    const key = `course_classes_${courseId.replace(/-/g, "_")}`;
    try {
      await fetch(`${APP_CONFIG.SUPABASE_URL}/settings?on_conflict=key`, {
        method: "POST",
        headers: {
          apikey: APP_CONFIG.SUPABASE_KEY,
          Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key, value: JSON.stringify(updated) }),
      });
    } catch (err) {
      console.warn("[createCourseClass Supabase error]:", err);
    }
    return newClass;
  }

  public async updateCourseClass(
    courseId: CourseId,
    classId: string,
    payload: Partial<CourseClass>
  ): Promise<CourseClass> {
    try {
      const data = await this.put<{ success?: boolean; class?: CourseClass }>(
        `/courses/${courseId}/classes/${classId}`,
        payload
      );
      if (data?.success && data.class) return data.class;
    } catch (err) {
      console.warn(`[updateCourseClass primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const existing = await this.fetchCourseClasses(courseId);
    const idx = existing.findIndex((c) => String(c.id) === String(classId));
    if (idx === -1) {
      throw new Error(`Class with id ${classId} not found`);
    }
    const current = existing[idx];
    const updatedClass: CourseClass = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    existing[idx] = updatedClass;
    existing.sort((a, b) => (a.order || 0) - (b.order || 0));
    const key = `course_classes_${courseId.replace(/-/g, "_")}`;
    try {
      await fetch(`${APP_CONFIG.SUPABASE_URL}/settings?on_conflict=key`, {
        method: "POST",
        headers: {
          apikey: APP_CONFIG.SUPABASE_KEY,
          Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key, value: JSON.stringify(existing) }),
      });
    } catch (err) {
      console.warn("[updateCourseClass Supabase error]:", err);
    }
    return updatedClass;
  }

  public async deleteCourseClass(courseId: CourseId, classId: string): Promise<boolean> {
    try {
      const data = await this.delete<{ success?: boolean }>(
        `/courses/${courseId}/classes/${classId}`
      );
      if (data?.success) return true;
    } catch (err) {
      console.warn(`[deleteCourseClass primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const existing = await this.fetchCourseClasses(courseId);
    const filtered = existing.filter((c) => String(c.id) !== String(classId));
    const resequenced = filtered.map((c, i) => ({ ...c, order: i + 1 }));
    const key = `course_classes_${courseId.replace(/-/g, "_")}`;
    try {
      await fetch(`${APP_CONFIG.SUPABASE_URL}/settings?on_conflict=key`, {
        method: "POST",
        headers: {
          apikey: APP_CONFIG.SUPABASE_KEY,
          Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key, value: JSON.stringify(resequenced) }),
      });
    } catch (err) {
      console.warn("[deleteCourseClass Supabase error]:", err);
    }
    return true;
  }

  public async reorderCourseClasses(
    courseId: CourseId,
    orderedClassIds: string[]
  ): Promise<CourseClass[]> {
    try {
      const data = await this.post<{ success?: boolean; classes?: CourseClass[] }>(
        `/courses/${courseId}/reorder`,
        { orderedClassIds }
      );
      if (data?.success && Array.isArray(data.classes)) return data.classes;
    } catch (err) {
      console.warn(`[reorderCourseClasses primary failed for ${courseId}, trying Supabase]:`, err);
    }

    const existing = await this.fetchCourseClasses(courseId);
    const map = new Map<string, CourseClass>(existing.map((c) => [String(c.id), c]));
    const reordered: CourseClass[] = [];
    for (let i = 0; i < orderedClassIds.length; i++) {
      const id = String(orderedClassIds[i]);
      const item = map.get(id);
      if (item) {
        reordered.push({ ...item, order: i + 1, updatedAt: new Date().toISOString() });
        map.delete(id);
      }
    }
    let nextPos = reordered.length + 1;
    Array.from(map.values()).forEach((rem) => {
      reordered.push({ ...rem, order: nextPos++, updatedAt: new Date().toISOString() });
    });
    const key = `course_classes_${courseId.replace(/-/g, "_")}`;
    try {
      await fetch(`${APP_CONFIG.SUPABASE_URL}/settings?on_conflict=key`, {
        method: "POST",
        headers: {
          apikey: APP_CONFIG.SUPABASE_KEY,
          Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key, value: JSON.stringify(reordered) }),
      });
    } catch (err) {
      console.warn("[reorderCourseClasses Supabase error]:", err);
    }
    return reordered;
  }

  public async reorderEbooks(orderedIds: number[]): Promise<any[]> {
    try {
      const data = await this.post<{ success?: boolean; ebooks?: any[] }>("/ebooks/reorder", {
        orderedIds,
      });
      if (data?.success && Array.isArray(data.ebooks)) return data.ebooks;
    } catch (err) {
      console.warn("[reorderEbooks unreachable, trying Supabase]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.free_ebooks&select=value");
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const currentList = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(currentList)) {
          const map = new Map(currentList.map((item: any) => [Number(item.id), item]));
          const reordered: any[] = [];
          for (let i = 0; i < orderedIds.length; i++) {
            const item = map.get(Number(orderedIds[i]));
            if (item) {
              reordered.push({ ...item, position: i + 1, updatedAt: new Date().toISOString() });
              map.delete(Number(orderedIds[i]));
            }
          }
          let nextPos = reordered.length + 1;
          Array.from(map.values()).forEach((rem: any) => {
            reordered.push({ ...rem, position: nextPos++, updatedAt: new Date().toISOString() });
          });
          await fetch(`${APP_CONFIG.SUPABASE_URL}/settings?on_conflict=key`, {
            method: "POST",
            headers: {
              apikey: APP_CONFIG.SUPABASE_KEY,
              Authorization: `Bearer ${APP_CONFIG.SUPABASE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "resolution=merge-duplicates",
            },
            body: JSON.stringify({ key: "free_ebooks", value: JSON.stringify(reordered) }),
          });
          return reordered;
        }
      }
    } catch (err) {
      console.warn("[reorderEbooks Supabase error]:", err);
    }
    return [];
  }
}
