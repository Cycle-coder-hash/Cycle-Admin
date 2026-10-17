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
  if (!clean) return "https://pxrcaqmjmsvldhiyuacx.supabase.co/rest/v1";
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
      "https://pxrcaqmjmsvldhiyuacx.supabase.co/rest/v1"
  ),
  SUPABASE_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmNhcW1qbXN2bGRoaXl1YWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjQ3MTUsImV4cCI6MjEwMzYwMDcxNX0.T9_0iHg5a-vHh2tpTrVUVlvIsp5G6UB1n_i_kHN9OoM",
  IMGBB_KEY:
    import.meta.env.VITE_IMGBB_API_KEY || "83205d3de1723e4976090aad947fc26d",
  MASTER_KEY: import.meta.env.VITE_ADMIN_MASTER_KEY || "admin2026",
  IS_PROD: import.meta.env.PROD,
} as const;
