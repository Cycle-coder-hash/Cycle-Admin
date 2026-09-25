import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Users,
  Shield,
  CheckCircle2,
  Clock,
  Zap,
  Crown,
  BookOpen,
  Calendar,
  AlertTriangle,
  RotateCcw,
  History,
  X,
  UserCheck,
  Mail,
  User as UserIcon,
  Ban,
  Loader2,
} from "lucide-react";
import {
  fetchUserManagementListApi,
  fetchUserManagementDetailsApi,
  updateUserManagementAccessApi,
  clearUserManagementOverrideApi,
  setUserManagementAccountStatusApi,
} from "../lib/api";

export interface UserAccessState {
  status: "on" | "off";
  accessType: "automatic" | "manual";
  startDate: string | null;
  expiryDate: string | null;
  isLifetime: boolean;
  isOverrideBlocked: boolean;
  automaticActive: boolean;
  automaticExpiry: string | null;
  manualActive: boolean;
  effectiveActive: boolean;
}

export interface UserManagementSummary {
  id: number;
  displayId: string;
  openId: string;
  name: string;
  email: string | null;
  isGoogleAuth: boolean;
  username: string | null;
  avatar: string | null;
  accountStatus: "active" | "suspended" | "banned";
  role: "user" | "admin" | "support";
  createdAt: string;
  lastSignedIn: string;
  courseAccess: UserAccessState;
  proAccess: UserAccessState;
  premiumAccess: UserAccessState;
  isCourseOn: boolean;
  isProOn: boolean;
  isPremiumOn: boolean;
  effectivePlan: string;
}

export interface UserAccessAuditLog {
  id: number;
  userId: number;
  accessType: "course" | "pro" | "premium";
  previousState: string;
  newState: string;
  startDate: string | null;
  expiryDate: string | null;
  isLifetime: boolean;
  adminId: number;
  adminName: string;
  notes?: string;
  createdAt: string;
}

export const UserManagement: React.FC = () => {
  const [usersList, setUsersList] = useState<UserManagementSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [proFilter, setProFilter] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");

  // Selected User Modal
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<UserAccessAuditLog[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal Form States
  const [courseForm, setCourseForm] = useState({
    status: "off" as "on" | "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [proForm, setProForm] = useState({
    status: "off" as "on" | "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [premiumForm, setPremiumForm] = useState({
    status: "off" as "on" | "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [savingAccessType, setSavingAccessType] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUserManagementListApi({
        search: search.trim() || undefined,
        accountStatus: statusFilter !== "all" ? statusFilter : undefined,
        courseAccess: courseFilter !== "all" ? courseFilter : undefined,
        proAccess: proFilter !== "all" ? proFilter : undefined,
        premiumAccess: premiumFilter !== "all" ? premiumFilter : undefined,
      });
      setUsersList(data || []);
    } catch (err: any) {
      console.warn("[loadUsers error]:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, courseFilter, proFilter, premiumFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadUserDetails = useCallback(async (userId: number) => {
    try {
      setLoadingDetails(true);
      const data = await fetchUserManagementDetailsApi(userId);
      if (data?.user) {
        const u = data.user;
        setSelectedUser(u);
        setAuditLogs(data.auditLogs || []);

        setCourseForm({
          status: u.courseAccess.status,
          startDate: u.courseAccess.startDate ? u.courseAccess.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
          expiryDate: u.courseAccess.expiryDate && u.courseAccess.expiryDate !== "LIFETIME" ? u.courseAccess.expiryDate.split("T")[0] : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          isLifetime: u.courseAccess.isLifetime,
          notes: "",
        });

        setProForm({
          status: u.proAccess.status,
          startDate: u.proAccess.startDate ? u.proAccess.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
          expiryDate: u.proAccess.expiryDate && u.proAccess.expiryDate !== "LIFETIME" ? u.proAccess.expiryDate.split("T")[0] : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          isLifetime: u.proAccess.isLifetime,
          notes: "",
        });

        setPremiumForm({
          status: u.premiumAccess.status,
          startDate: u.premiumAccess.startDate ? u.premiumAccess.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
          expiryDate: u.premiumAccess.expiryDate && u.premiumAccess.expiryDate !== "LIFETIME" ? u.premiumAccess.expiryDate.split("T")[0] : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          isLifetime: u.premiumAccess.isLifetime,
          notes: "",
        });
      }
    } catch (err: any) {
      console.warn("[loadUserDetails error]:", err);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails(selectedUserId);
    } else {
      setSelectedUser(null);
      setAuditLogs([]);
    }
  }, [selectedUserId, loadUserDetails]);

  // KPI Metrics Summary
  const stats = useMemo(() => {
    let activeUsers = 0;
    let suspendedUsers = 0;
    let courseUsers = 0;
    let proUsers = 0;
    let premiumUsers = 0;

    for (const u of usersList) {
      if (u.accountStatus === "active") activeUsers++;
      if (u.accountStatus === "suspended" || u.accountStatus === "banned") suspendedUsers++;
      if (u.isCourseOn) courseUsers++;
      if (u.isProOn) proUsers++;
      if (u.isPremiumOn) premiumUsers++;
    }

    return {
      total: usersList.length,
      activeUsers,
      suspendedUsers,
      courseUsers,
      proUsers,
      premiumUsers,
    };
  }, [usersList]);

  const handleSaveAccess = async (accessType: "course" | "pro" | "premium") => {
    if (!selectedUserId) return;
    const form = accessType === "course" ? courseForm : accessType === "pro" ? proForm : premiumForm;

    try {
      setSavingAccessType(accessType);
      setActionSuccess(null);
      setActionError(null);

      await updateUserManagementAccessApi({
        userId: selectedUserId,
        accessType,
        status: form.status,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        expiryDate: form.isLifetime ? null : form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        isLifetime: form.isLifetime,
        isOverrideBlocked: form.status === "off",
        notes: form.notes || undefined,
      });

      setActionSuccess(`${accessType.toUpperCase()} Access updated successfully!`);
      await loadUserDetails(selectedUserId);
      await loadUsers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update access.");
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSavingAccessType(null);
    }
  };

  const handleClearOverride = async (accessType: "course" | "pro" | "premium") => {
    if (!selectedUserId) return;
    try {
      setSavingAccessType(`clear_${accessType}`);
      setActionSuccess(null);
      setActionError(null);

      await clearUserManagementOverrideApi(selectedUserId, accessType);
      setActionSuccess(`Admin override cleared for ${accessType.toUpperCase()}. Automatic entitlement restored!`);
      await loadUserDetails(selectedUserId);
      await loadUsers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Failed to clear override.");
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSavingAccessType(null);
    }
  };

  const handleSetAccountStatus = async (status: "active" | "suspended" | "banned") => {
    if (!selectedUserId) return;
    try {
      setActionSuccess(null);
      setActionError(null);
      await setUserManagementAccountStatusApi(selectedUserId, status);
      setActionSuccess(`Account status updated to ${status.toUpperCase()}!`);
      await loadUserDetails(selectedUserId);
      await loadUsers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update account status.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Users className="text-sky-400" size={24} />
            User Management & Access Control
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Real-time registered users from database. Manually control Course, Pro, and Premium access with full audit history.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition"
        >
          <RotateCcw size={13} className={loading ? "animate-spin text-sky-400" : ""} />
          <span>Sync Realtime</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</div>
          <div className="mt-1 text-2xl font-black text-white">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active Accounts</div>
          <div className="mt-1 text-2xl font-black text-emerald-400">{stats.activeUsers}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Course Access</div>
          <div className="mt-1 text-2xl font-black text-amber-400">{stats.courseUsers}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Pro Active</div>
          <div className="mt-1 text-2xl font-black text-sky-400">{stats.proUsers}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Premium Active</div>
          <div className="mt-1 text-2xl font-black text-purple-400">{stats.premiumUsers}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Suspended / Banned</div>
          <div className="mt-1 text-2xl font-black text-rose-400">{stats.suspendedUsers}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#070e1b] p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by User ID (USER-0001), Name, Gmail, Username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Account Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:border-sky-500"
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="suspended">Status: Suspended</option>
            <option value="banned">Status: Banned</option>
          </select>

          {/* Course Access Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:border-sky-500"
          >
            <option value="all">Course: All</option>
            <option value="on">Course: ON</option>
            <option value="off">Course: OFF</option>
          </select>

          {/* Pro Access Filter */}
          <select
            value={proFilter}
            onChange={(e) => setProFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:border-sky-500"
          >
            <option value="all">Pro: All</option>
            <option value="on">Pro: ON</option>
            <option value="off">Pro: OFF</option>
          </select>

          {/* Premium Access Filter */}
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:border-sky-500"
          >
            <option value="all">Premium: All</option>
            <option value="on">Premium: ON</option>
            <option value="off">Premium: OFF</option>
          </select>

          {(search || statusFilter !== "all" || courseFilter !== "all" || proFilter !== "all" || premiumFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCourseFilter("all");
                setProFilter("all");
                setPremiumFilter("all");
              }}
              className="px-2 py-1 text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#070e1b] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">User ID</th>
                <th className="px-4 py-3.5">User Profile</th>
                <th className="px-4 py-3.5">Gmail / Email</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Course</th>
                <th className="px-4 py-3.5 text-center">Pro</th>
                <th className="px-4 py-3.5 text-center">Premium</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-2 animate-spin text-sky-400" size={24} />
                    Loading registered users from database...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* User ID */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-400">
                        {u.displayId}
                      </span>
                    </td>

                    {/* Profile */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{(u.name || "T")[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            {u.role === "admin" && (
                              <span className="rounded bg-sky-950 px-1 py-0.2 text-[9px] font-black text-sky-300 border border-sky-800/40">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Joined {formatDate(u.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5">
                      {u.email ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-300">{u.email}</span>
                          {u.isGoogleAuth && (
                            <span className="rounded bg-emerald-950/60 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-800">
                              Gmail
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No email</span>
                      )}
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3.5">
                      {u.username ? (
                        <span className="font-mono text-slate-400">@{u.username}</span>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-4 py-3.5 text-center">
                      {u.accountStatus === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/60">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : u.accountStatus === "suspended" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800/60">
                          <AlertTriangle size={10} /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/50 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-800/60">
                          <Ban size={10} /> Banned
                        </span>
                      )}
                    </td>

                    {/* Course Access */}
                    <td className="px-4 py-3.5 text-center">
                      {u.isCourseOn ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-950 px-2.5 py-0.5 text-[11px] font-black text-emerald-300 border border-emerald-800">
                          ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          OFF
                        </span>
                      )}
                    </td>

                    {/* Pro Access */}
                    <td className="px-4 py-3.5 text-center">
                      {u.isProOn ? (
                        <span className="inline-flex items-center rounded-full bg-sky-950 px-2.5 py-0.5 text-[11px] font-black text-sky-300 border border-sky-800">
                          ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          OFF
                        </span>
                      )}
                    </td>

                    {/* Premium Access */}
                    <td className="px-4 py-3.5 text-center">
                      {u.isPremiumOn ? (
                        <span className="inline-flex items-center rounded-full bg-purple-950 px-2.5 py-0.5 text-[11px] font-black text-purple-300 border border-purple-800">
                          ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          OFF
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
                      >
                        <UserCheck size={13} />
                        <span>Manage Access</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAILS & ACCESS CONTROL MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-800 bg-[#070e1b] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    User Details & Access Control
                    {selectedUser && (
                      <span className="font-mono text-xs text-sky-400">
                        ({selectedUser.displayId})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control Course, Pro, and Premium access with automatic priority and override tracking.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification alert */}
            {actionSuccess && (
              <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
                <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-400">
                  <X size={14} />
                </button>
              </div>
            )}
            {actionError && (
              <div className="mx-6 mt-4 flex items-center justify-between rounded-2xl border border-rose-800 bg-rose-950/40 p-3.5 text-xs font-bold text-rose-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                  <span>{actionError}</span>
                </div>
                <button type="button" onClick={() => setActionError(null)} className="text-rose-400">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails || !selectedUser ? (
                <div className="py-16 text-center text-slate-400">
                  <Loader2 className="mx-auto mb-2 animate-spin text-sky-400" size={28} />
                  Loading user data and access states from database...
                </div>
              ) : (
                <>
                  {/* User Profile Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-lg font-black text-white">
                          {selectedUser.avatar ? (
                            <img src={selectedUser.avatar} alt={selectedUser.name} className="h-full w-full object-cover" />
                          ) : (
                            (selectedUser.name || "T")[0].toUpperCase()
                          )}
                        </div>

                        <div>
                          <div className="text-base font-extrabold text-white flex items-center gap-2">
                            {selectedUser.name}
                            <span className="font-mono text-xs font-bold text-sky-400 bg-slate-800 px-2 py-0.5 rounded">
                              {selectedUser.displayId}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail size={12} /> {selectedUser.email || "No email"}
                              {selectedUser.isGoogleAuth && (
                                <span className="rounded bg-emerald-950 px-1 text-[9px] font-black text-emerald-300 border border-emerald-800">
                                  Google
                                </span>
                              )}
                            </span>

                            <span className="flex items-center gap-1 font-mono">
                              <UserIcon size={12} /> @{selectedUser.username || "none"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            <span>
                              <strong>Signup Date:</strong> {formatDateTime(selectedUser.createdAt)}
                            </span>
                            <span>
                              <strong>Last Login:</strong> {formatDateTime(selectedUser.lastSignedIn)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Account Status Control */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Account Status
                        </div>
                        <select
                          value={selectedUser.accountStatus}
                          onChange={(e) => handleSetAccountStatus(e.target.value as any)}
                          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-sky-500"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3 INDEPENDENT ACCESS CONTROLS */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Shield size={14} className="text-sky-400" />
                      Access Management (Independent Controls)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 1. COURSE ACCESS CARD */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1">
                              <BookOpen size={14} /> Course Access
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                selectedUser.courseAccess.effectiveActive
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              Effective: {selectedUser.courseAccess.effectiveActive ? "ON" : "OFF"}
                            </span>
                          </div>

                          {/* Overview Badges */}
                          <div className="mt-3 space-y-1.5 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Automatic:</span>
                              <span className="font-semibold text-slate-200">
                                {selectedUser.courseAccess.automaticActive ? "Active" : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Manual Grant:</span>
                              <span className="font-semibold text-slate-200">
                                {selectedUser.courseAccess.manualActive
                                  ? selectedUser.courseAccess.isLifetime
                                    ? "Active (Lifetime)"
                                    : `Active (until ${formatDate(selectedUser.courseAccess.expiryDate)})`
                                  : "None / OFF"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Admin Override:</span>
                              <span
                                className={`font-black ${
                                  selectedUser.courseAccess.isOverrideBlocked
                                    ? "text-rose-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {selectedUser.courseAccess.isOverrideBlocked ? "BLOCKED" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-200">Access Switch:</span>
                            <div className="flex rounded-lg border border-slate-700 p-0.5 bg-slate-950">
                              <button
                                type="button"
                                onClick={() => setCourseForm((prev) => ({ ...prev, status: "on" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition ${
                                  courseForm.status === "on" ? "bg-emerald-600 text-white shadow" : "text-slate-400"
                                }`}
                              >
                                ON
                              </button>
                              <button
                                type="button"
                                onClick={() => setCourseForm((prev) => ({ ...prev, status: "off" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition ${
                                  courseForm.status === "off" ? "bg-rose-600 text-white shadow" : "text-slate-400"
                                }`}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {/* Dates */}
                          {courseForm.status === "on" && (
                            <div className="mt-3 space-y-2.5 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={courseForm.isLifetime}
                                  onChange={(e) =>
                                    setCourseForm((prev) => ({ ...prev, isLifetime: e.target.checked }))
                                  }
                                  className="rounded border-slate-700 text-sky-500"
                                />
                                <span>Lifetime Access</span>
                              </label>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={courseForm.startDate}
                                  onChange={(e) =>
                                    setCourseForm((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                                />
                              </div>

                              {!courseForm.isLifetime && (
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    value={courseForm.expiryDate}
                                    onChange={(e) =>
                                      setCourseForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Clear override action if blocked */}
                          {selectedUser.courseAccess.isOverrideBlocked && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => handleClearOverride("course")}
                                className="w-full rounded-lg border border-sky-800 bg-sky-950/40 py-1 text-[10px] font-bold text-sky-400 hover:bg-sky-900/40 transition flex items-center justify-center gap-1"
                              >
                                <RotateCcw size={11} />
                                <span>Clear Block & Restore Automatic</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveAccess("course")}
                          disabled={savingAccessType === "course"}
                          className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                        >
                          {savingAccessType === "course" && <Loader2 size={13} className="animate-spin" />}
                          <span>Save Course Access</span>
                        </button>
                      </div>

                      {/* 2. PRO ACCESS CARD */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-sky-400 flex items-center gap-1">
                              <Zap size={14} /> Pro Access
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                selectedUser.proAccess.effectiveActive
                                  ? "bg-sky-950 text-sky-300 border border-sky-800"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              Effective: {selectedUser.proAccess.effectiveActive ? "ON" : "OFF"}
                            </span>
                          </div>

                          {/* Overview Badges */}
                          <div className="mt-3 space-y-1.5 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Automatic:</span>
                              <span className="font-semibold text-slate-200">
                                {selectedUser.proAccess.automaticActive
                                  ? `Active (until ${formatDate(selectedUser.proAccess.automaticExpiry)})`
                                  : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Manual Grant:</span>
                              <span className="font-semibold text-slate-200">
                                {selectedUser.proAccess.manualActive
                                  ? selectedUser.proAccess.isLifetime
                                    ? "Active (Lifetime)"
                                    : `Active (until ${formatDate(selectedUser.proAccess.expiryDate)})`
                                  : "None / OFF"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Admin Override:</span>
                              <span
                                className={`font-black ${
                                  selectedUser.proAccess.isOverrideBlocked
                                    ? "text-rose-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {selectedUser.proAccess.isOverrideBlocked ? "BLOCKED" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-200">Access Switch:</span>
                            <div className="flex rounded-lg border border-slate-700 p-0.5 bg-slate-950">
                              <button
                                type="button"
                                onClick={() => setProForm((prev) => ({ ...prev, status: "on" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition ${
                                  proForm.status === "on" ? "bg-sky-600 text-white shadow" : "text-slate-400"
                                }`}
                              >
                                ON
                              </button>
                              <button
                                type="button"
                                onClick={() => setProForm((prev) => ({ ...prev, status: "off" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition ${
                                  proForm.status === "off" ? "bg-rose-600 text-white shadow" : "text-slate-400"
                                }`}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {/* Dates */}
                          {proForm.status === "on" && (
                            <div className="mt-3 space-y-2.5 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={proForm.isLifetime}
                                  onChange={(e) =>
                                    setProForm((prev) => ({ ...prev, isLifetime: e.target.checked }))
                                  }
                                  className="rounded border-slate-700 text-sky-500"
                                />
                                <span>Lifetime Access</span>
                              </label>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={proForm.startDate}
                                  onChange={(e) =>
                                    setProForm((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                                />
                              </div>

                              {!proForm.isLifetime && (
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    value={proForm.expiryDate}
                                    onChange={(e) =>
                                      setProForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Clear override action if blocked */}
                          {selectedUser.proAccess.isOverrideBlocked && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => handleClearOverride("pro")}
                                className="w-full rounded-lg border border-sky-800 bg-sky-950/40 py-1 text-[10px] font-bold text-sky-400 hover:bg-sky-900/40 transition flex items-center justify-center gap-1"
                              >
                                <RotateCcw size={11} />
                                <span>Clear Block & Restore Automatic</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveAccess("pro")}
                          disabled={savingAccessType === "pro"}
                          className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                        >
                          {savingAccessType === "pro" && <Loader2 size={13} className="animate-spin" />}
                          <span>Save Pro Access</span>
                        </button>
                      </div>

                      {/* 3. PREMIUM ACCESS CARD */}
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-purple-400 flex items-center gap-1">
                              <Crown size={14} /> Premium Access
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                selectedUser.premiumAccess.effectiveActive
                                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              Effective: {selectedUser.premiumAccess.effectiveActive ? "ON" : "OFF"}
                            </span>
                          </div>

                          {/* Overview Badges */}
                          <div className="mt-3 space-y-1.5 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Automatic:</span>
                              <span className="font-semibold text-slate-200">
                                {selectedUser.premiumAccess.automaticActive
                                  ? `Active (until ${formatDate(selectedUser.premiumAccess.automaticExpiry)})`
                                  : "None"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Manual Grant:</span>
                              <span className="font-semibold text-slate-200">
                                {selectedUser.premiumAccess.manualActive
                                  ? selectedUser.premiumAccess.isLifetime
                                    ? "Active (Lifetime)"
                                    : `Active (until ${formatDate(selectedUser.premiumAccess.expiryDate)})`
                                  : "None / OFF"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Admin Override:</span>
                              <span
                                className={`font-black ${
                                  selectedUser.premiumAccess.isOverrideBlocked
                                    ? "text-rose-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {selectedUser.premiumAccess.isOverrideBlocked ? "BLOCKED" : "None"}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                            <span className="text-xs font-bold text-slate-200">Access Switch:</span>
                            <div className="flex rounded-lg border border-slate-700 p-0.5 bg-slate-950">
                              <button
                                type="button"
                                onClick={() => setPremiumForm((prev) => ({ ...prev, status: "on" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition ${
                                  premiumForm.status === "on" ? "bg-purple-600 text-white shadow" : "text-slate-400"
                                }`}
                              >
                                ON
                              </button>
                              <button
                                type="button"
                                onClick={() => setPremiumForm((prev) => ({ ...prev, status: "off" }))}
                                className={`px-2.5 py-1 text-xs font-black rounded-md transition ${
                                  premiumForm.status === "off" ? "bg-rose-600 text-white shadow" : "text-slate-400"
                                }`}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {/* Dates */}
                          {premiumForm.status === "on" && (
                            <div className="mt-3 space-y-2.5 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={premiumForm.isLifetime}
                                  onChange={(e) =>
                                    setPremiumForm((prev) => ({ ...prev, isLifetime: e.target.checked }))
                                  }
                                  className="rounded border-slate-700 text-sky-500"
                                />
                                <span>Lifetime Access</span>
                              </label>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={premiumForm.startDate}
                                  onChange={(e) =>
                                    setPremiumForm((prev) => ({ ...prev, startDate: e.target.value }))
                                  }
                                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                                />
                              </div>

                              {!premiumForm.isLifetime && (
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="date"
                                    value={premiumForm.expiryDate}
                                    onChange={(e) =>
                                      setPremiumForm((prev) => ({ ...prev, expiryDate: e.target.value }))
                                    }
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Clear override action if blocked */}
                          {selectedUser.premiumAccess.isOverrideBlocked && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => handleClearOverride("premium")}
                                className="w-full rounded-lg border border-sky-800 bg-sky-950/40 py-1 text-[10px] font-bold text-sky-400 hover:bg-sky-900/40 transition flex items-center justify-center gap-1"
                              >
                                <RotateCcw size={11} />
                                <span>Clear Block & Restore Automatic</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveAccess("premium")}
                          disabled={savingAccessType === "premium"}
                          className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-2 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                        >
                          {savingAccessType === "premium" && <Loader2 size={13} className="animate-spin" />}
                          <span>Save Premium Access</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACCESS AUDIT HISTORY */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <History size={14} className="text-sky-400" />
                      Internal Access History & Audit Trail (Admin-Only)
                    </h4>

                    {auditLogs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No manual access changes recorded yet for this user.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="pb-2">Access Type</th>
                              <th className="pb-2">Previous State</th>
                              <th className="pb-2">New State</th>
                              <th className="pb-2">Changed By</th>
                              <th className="pb-2">Timestamp</th>
                              <th className="pb-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {auditLogs.map((log) => (
                              <tr key={log.id} className="text-[11px]">
                                <td className="py-2.5 font-bold uppercase text-slate-300">
                                  {log.accessType}
                                </td>
                                <td className="py-2.5 text-slate-400 font-mono">
                                  {log.previousState}
                                </td>
                                <td className="py-2.5 font-bold font-mono text-sky-400">
                                  {log.newState}
                                </td>
                                <td className="py-2.5 text-slate-300">
                                  {log.adminName || `Admin #${log.adminId}`}
                                </td>
                                <td className="py-2.5 text-slate-400">
                                  {formatDateTime(log.createdAt)}
                                </td>
                                <td className="py-2.5 text-slate-400 italic">
                                  {log.notes || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-800 px-6 py-3 bg-slate-900/40">
              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
