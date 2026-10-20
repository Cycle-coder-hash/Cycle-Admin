import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { defaultEbookService, EbookService } from "./EbookService";
import { APP_CONFIG } from "../core/config/env";

export interface SocialProofSettings {
  isVisible: boolean;
  trustedCountText: string;
  showStarRating: boolean;
}

export interface SocialProofEntry {
  id: string;
  userId?: number | null;
  name: string;
  avatarUrl: string;
  badge: "FREE" | "PRO" | "PREMIUM" | "STUDENT";
  reviewText?: string;
  isActive: boolean;
  hasConsent: boolean;
  order: number;
}

export const DEFAULT_SOCIAL_PROOF_SETTINGS: SocialProofSettings = {
  isVisible: false,
  trustedCountText: "",
  showStarRating: true,
};

export class SocialProofService extends HttpClient {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter,
    private readonly ebookService: EbookService = defaultEbookService
  ) {
    super(apiBase);
  }

  public async fetchSettings(): Promise<SocialProofSettings> {
    try {
      const rows = await this.supabase.fetchRaw<any[]>(
        "settings",
        "key=eq.social_proof_settings&select=value"
      );
      if (rows && rows[0]?.value) {
        const parsed = JSON.parse(rows[0].value);
        return {
          isVisible: typeof parsed.isVisible === "boolean" ? parsed.isVisible : DEFAULT_SOCIAL_PROOF_SETTINGS.isVisible,
          trustedCountText: typeof parsed.trustedCountText === "string" ? parsed.trustedCountText : DEFAULT_SOCIAL_PROOF_SETTINGS.trustedCountText,
          showStarRating: typeof parsed.showStarRating === "boolean" ? parsed.showStarRating : DEFAULT_SOCIAL_PROOF_SETTINGS.showStarRating,
        };
      }
    } catch (err) {
      console.warn("[SocialProofService fetchSettings error]:", err);
    }
    return { ...DEFAULT_SOCIAL_PROOF_SETTINGS };
  }

  public async saveSettings(settings: SocialProofSettings): Promise<SocialProofSettings> {
    const payload = {
      isVisible: Boolean(settings.isVisible),
      trustedCountText: String(settings.trustedCountText || "").trim(),
      showStarRating: Boolean(settings.showStarRating),
    };

    try {
      await this.supabase.post(
        "settings",
        {
          key: "social_proof_settings",
          value: JSON.stringify(payload),
        },
        { Prefer: "resolution=merge-duplicates" }
      );
    } catch (err) {
      console.error("[SocialProofService saveSettings error]:", err);
      throw err;
    }
    return payload;
  }

  public async fetchEntries(): Promise<SocialProofEntry[]> {
    try {
      const rows = await this.supabase.fetchRaw<any[]>(
        "settings",
        "key=eq.social_proof_entries&select=value"
      );
      if (rows && rows[0]?.value) {
        const parsed = JSON.parse(rows[0].value);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      }
    } catch (err) {
      console.warn("[SocialProofService fetchEntries error]:", err);
    }
    return [];
  }

  public async saveEntries(entries: SocialProofEntry[]): Promise<SocialProofEntry[]> {
    try {
      await this.supabase.post(
        "settings",
        {
          key: "social_proof_entries",
          value: JSON.stringify(entries),
        },
        { Prefer: "resolution=merge-duplicates" }
      );
    } catch (err) {
      console.error("[SocialProofService saveEntries error]:", err);
      throw err;
    }
    return entries;
  }

  public async uploadAvatar(dataUrl: string): Promise<string> {
    return this.ebookService.uploadImage(dataUrl);
  }
}

export const defaultSocialProofService = new SocialProofService();
