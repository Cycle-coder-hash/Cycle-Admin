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

function isAutomatedTestUser(u: { openId?: string | null; email?: string | null }): boolean {
  const email = (u.email || "").toLowerCase();
  const openId = u.openId || "";
  if (email.endsWith("@test.com") || email.endsWith("@example.com") || email.endsWith("@admin.com")) {
    return true;
  }
  if (
    openId.startsWith("usr_1790") ||
    openId.startsWith("usr_settings_") ||
    openId.startsWith("usr_another_") ||
    openId.startsWith("test_")
  ) {
    return true;
  }
  return false;
}

function formatDisplayUserId(numericId: number): string {
  if (!numericId || numericId <= 0) return "USER-0001";
  return `USER-${String(numericId).padStart(4, "0")}`;
}

function isManualRecordActive(record: any, now: Date = new Date()): boolean {
  if (!record) return false;
  if (record.status !== "on") return false;
  if (record.isOverrideBlocked) return false;
  if (record.startDate) {
    const start = new Date(record.startDate);
    if (start.getTime() > now.getTime()) return false;
  }
  if (record.isLifetime) return true;
  if (record.expiryDate && record.expiryDate !== "LIFETIME") {
    const exp = new Date(record.expiryDate);
    return exp.getTime() > now.getTime();
  }
  return true;
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
      if (data?.success && Array.isArray(data.users) && data.users.length > 0) {
        return data.users.filter((u: any) => !isAutomatedTestUser(u));
      }
    } catch (err) {
      console.warn("[API_BASE/users unreachable, falling back to direct Supabase]:", err);
    }

    try {
      const users = await this.supabase.fetchRaw<any[]>("users", "select=*&order=id.desc");
      if (Array.isArray(users) && users.length > 0) {
        return users
          .filter((u: any) => !isAutomatedTestUser(u))
          .map((u: any) => ({
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
      try {
        await this.supabase.post("entitlements", {
          userId,
          bundleId: bundleId || null,
          productId: productId || null,
          scope: bundleId ? `bundle:${bundleId}` : `product:${productId || 1}`,
          grantedAt: new Date().toISOString(),
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

  private async buildUserManagementListFromSupabase(filters?: UserManagementFilters): Promise<any[]> {
    const [rawUsers, rawEntitlements, rawSettings] = await Promise.all([
      this.supabase.fetchRaw<any[]>("users", "select=*&order=id.desc").catch(() => []),
      this.supabase.fetchRaw<any[]>("entitlements", "select=*").catch(() => []),
      this.supabase
        .fetchRaw<any[]>(
          "settings",
          "or=(key.like.trader_profile_*,key.like.manual_access_*,key.like.user_subscription_*,key.like.user_account_status_*,key.eq.global_trader_registry)&select=key,value"
        )
        .catch(() => []),
    ]);

    const settingsMap = new Map<string, any>();
    if (Array.isArray(rawSettings)) {
      for (const row of rawSettings) {
        if (row?.key && row?.value !== undefined) {
          try {
            settingsMap.set(row.key, typeof row.value === "string" ? JSON.parse(row.value) : row.value);
          } catch {
            settingsMap.set(row.key, row.value);
          }
        }
      }
    }

    const usersByOpenId = new Map<string, any>();
    const safeUsers = Array.isArray(rawUsers) ? rawUsers : [];

    for (const su of safeUsers) {
      if (!su?.openId || isAutomatedTestUser(su)) continue;
      const prof = settingsMap.get(`trader_profile_${su.openId}`) || settingsMap.get(`trader_profile_${su.id}`);
      usersByOpenId.set(su.openId, {
        id: Number(su.id),
        openId: su.openId,
        name: prof?.name || su.name || "Trader",
        email: su.email || prof?.email || null,
        username: prof?.username || null,
        avatar: prof?.avatar !== undefined ? prof.avatar : su.avatar || null,
        role: su.role || prof?.role || "user",
        loginMethod: su.loginMethod || "supabase",
        createdAt: su.createdAt || new Date().toISOString(),
        lastSignedIn: su.lastSignedIn || su.createdAt || new Date().toISOString(),
      });
    }

    // Merge any active users from trader_profile_* that weren't in users table
    for (const [key, prof] of settingsMap.entries()) {
      if (!key.startsWith("trader_profile_") || !prof || typeof prof !== "object") continue;
      const oid = prof.openId;
      if (!oid || usersByOpenId.has(oid) || isAutomatedTestUser({ openId: oid, email: prof.email })) continue;
      usersByOpenId.set(oid, {
        id: Number(prof.userId) || 1,
        openId: oid,
        name: prof.name || "Trader",
        email: prof.email || null,
        username: prof.username || null,
        avatar: prof.avatar || null,
        role: prof.role || "user",
        loginMethod: "google",
        createdAt: prof.updatedAt || new Date().toISOString(),
        lastSignedIn: prof.updatedAt || new Date().toISOString(),
      });
    }

    const entitlementsList = Array.isArray(rawEntitlements) ? rawEntitlements : [];
    const now = new Date();

    let results = Array.from(usersByOpenId.values()).map((u) => {
      const numericId = Number(u.id);
      const displayId = formatDisplayUserId(numericId);
      const accountStatusRaw = settingsMap.get(`user_account_status_${numericId}`);
      const accountStatus =
        accountStatusRaw === "suspended" || accountStatusRaw === "banned" ? accountStatusRaw : "active";

      const manualCourse = settingsMap.get(`manual_access_${numericId}:course`);
      const manualPro = settingsMap.get(`manual_access_${numericId}:pro`);
      const manualPremium = settingsMap.get(`manual_access_${numericId}:premium`);
      const sub = settingsMap.get(`user_subscription_${numericId}`);

      const userEnts = entitlementsList.filter((e: any) => Number(e.userId) === numericId);
      const autoCourseActive = userEnts.some(
        (e: any) =>
          e.scope === "course" ||
          e.scope === "bundle:2" ||
          e.scope === "bundle:3" ||
          e.scope === "bundle:4" ||
          e.bundleId === 2 ||
          e.bundleId === 3 ||
          e.bundleId === 4
      );

      const subEndsAt = sub?.subscriptionEndsAt ? new Date(sub.subscriptionEndsAt) : null;
      const subValid = sub?.status === "active" && (!subEndsAt || subEndsAt.getTime() > now.getTime());
      const autoProActive = subValid && sub?.plan === "pro";
      const autoPremiumActive = subValid && sub?.plan === "premium";

      const buildState = (manualRec: any, autoActive: boolean, autoExp: string | null) => {
        const manualActive = isManualRecordActive(manualRec, now);
        const isOverrideBlocked = manualRec?.isOverrideBlocked === true;
        const effectiveActive = !isOverrideBlocked && (manualActive || autoActive);
        return {
          status: effectiveActive ? ("on" as const) : ("off" as const),
          accessType: manualActive ? ("manual" as const) : ("automatic" as const),
          startDate: manualRec?.startDate ? new Date(manualRec.startDate).toISOString() : null,
          expiryDate: manualRec?.isLifetime
            ? "LIFETIME"
            : manualRec?.expiryDate
            ? new Date(manualRec.expiryDate).toISOString()
            : null,
          isLifetime: !!manualRec?.isLifetime,
          isOverrideBlocked,
          automaticActive: autoActive,
          automaticExpiry: autoExp,
          manualActive,
          effectiveActive,
        };
      };

      const courseAccess = buildState(manualCourse, autoCourseActive, null);
      const proAccess = buildState(
        manualPro,
        autoProActive,
        autoProActive && subEndsAt ? subEndsAt.toISOString() : null
      );
      const premiumAccess = buildState(
        manualPremium,
        autoPremiumActive,
        autoPremiumActive && subEndsAt ? subEndsAt.toISOString() : null
      );

      let effectivePlan = "unclaimed";
      if (premiumAccess.effectiveActive) effectivePlan = "premium";
      else if (proAccess.effectiveActive) effectivePlan = "pro";
      else if (sub?.plan === "free_trial") effectivePlan = "free_trial";

      const email = u.email || null;
      const isGoogleAuth =
        (u.loginMethod && String(u.loginMethod).toLowerCase().includes("google")) ||
        (email && email.toLowerCase().endsWith("@gmail.com")) ||
        Boolean(u.avatar && String(u.avatar).includes("googleusercontent.com"));

      return {
        id: numericId,
        displayId,
        openId: u.openId,
        name: u.name || "Trader",
        email,
        isGoogleAuth: !!isGoogleAuth,
        username: u.username || null,
        avatar: u.avatar || null,
        accountStatus,
        role: u.role || "user",
        createdAt: u.createdAt,
        lastSignedIn: u.lastSignedIn,
        courseAccess,
        proAccess,
        premiumAccess,
        isCourseOn: courseAccess.effectiveActive,
        isProOn: proAccess.effectiveActive,
        isPremiumOn: premiumAccess.effectiveActive,
        effectivePlan,
      };
    });

    results.sort((a, b) => new Date(b.lastSignedIn || b.createdAt).getTime() - new Date(a.lastSignedIn || a.createdAt).getTime());

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(
        (u) =>
          u.displayId.toLowerCase().includes(q) ||
          String(u.id).includes(q) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q))
      );
    }
    if (filters?.accountStatus && filters.accountStatus !== "all") {
      results = results.filter((u) => u.accountStatus === filters.accountStatus);
    }
    if (filters?.courseAccess && filters.courseAccess !== "all") {
      const wantOn = filters.courseAccess === "on";
      results = results.filter((u) => u.isCourseOn === wantOn);
    }
    if (filters?.proAccess && filters.proAccess !== "all") {
      const wantOn = filters.proAccess === "on";
      results = results.filter((u) => u.isProOn === wantOn);
    }
    if (filters?.premiumAccess && filters.premiumAccess !== "all") {
      const wantOn = filters.premiumAccess === "on";
      results = results.filter((u) => u.isPremiumOn === wantOn);
    }

    return results;
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
      if (data?.success && Array.isArray(data.users)) {
        return data.users.filter((u: any) => !isAutomatedTestUser(u));
      }
    } catch (err) {
      console.warn("[fetchUserManagementList API_BASE error, falling back to direct Supabase]:", err);
    }

    try {
      return await this.buildUserManagementListFromSupabase(filters);
    } catch (supaErr) {
      console.warn("[fetchUserManagementList Supabase fallback error]:", supaErr);
      return [];
    }
  }

  public async fetchUserManagementDetails(userId: number): Promise<{ user: any; auditLogs: any[] } | null> {
    try {
      const data = await this.get<{ success?: boolean; user?: any; auditLogs?: any[] }>(
        `/user-management/details/${userId}`
      );
      if (data?.success && data.user) return { user: data.user, auditLogs: data.auditLogs || [] };
    } catch (err) {
      console.warn("[fetchUserManagementDetails API_BASE error, falling back to Supabase]:", err);
    }

    try {
      const allUsers = await this.buildUserManagementListFromSupabase();
      const user = allUsers.find((u) => Number(u.id) === Number(userId)) || null;
      if (!user) return null;

      let auditLogs: any[] = [];
      const rows = await this.supabase
        .fetchRaw<any[]>("settings", `key=eq.audit_logs_${userId}&select=value`)
        .catch(() => []);
      if (rows && rows[0]?.value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        if (Array.isArray(parsed)) auditLogs = parsed;
      }
      return { user, auditLogs };
    } catch (supaErr) {
      console.warn("[fetchUserManagementDetails Supabase fallback error]:", supaErr);
      return null;
    }
  }

  public async updateUserManagementAccess(payload: UpdateUserAccessPayload): Promise<any> {
    try {
      return await this.post("/user-management/update-access", payload);
    } catch (err) {
      console.warn("[updateUserManagementAccess API_BASE error, saving directly to Supabase]:", err);
    }

    const { userId, accessType, status, startDate, expiryDate, isLifetime, isOverrideBlocked, notes } = payload;
    const now = new Date().toISOString();
    const key = `manual_access_${userId}:${accessType}`;
    const record = {
      id: Date.now(),
      userId: Number(userId),
      accessType,
      status,
      isOverrideBlocked: isOverrideBlocked !== undefined ? isOverrideBlocked : status === "off",
      startDate: startDate || now,
      expiryDate: isLifetime ? null : expiryDate || null,
      isLifetime: !!isLifetime,
      updatedAt: now,
    };

    await this.supabase.post(
      "settings?on_conflict=key",
      { key, value: JSON.stringify(record), updatedAt: now },
      { Prefer: "resolution=merge-duplicates" }
    );

    // Append audit log
    try {
      const auditKey = `audit_logs_${userId}`;
      const existingRows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.${auditKey}&select=value`);
      let logs: any[] = [];
      if (existingRows && existingRows[0]?.value) {
        logs = JSON.parse(existingRows[0].value);
      }
      logs.unshift({
        id: Date.now(),
        userId: Number(userId),
        accessType,
        previousState: status === "on" ? "OFF" : "ON",
        newState: status === "on" ? (isLifetime ? "ON (Lifetime)" : "ON") : "BLOCKED (Admin Override)",
        startDate: record.startDate,
        expiryDate: record.expiryDate,
        isLifetime: !!isLifetime,
        adminId: 1,
        adminName: "Admin",
        notes: notes || null,
        createdAt: now,
      });
      await this.supabase.post(
        "settings?on_conflict=key",
        { key: auditKey, value: JSON.stringify(logs.slice(0, 100)), updatedAt: now },
        { Prefer: "resolution=merge-duplicates" }
      );
    } catch {}

    return { success: true };
  }

  public async clearUserManagementOverride(
    userId: number,
    accessType: "course" | "pro" | "premium"
  ): Promise<any> {
    try {
      return await this.post("/user-management/clear-override", { userId, accessType });
    } catch (err) {
      console.warn("[clearUserManagementOverride API_BASE error, updating Supabase directly]:", err);
    }

    const now = new Date().toISOString();
    const key = `manual_access_${userId}:${accessType}`;
    const record = {
      id: Date.now(),
      userId: Number(userId),
      accessType,
      status: "off",
      isOverrideBlocked: false,
      startDate: null,
      expiryDate: null,
      isLifetime: false,
      updatedAt: now,
    };
    await this.supabase.post(
      "settings?on_conflict=key",
      { key, value: JSON.stringify(record), updatedAt: now },
      { Prefer: "resolution=merge-duplicates" }
    );
    return { success: true };
  }

  public async setUserManagementAccountStatus(
    userId: number,
    status: "active" | "suspended" | "banned"
  ): Promise<any> {
    try {
      return await this.post("/user-management/account-status", { userId, status });
    } catch (err) {
      console.warn("[setUserManagementAccountStatus API_BASE error, updating Supabase directly]:", err);
    }

    const now = new Date().toISOString();
    await this.supabase.post(
      "settings?on_conflict=key",
      {
        key: `user_account_status_${userId}`,
        value: status,
        updatedAt: now,
      },
      { Prefer: "resolution=merge-duplicates" }
    );
    return { success: true };
  }
}

export const defaultUserService = new UserService();
