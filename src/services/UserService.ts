import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { Student } from "../lib/types";
import { APP_CONFIG } from "../core/config/env";

export interface UserManagementFilters {
  search?: string;
  accountStatus?: string;
  courseAccess?: string;
  proAccess?: string;
  premiumAccess?: string;
}

export interface UpdateUserAccessPayload {
  userId: number;
  accessType: "course" | "pro" | "premium";
  status: "on" | "off";
  startDate?: string | null;
  expiryDate?: string | null;
  isLifetime?: boolean;
  isOverrideBlocked?: boolean;
  notes?: string;
}

export interface IUserService {
  fetchUsers(): Promise<Student[]>;
  grantAccess(userId: number, bundleId?: number, productId?: number): Promise<{ success: boolean }>;
  updateRole(userId: number, role: "user" | "support" | "admin"): Promise<{ success: boolean }>;
  fetchUserManagementList(filters?: UserManagementFilters): Promise<any[]>;
  fetchUserManagementDetails(userId: number): Promise<{ user: any; auditLogs: any[] } | null>;
  updateUserManagementAccess(payload: UpdateUserAccessPayload): Promise<any>;
  clearUserManagementOverride(userId: number, accessType: "course" | "pro" | "premium"): Promise<any>;
  setUserManagementAccountStatus(userId: number, status: "active" | "suspended" | "banned"): Promise<any>;
}

export class UserService extends HttpClient implements IUserService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchUsers(): Promise<Student[]> {
    try {
      const data = await this.get<{ success?: boolean; users?: Student[] }>("/users");
      if (data?.success && Array.isArray(data.users) && data.users.length > 0) return data.users;
    } catch (err) {
      console.warn("[API_BASE/users unreachable, falling back to direct Supabase]:", err);
    }

    try {
      const users = await this.supabase.fetchRaw<any[]>("users", "select=*&order=id.desc");
      if (Array.isArray(users) && users.length > 0) {
        return users.map((u: any) => ({
          id: u.id,
          openId: u.openId || `user_${u.id}`,
          name: u.name || "Trader",
          email: u.email,
          phone: u.phone || "",
          role: u.role || "user",
          createdAt: u.createdAt || new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0,
        }));
      }
    } catch (err) {
      console.warn("[Supabase users fallback error]:", err);
    }
    return [];
  }

  public async grantAccess(userId: number, bundleId?: number, productId?: number): Promise<{ success: boolean }> {
    try {
      const data = await this.post<{ success: boolean; error?: string }>("/grant-access", {
        userId,
        bundleId,
        productId,
      });
      if (!data.success) throw new Error(data.error || "Failed to grant access");
      return data;
    } catch (err: any) {
      // Direct Supabase entitlement
      try {
        await this.supabase.post("entitlements", {
          userId,
          bundleId: bundleId || null,
          productId: productId || null,
          source: "manual",
          createdAt: new Date().toISOString(),
        });
        return { success: true };
      } catch {
        throw new Error(err.message || "Failed to grant access");
      }
    }
  }

  public async updateRole(userId: number, role: "user" | "support" | "admin"): Promise<{ success: boolean }> {
    try {
      const data = await this.post<{ success?: boolean }>("/update-role", { userId, role });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[updateRole primary failed, trying Supabase direct]:", err);
    }

    try {
      await this.supabase.put(`users?id=eq.${userId}`, {
        role,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to update role");
    }
  }

  public async fetchUserManagementList(filters?: UserManagementFilters): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.accountStatus) params.append("accountStatus", filters.accountStatus);
      if (filters?.courseAccess) params.append("courseAccess", filters.courseAccess);
      if (filters?.proAccess) params.append("proAccess", filters.proAccess);
      if (filters?.premiumAccess) params.append("premiumAccess", filters.premiumAccess);

      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await this.get<{ success?: boolean; users?: any[] }>(`/user-management/list${qs}`);
      if (data?.success && data.users) return data.users;
    } catch (err) {
      console.warn("[fetchUserManagementList API_BASE error]:", err);
    }
    return [];
  }

  public async fetchUserManagementDetails(userId: number): Promise<{ user: any; auditLogs: any[] } | null> {
    try {
      const data = await this.get<{ success?: boolean; user?: any; auditLogs?: any[] }>(
        `/user-management/details/${userId}`
      );
      if (data?.success) return { user: data.user, auditLogs: data.auditLogs || [] };
    } catch (err) {
      console.warn("[fetchUserManagementDetails error]:", err);
    }
    return null;
  }

  public async updateUserManagementAccess(payload: UpdateUserAccessPayload): Promise<any> {
    return this.post("/user-management/update-access", payload);
  }

  public async clearUserManagementOverride(
    userId: number,
    accessType: "course" | "pro" | "premium"
  ): Promise<any> {
    return this.post("/user-management/clear-override", { userId, accessType });
  }

  public async setUserManagementAccountStatus(
    userId: number,
    status: "active" | "suspended" | "banned"
  ): Promise<any> {
    return this.post("/user-management/account-status", { userId, status });
  }
}

export const defaultUserService = new UserService();
