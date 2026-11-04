import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { AuditEvent, CourseTelegramConfig } from "../lib/types";
import { APP_CONFIG } from "../core/config/env";

export interface PaymentGatewayConfig {
  enabled: boolean;
  number: string;
  type: "personal" | "merchant" | "agent";
  instructions?: string;
}

export interface BinanceGatewayConfig {
  enabled: boolean;
  identifierType: "binance_id" | "email" | "phone";
  identifierValue: string;
  qrImageUrl: string;
  instructions: string;
  currency: "USDT";
  network?: string;
}

export interface PaymentSettingsConfig {
  binancePay?: BinanceGatewayConfig;
  bkash: PaymentGatewayConfig;
  nagad: PaymentGatewayConfig;
  rocket: PaymentGatewayConfig;
  announcement?: string;
  announcementActive?: boolean;
  studentTelegramUrl?: string;
  studentTelegramDescription?: string;
  pricing?: {
    courses: {
      basicToAdvance: { priceUsd: string; priceBdt?: string };
      proBlueprint: { priceUsd: string; priceBdt?: string };
    };
    subscriptions: {
      freeTrial: { priceUsd: string; isLockedFree?: boolean };
      pro: { priceUsd: string; annualMonthlyEquivalentUsd?: string; yearlyTotalUsd?: string };
      premium: { priceUsd: string; annualMonthlyEquivalentUsd?: string; yearlyTotalUsd?: string };
    };
  };
  exchangeRate?: {
    effectiveRate: number | null;
    source: "manual" | "automatic" | "unavailable";
    isBkashAvailable: boolean;
    autoRate: number | null;
    lastAutoUpdatedAt: string | null;
    providerStatus: "healthy" | "degraded" | "unavailable";
    manualOverrideEnabled: boolean;
    manualRate: number | null;
    rateAgeHuman?: string | null;
  };
}

export const defaultPaymentConfig: PaymentSettingsConfig = {
  bkash: {
    enabled: true,
    number: "01961079326",
    type: "personal",
    instructions: "Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন",
  },
  nagad: {
    enabled: true,
    number: "01961079326",
    type: "personal",
    instructions: "Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন",
  },
  binancePay: {
    enabled: true,
    identifierType: "binance_id",
    identifierValue: "1077166735",
    qrImageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80",
    instructions: "Scan the Binance QR or copy the Binance ID to transfer USDT (BEP20 / Internal). Submit the Transaction ID / Reference below.",
    currency: "USDT",
    network: "Binance Internal / BEP20",
  },
  rocket: {
    enabled: true,
    number: "01961079326",
    type: "personal",
    instructions: "Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন",
  },
  announcement: "Special Institutional Discount 50% Active on All Packages!",
  announcementActive: true,
  studentTelegramUrl: "https://t.me/cycleofchart",
  studentTelegramDescription: "Official Cycle of Chart VIP Student Telegram Channel & Group",
  pricing: {
    courses: {
      basicToAdvance: { priceUsd: "19.99" },
      proBlueprint: { priceUsd: "39.99" },
    },
    subscriptions: {
      freeTrial: { priceUsd: "0", isLockedFree: true },
      pro: { priceUsd: "5.99", annualMonthlyEquivalentUsd: "4.99", yearlyTotalUsd: "59.88" },
      premium: { priceUsd: "14.99", annualMonthlyEquivalentUsd: "11.99", yearlyTotalUsd: "143.88" },
    },
  },
  exchangeRate: {
    effectiveRate: 122.0,
    source: "automatic",
    isBkashAvailable: true,
    autoRate: 122.0,
    lastAutoUpdatedAt: null,
    providerStatus: "healthy",
    manualOverrideEnabled: false,
    manualRate: null,
    rateAgeHuman: "just now",
  },
};

export const defaultCourseTelegramConfig: CourseTelegramConfig = {
  enabled: true,
  telegramUrl: "",
  titleEn: "COURSE ACCESS IS READY",
  titleBn: "কোর্স অ্যাক্সেস প্রস্তুত",
  messageEn: "Before you begin your course journey, join our official Telegram community for real-time course updates, institutional study materials, session announcements, and dedicated student support.",
  messageBn: "কোর্স শুরু করার আগে আমাদের অফিশিয়াল Telegram কমিউনিটিতে যুক্ত হোন। এখানে কোর্স সংক্রান্ত আপডেট, প্রাতিষ্ঠানিক স্টাডি ম্যাটেরিয়াল, সেশন অ্যানাউন্সমেন্ট এবং ডেডিকেটেড স্টুডেন্ট সাপোর্ট পাবেন।",
  joinButtonTextEn: "JOIN TELEGRAM",
  joinButtonTextBn: "TELEGRAM এ যুক্ত হোন",
  dismissButtonTextEn: "MAYBE LATER",
  dismissButtonTextBn: "পরে যুক্ত হব",
  displayMode: "once",
  popupDelay: 0,
};

export interface LeaderboardWeightsConfig {
  ruleAdherence: number;
  disciplineRoutine: number;
  winRate: number;
  consistency: number;
  profitFactor: number;
  updatedAt?: string;
}

export const defaultLeaderboardWeights: LeaderboardWeightsConfig = {
  ruleAdherence: 25,
  disciplineRoutine: 25,
  winRate: 20,
  consistency: 15,
  profitFactor: 15,
};

export interface ISettingsService {
  fetchAuditLogs(): Promise<AuditEvent[]>;
  fetchPaymentSettings(): Promise<PaymentSettingsConfig>;
  updatePaymentSettings(config: PaymentSettingsConfig): Promise<PaymentSettingsConfig>;
  fetchCourseTelegramConfig(): Promise<CourseTelegramConfig>;
  updateCourseTelegramConfig(config: CourseTelegramConfig): Promise<CourseTelegramConfig>;
  fetchLeaderboardWeights(): Promise<LeaderboardWeightsConfig>;
  updateLeaderboardWeights(weights: LeaderboardWeightsConfig): Promise<LeaderboardWeightsConfig>;
  recalculateLeaderboard(): Promise<{ success: boolean; count?: number; error?: string }>;
}

export class SettingsService extends HttpClient implements ISettingsService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchAuditLogs(): Promise<AuditEvent[]> {
    try {
      const data = await this.get<{ success?: boolean; logs?: AuditEvent[] }>("/audit-logs");
      if (data?.success && Array.isArray(data.logs)) return data.logs;
    } catch (err) {
      console.warn("[fetchAuditLogs unreachable, falling back to direct Supabase]:", err);
    }

    try {
      const logs = await this.supabase.fetchRaw<any[]>("auditEvents", "select=*&order=id.desc&limit=50");
      return Array.isArray(logs) ? logs : [];
    } catch {}
    return [];
  }

  public async fetchPaymentSettings(): Promise<PaymentSettingsConfig> {
    try {
      const data = await this.get<{
        success?: boolean;
        gateways?: any;
        announcement?: string;
        announcementActive?: boolean;
        studentTelegramUrl?: string;
        studentTelegramDescription?: string;
        pricing?: any;
        exchangeRate?: any;
      }>("/payment-settings");
      if (data?.success && data.gateways) {
        return {
          bkash: { ...defaultPaymentConfig.bkash, ...data.gateways.bkash },
          nagad: { ...defaultPaymentConfig.nagad, ...data.gateways.nagad },
          rocket: { ...defaultPaymentConfig.rocket, ...data.gateways.rocket },
          announcement: data.announcement || defaultPaymentConfig.announcement,
          announcementActive: data.announcementActive !== false,
          studentTelegramUrl: data.studentTelegramUrl || defaultPaymentConfig.studentTelegramUrl,
          studentTelegramDescription:
            data.studentTelegramDescription || defaultPaymentConfig.studentTelegramDescription,
          pricing: data.pricing || defaultPaymentConfig.pricing,
          exchangeRate: data.exchangeRate || defaultPaymentConfig.exchangeRate,
        };
      }
    } catch (err) {
      console.warn("[fetchPaymentSettings unreachable, reading Supabase settings]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.payment_gateways_config&select=value");
      if (rows && rows[0]?.value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return {
          bkash: { ...defaultPaymentConfig.bkash, ...parsed.bkash },
          nagad: { ...defaultPaymentConfig.nagad, ...parsed.nagad },
          rocket: { ...defaultPaymentConfig.rocket, ...parsed.rocket },
          announcement: parsed.announcement ?? defaultPaymentConfig.announcement,
          announcementActive: parsed.announcementActive !== false,
          studentTelegramUrl: parsed.studentTelegramUrl ?? defaultPaymentConfig.studentTelegramUrl,
          studentTelegramDescription:
            parsed.studentTelegramDescription ?? defaultPaymentConfig.studentTelegramDescription,
        };
      }
    } catch (err) {
      console.warn("[Supabase payment settings fallback error]:", err);
    }

    return defaultPaymentConfig;
  }

  public async updatePaymentSettings(config: PaymentSettingsConfig): Promise<PaymentSettingsConfig> {
    try {
      const data = await this.post<{ success?: boolean; gateways?: any }>("/payment-settings", config);
      if (data?.success && data.gateways) return config;
    } catch (err) {
      console.warn("[updatePaymentSettings primary failed, syncing directly to Supabase]:", err);
    }

    try {
      await this.supabase.post("settings?on_conflict=key", {
        key: "payment_gateways_config",
        value: JSON.stringify(config),
      }, { Prefer: "resolution=merge-duplicates" });
    } catch (err) {
      console.warn("[Supabase direct payment settings upsert error]:", err);
    }

    return config;
  }

  public async fetchCourseTelegramConfig(): Promise<CourseTelegramConfig> {
    try {
      const data = await this.get<{ success?: boolean; config?: CourseTelegramConfig }>("/course-telegram-settings");
      if (data?.success && data.config) {
        return { ...defaultCourseTelegramConfig, ...data.config };
      }
    } catch (err) {
      console.warn("[fetchCourseTelegramConfig API_BASE failed, reading Supabase settings]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.course_telegram_popup_config&select=value");
      if (rows && rows[0]?.value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return { ...defaultCourseTelegramConfig, ...parsed };
      }
    } catch (err) {
      console.warn("[fetchCourseTelegramConfig Supabase fallback failed]:", err);
    }

    return defaultCourseTelegramConfig;
  }

  public async updateCourseTelegramConfig(config: CourseTelegramConfig): Promise<CourseTelegramConfig> {
    let result = { ...config };
    try {
      const data = await this.post<{ success?: boolean; config?: CourseTelegramConfig }>(
        "/course-telegram-settings",
        config
      );
      if (data?.success && data.config) {
        result = data.config;
      }
    } catch (err) {
      console.warn("[updateCourseTelegramConfig API_BASE failed, writing to Supabase directly]:", err);
    }

    try {
      await this.supabase.post("settings?on_conflict=key", {
        key: "course_telegram_popup_config",
        value: JSON.stringify(result),
      }, { Prefer: "resolution=merge-duplicates" });
    } catch (err) {
      console.warn("[updateCourseTelegramConfig Supabase direct upsert error]:", err);
    }

    return result;
  }

  public async fetchLeaderboardWeights(): Promise<LeaderboardWeightsConfig> {
    try {
      const data = await this.get<{ success?: boolean; weights?: LeaderboardWeightsConfig }>("/leaderboard-settings");
      if (data?.success && data.weights) {
        return { ...defaultLeaderboardWeights, ...data.weights };
      }
    } catch (err) {
      console.warn("[fetchLeaderboardWeights API_BASE failed, reading Supabase settings]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.leaderboard_settings&select=value");
      if (rows && rows[0]?.value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return { ...defaultLeaderboardWeights, ...parsed };
      }
    } catch (err) {
      console.warn("[fetchLeaderboardWeights Supabase fallback failed]:", err);
    }

    return defaultLeaderboardWeights;
  }

  public async updateLeaderboardWeights(weights: LeaderboardWeightsConfig): Promise<LeaderboardWeightsConfig> {
    let result = { ...weights };
    try {
      const data = await this.post<{ success?: boolean; weights?: LeaderboardWeightsConfig }>(
        "/leaderboard-settings",
        weights
      );
      if (data?.success && data.weights) {
        result = data.weights;
      }
    } catch (err) {
      console.warn("[updateLeaderboardWeights API_BASE failed, writing to Supabase directly]:", err);
    }

    try {
      await this.supabase.post("settings?on_conflict=key", {
        key: "leaderboard_settings",
        value: JSON.stringify(result),
      }, { Prefer: "resolution=merge-duplicates" });
    } catch (err) {
      console.warn("[updateLeaderboardWeights Supabase direct upsert error]:", err);
    }

    return result;
  }

  public async recalculateLeaderboard(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const data = await this.post<{ success?: boolean; count?: number }>("/leaderboard/recalculate");
      return { success: true, count: data?.count };
    } catch (err: any) {
      console.warn("[recalculateLeaderboard error]:", err);
      return { success: false, error: err.message };
    }
  }
}

export const defaultSettingsService = new SettingsService();
