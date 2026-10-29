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
  linkedUserId?: number;
  name: string;
  avatarUrl: string;
  photoUrl?: string;
  role?: string;
  badge: "FREE" | "PRO" | "PREMIUM" | "STUDENT";
  manualBadge?: "none" | "pro" | "premium";
  reviewText?: string;
  testimonialQuote?: string;
  rating?: number;
  isActive: boolean;
  hasConsent: boolean;
  isConsentConfirmed?: boolean;
  order: number;
  displayOrder?: number;
  mode?: "linked" | "manual";
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_SOCIAL_PROOF_SETTINGS: SocialProofSettings = {
  isVisible: false,
  trustedCountText: "",
  showStarRating: true,
};

export function mapBadgeToLegacy(manualBadge?: string, badge?: string): "FREE" | "PRO" | "PREMIUM" | "STUDENT" {
  const norm = String(badge || manualBadge || "").toUpperCase();
  if (norm === "PRO") return "PRO";
  if (norm === "PREMIUM") return "PREMIUM";
  if (norm === "STUDENT") return "STUDENT";
  return "FREE";
}

export function mapBadgeToManual(badge?: string, manualBadge?: string): "none" | "pro" | "premium" {
  if (manualBadge === "pro" || manualBadge === "premium" || manualBadge === "none") {
    return manualBadge;
  }
  const norm = String(badge || "").toUpperCase();
  if (norm === "PRO") return "pro";
  if (norm === "PREMIUM") return "premium";
  return "none";
}

export function normalizeAdminSocialProofEntry(raw: any, index: number = 0): SocialProofEntry {
  const id = String(raw?.id || `sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const name = String(raw?.name || "").trim() || "Trader";
  const avatarUrl = String(raw?.avatarUrl || raw?.photoUrl || "").trim();
  const photoUrl = avatarUrl || undefined;
  const role = String(raw?.role || "Trader").trim() || "Trader";
  const reviewText = String(raw?.reviewText || raw?.testimonialQuote || "").trim() || undefined;
  const testimonialQuote = reviewText;
  const rawBadge = raw?.badge;
  const manualBadge = mapBadgeToManual(rawBadge, raw?.manualBadge);
  const legacyBadge = mapBadgeToLegacy(manualBadge, rawBadge);
  const isActive = raw?.isActive !== false;
  const hasConsent = raw?.hasConsent === true || raw?.isConsentConfirmed === true;
  const isConsentConfirmed = hasConsent;
  const order = typeof raw?.order === "number" ? raw.order : (typeof raw?.displayOrder === "number" ? raw.displayOrder : index + 1);
  const displayOrder = order;
  const userId = typeof raw?.userId === "number" ? raw.userId : (typeof raw?.linkedUserId === "number" ? raw.linkedUserId : null);
  const linkedUserId = userId && userId > 0 ? userId : undefined;
  const mode = raw?.mode === "linked" || (linkedUserId ? "linked" : "manual");
  const now = new Date().toISOString();

  return {
    id,
    userId,
    linkedUserId,
    name,
    avatarUrl,
    photoUrl,
    role,
    badge: legacyBadge,
    manualBadge,
    reviewText,
    testimonialQuote,
    rating: typeof raw?.rating === "number" && raw.rating >= 1 && raw.rating <= 5 ? Math.round(raw.rating) : undefined,
    isActive,
    hasConsent,
    isConsentConfirmed,
    order,
    displayOrder,
    mode: mode as "linked" | "manual",
    createdAt: raw?.createdAt || now,
    updatedAt: now,
  };
}

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
        "settings?on_conflict=key",
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
          return parsed
            .map((entry: any, idx: number) => normalizeAdminSocialProofEntry(entry, idx))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      }
    } catch (err) {
      console.warn("[SocialProofService fetchEntries error]:", err);
    }
    return [];
  }

  public async saveEntries(entries: SocialProofEntry[]): Promise<SocialProofEntry[]> {
    const normalized = entries.map((e, idx) => normalizeAdminSocialProofEntry(e, idx));
    try {
      await this.supabase.post(
        "settings?on_conflict=key",
        {
          key: "social_proof_entries",
          value: JSON.stringify(normalized),
        },
        { Prefer: "resolution=merge-duplicates" }
      );
    } catch (err) {
      console.error("[SocialProofService saveEntries error]:", err);
      throw err;
    }
    return normalized;
  }

  public async uploadAvatar(dataUrl: string): Promise<string> {
    return this.ebookService.uploadImage(dataUrl);
  }
}

export const defaultSocialProofService = new SocialProofService();
