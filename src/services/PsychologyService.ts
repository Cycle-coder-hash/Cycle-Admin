import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { APP_CONFIG } from "../core/config/env";

export interface AdminPsychologyPost {
  id: string;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  authorRole: "admin" | "support" | "admin_manager";
  authorBadge: "admin" | "manager";
  content: string;
  photoUrl: string | null;
  photoKey: string | null;
  status: "published";
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  canonicalPath: string;
}

export interface PsychologyManagerItem {
  id: number;
  name: string;
  email: string | null;
  role: "support" | "admin_manager";
  granted: boolean;
  grantedBy: number | null;
  updatedAt: string | null;
}

export interface AdminPsychologyNotification {
  id: number;
  recipientUserId: number;
  type: "love" | "comment" | "admin_reply";
  postId: string;
  commentId: number | null;
  parentCommentId: number | null;
  actorId: number;
  actorName: string;
  actorAvatar: string | null;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  targetUrl: string;
}

export interface CreatePostPayload {
  content: string;
  photoUrl?: string | null;
  photoKey?: string | null;
}

export interface UpdatePostPayload {
  content: string;
  photoUrl?: string | null;
  photoKey?: string | null;
}

export class PsychologyService extends HttpClient {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  /**
   * List all psychology posts for administrative view (includes cursor pagination).
   */
  public async getPosts(options?: {
    limit?: number;
    cursor?: string;
  }): Promise<{
    items: AdminPsychologyPost[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.cursor) params.set("cursor", options.cursor);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    try {
      const res = await this.get<{
        success: boolean;
        items: AdminPsychologyPost[];
        nextCursor: string | null;
        hasMore: boolean;
      }>(`/psychology/posts${queryString}`);
      if (res?.success && Array.isArray(res.items)) {
        return {
          items: res.items,
          nextCursor: res.nextCursor ?? null,
          hasMore: Boolean(res.hasMore),
        };
      }
    } catch (apiErr) {
      console.warn("[PsychologyService.getPosts primary API notice, trying Supabase fallback]:", apiErr);
    }

    // Resilient fallback: read from Supabase settings table if main REST API is offline
    try {
      const rows = await this.supabase.fetchRaw<any[]>(
        "settings",
        "key=eq.cycle_psychology_posts_v1&select=value"
      );
      if (rows && rows[0]?.value) {
        const parsed = JSON.parse(rows[0].value);
        if (Array.isArray(parsed)) {
          const items: AdminPsychologyPost[] = parsed.map((p: any) => ({
            id: p.id,
            authorId: p.authorId || 1,
            authorName: p.authorName || "Cycle of Chart",
            authorAvatar: p.authorAvatar ?? null,
            authorRole: p.authorRole || "admin",
            authorBadge: p.authorRole === "admin" ? "admin" : "manager",
            content: p.content,
            photoUrl: p.photoUrl ?? null,
            photoKey: p.photoKey ?? null,
            status: "published",
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            isEdited: new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime() > 1000,
            canonicalPath: `/psychology/${p.id}`,
          }));
          return { items, nextCursor: null, hasMore: false };
        }
      }
    } catch (fallbackErr) {
      console.warn("[PsychologyService.getPosts fallback warning]:", fallbackErr);
    }

    return { items: [], nextCursor: null, hasMore: false };
  }

  /**
   * Create a new psychology feed post.
   */
  public async createPost(payload: CreatePostPayload): Promise<AdminPsychologyPost> {
    const res = await this.post<{ success: boolean; post: AdminPsychologyPost }>(
      "/psychology/posts",
      payload
    );
    if (!res?.post) {
      throw new Error("Failed to create psychology post.");
    }
    return res.post;
  }

  /**
   * Update an existing psychology post.
   */
  public async updatePost(id: string, payload: UpdatePostPayload): Promise<AdminPsychologyPost> {
    const res = await this.put<{ success: boolean; post: AdminPsychologyPost }>(
      `/psychology/posts/${encodeURIComponent(id)}`,
      payload
    );
    if (!res?.post) {
      throw new Error("Failed to update psychology post.");
    }
    return res.post;
  }

  /**
   * Delete a psychology post.
   */
  public async deletePost(id: string): Promise<AdminPsychologyPost> {
    const res = await this.delete<{ success: boolean; post: AdminPsychologyPost }>(
      `/psychology/posts/${encodeURIComponent(id)}`
    );
    return res?.post;
  }

  /**
   * List all Support / Manager accounts and their psychology_manage permission status.
   */
  public async getManagers(): Promise<PsychologyManagerItem[]> {
    try {
      const res = await this.get<{
        success: boolean;
        managers: PsychologyManagerItem[];
      }>("/psychology/managers");
      if (res?.success && Array.isArray(res.managers)) {
        return res.managers;
      }
    } catch (err) {
      console.warn("[PsychologyService.getManagers error]:", err);
    }
    return [];
  }

  /**
   * Grant or revoke psychology_manage permission for a specific user ID.
   */
  public async setManagerPermission(payload: {
    userId: number;
    permission?: string;
    granted: boolean;
  }): Promise<{ success: boolean }> {
    const res = await this.post<{ success: boolean }>(
      "/psychology/managers/permission",
      payload
    );
    return { success: Boolean(res?.success) };
  }

  /**
   * List live activity notifications (loves, comments, replies).
   */
  public async getNotifications(options?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{ items: AdminPsychologyNotification[]; unreadCount: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.unreadOnly) params.set("unreadOnly", "true");
    const query = params.toString() ? `?${params.toString()}` : "";

    try {
      const res = await this.get<{
        success: boolean;
        items: AdminPsychologyNotification[];
        unreadCount: number;
      }>(`/psychology/notifications${query}`);
      if (res?.success) {
        return {
          items: res.items || [],
          unreadCount: res.unreadCount || 0,
        };
      }
    } catch (err) {
      console.warn("[PsychologyService.getNotifications notice]:", err);
    }
    return { items: [], unreadCount: 0 };
  }

  /**
   * Mark an activity notification as read.
   */
  public async markNotificationRead(notificationId: number): Promise<{ success: boolean }> {
    const res = await this.post<{ success: boolean }>(
      `/psychology/notifications/${notificationId}/read`,
      {}
    );
    return { success: Boolean(res?.success) };
  }

  /**
   * Post an official Full Admin reply to a user comment.
   */
  public async replyToComment(
    postId: string,
    commentId: number,
    content: string
  ): Promise<{ success: boolean; reply?: any }> {
    const res = await this.post<{ success: boolean; reply?: any }>(
      `/psychology/posts/${encodeURIComponent(postId)}/comments/${commentId}/reply`,
      { content }
    );
    return { success: Boolean(res?.success), reply: res?.reply };
  }

  /**
   * Upload an image attachment for a psychology post to cloud storage.
   */
  public async uploadImage(
    file: File
  ): Promise<{ url: string; key: string | null; provider?: string }> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const apiRoot = APP_CONFIG.API_BASE.replace(/\/api\/admin\/?$/, "");

    // 1. Try dedicated Psychology upload route on backend
    try {
      const res = await fetch(`${apiRoot}/api/psychology/upload-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": APP_CONFIG.MASTER_KEY,
        },
        body: JSON.stringify({
          base64,
          filename: safeName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          return {
            url: data.url,
            key: data.key ?? null,
            provider: data.provider,
          };
        }
      }
    } catch (primaryErr) {
      console.warn("[uploadImage primary route notice]:", primaryErr);
    }

    // 2. Fallback to standard admin upload route
    const fallbackRes = await fetch(`${apiRoot}/api/upload/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": APP_CONFIG.MASTER_KEY,
      },
      body: JSON.stringify({
        base64,
        filename: safeName,
      }),
    });

    if (!fallbackRes.ok) {
      const err = await fallbackRes.json().catch(() => ({}));
      throw new Error(err?.error || `Upload failed with HTTP status ${fallbackRes.status}`);
    }

    const fallbackData = await fallbackRes.json();
    return {
      url: fallbackData.url,
      key: fallbackData.key ?? null,
      provider: fallbackData.provider,
    };
  }
}

export const defaultPsychologyService = new PsychologyService();
