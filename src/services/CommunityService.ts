import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { APP_CONFIG } from "../core/config/env";

export interface AdminCommunityPost {
  id: number;
  userId: number;
  authorName: string;
  authorAvatar: string | null;
  authorPlan: string;
  authorRole: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICommunityService {
  fetchPosts(limit?: number, cursor?: number): Promise<{ items: AdminCommunityPost[]; nextCursor?: number }>;
  deletePost(postId: number): Promise<{ success: boolean }>;
  deleteComment(commentId: number): Promise<{ success: boolean }>;
  togglePin(postId: number, isPinned: boolean): Promise<{ success: boolean; post?: AdminCommunityPost }>;
}

export class CommunityService extends HttpClient implements ICommunityService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchPosts(
    limit = 50,
    cursor?: number
  ): Promise<{ items: AdminCommunityPost[]; nextCursor?: number }> {
    try {
      const q = new URLSearchParams();
      q.set("limit", String(limit));
      if (cursor) q.set("cursor", String(cursor));

      const res = await this.get<any>(`/community/posts?${q.toString()}`);
      if (res?.success && Array.isArray(res.items)) {
        return { items: res.items, nextCursor: res.nextCursor };
      }
    } catch (err) {
      console.warn("[CommunityService.fetchPosts error, checking fallback]:", err);
    }

    return { items: [] };
  }

  public async deletePost(postId: number): Promise<{ success: boolean }> {
    return await this.post<{ success: boolean }>("/community/delete-post", { postId });
  }

  public async deleteComment(commentId: number): Promise<{ success: boolean }> {
    return await this.post<{ success: boolean }>("/community/delete-comment", { commentId });
  }

  public async togglePin(
    postId: number,
    isPinned: boolean
  ): Promise<{ success: boolean; post?: AdminCommunityPost }> {
    return await this.post<any>("/community/toggle-pin", { postId, isPinned });
  }
}

export const defaultCommunityService = new CommunityService();
