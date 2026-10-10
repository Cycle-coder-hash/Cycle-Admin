/**
 * Application Environment Configuration
 * Validated, typed, and decoupled from global scope.
 */

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://cycleofchart.vercel.app";

export const APP_CONFIG = {
  API_BASE: rawApiUrl.endsWith("/api/admin")
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, "")}/api/admin`,
  SUPABASE_URL:
    import.meta.env.VITE_SUPABASE_URL ||
    "https://pxrcaqmjmsvldhiyuacx.supabase.co/rest/v1",
  SUPABASE_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmNhcW1qbXN2bGRoaXl1YWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjQ3MTUsImV4cCI6MjEwMzYwMDcxNX0.T9_0iHg5a-vHh2tpTrVUVlvIsp5G6UB1n_i_kHN9OoM",
  MASTER_KEY: import.meta.env.VITE_ADMIN_MASTER_KEY || "admin2026",
  IS_PROD: import.meta.env.PROD,
} as const;
