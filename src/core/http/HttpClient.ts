/**
 * Core OOP HTTP Client
 * Provides base network access, standardized error handling, and method abstractions.
 */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly responseBody?: any
  ) {
    super(`HTTP ${status} (${statusText}): ${typeof responseBody === "object" ? JSON.stringify(responseBody) : responseBody || ""}`);
    this.name = "HttpError";
  }
}

export class HttpClient {
  constructor(protected readonly baseUrl: string) {}

  protected get fullBaseUrl(): string {
    return this.baseUrl.replace(/\/+$/, "");
  }

  protected async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${this.fullBaseUrl}${cleanPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let body: any;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      throw new HttpError(response.status, response.statusText, body);
    }

    try {
      return (await response.json()) as T;
    } catch {
      return {} as T;
    }
  }

  public async get<T = any>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: "GET", headers });
  }

  public async post<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async put<T = any>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async delete<T = any>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: "DELETE", headers });
  }
}
