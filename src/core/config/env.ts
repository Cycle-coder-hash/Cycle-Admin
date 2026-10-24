/**
 * Application Environment Configuration
 * Validated, typed, and decoupled from global scope.
 */

const defaultApiUrl = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://www.cycleofchart.com";

function normalizeApiUrl(url: string): string {
  let clean = (url || "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  if (!clean) return defaultApiUrl;
  if (!/^https?:\/\//i.test(clean) && !clean.startsWith("/")) {
    clean = /^(localhost|127\.0\.0\.1)/i.test(clean)
      ? `http://${clean}`
      : `https://${clean}`;
  }
  clean = clean.replace(/^https?:\/\/cycleofchart\.vercel\.app(?=\/|$)/i, "https://www.cycleofchart.com");
  return clean;
}

function normalizeSupabaseRestUrl(url: string): string {
  let clean = (url || "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  if (!clean) return (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/rest/v1` : "");
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  if (!clean.endsWith("/rest/v1")) {
    clean = `${clean}/rest/v1`;
  }
  return clean;
}

const rawApiUrl = normalizeApiUrl(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    defaultApiUrl
);

export const APP_CONFIG = {
  API_BASE: rawApiUrl.endsWith("/api/admin")
    ? rawApiUrl
    : `${rawApiUrl}/api/admin`,
  WEB_APP_URL: normalizeApiUrl(
    import.meta.env.VITE_WEB_APP_URL ||
      rawApiUrl.replace(/\/api\/admin\/?$/, "")
  ),
  SUPABASE_URL: normalizeSupabaseRestUrl(
    import.meta.env.VITE_SUPABASE_URL ||
      ""
  ),
  SUPABASE_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "",
  IMGBB_KEY:
    import.meta.env.VITE_IMGBB_API_KEY || "",
  MASTER_KEY: (import.meta.env.VITE_ADMIN_MASTER_KEY || "").trim(),
  IS_PROD: import.meta.env.PROD,
} as const;
