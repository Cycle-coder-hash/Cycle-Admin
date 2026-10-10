import { HttpClient } from "./HttpClient";
import { APP_CONFIG } from "../config/env";

/**
 * OOP Supabase REST Adapter
 * Handles direct Supabase fallback calls with authentication and custom querying.
 */
export class SupabaseAdapter extends HttpClient {
  constructor(
    supabaseUrl: string = APP_CONFIG.SUPABASE_URL,
    private readonly apiKey: string = APP_CONFIG.SUPABASE_KEY
  ) {
    super(supabaseUrl);
  }

  protected override async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    return super.request<T>(path, { ...options, headers });
  }

  public async fetchRaw<T = any>(resource: string, queryParams: string = ""): Promise<T> {
    const queryString = queryParams ? (queryParams.startsWith("?") ? queryParams : `?${queryParams}`) : "";
    return this.get<T>(`${resource}${queryString}`);
  }
}

export const defaultSupabaseAdapter = new SupabaseAdapter();
