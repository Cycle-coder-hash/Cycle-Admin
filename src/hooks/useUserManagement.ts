import { useState, useEffect, useCallback, useMemo } from "react";
import { services } from "../services";
import {
  UserManagementSummary,
  UserAccessAuditLog,
} from "../pages/UserManagement";

export interface UserAccessFormState {
  status: "on" | "off";
  startDate: string;
  expiryDate: string;
  isLifetime: boolean;
  notes: string;
}

export function useUserManagement() {
  const [usersList, setUsersList] = useState<UserManagementSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [bullPrintFilter, setBullPrintFilter] = useState("all");
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
  const [courseForm, setCourseForm] = useState<UserAccessFormState>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [cycleBullPrintForm, setCycleBullPrintForm] = useState<UserAccessFormState>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [proForm, setProForm] = useState<UserAccessFormState>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [premiumForm, setPremiumForm] = useState<UserAccessFormState>({
    status: "off",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    isLifetime: false,
    notes: "",
  });

  const [savingAccessType, setSavingAccessType] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.users.fetchUserManagementList({
        search: search.trim() || undefined,
        accountStatus: statusFilter !== "all" ? statusFilter : undefined,
        courseAccess: courseFilter !== "all" ? courseFilter : undefined,
        cycleBullPrintAccess: bullPrintFilter !== "all" ? bullPrintFilter : undefined,
        proAccess: proFilter !== "all" ? proFilter : undefined,
        premiumAccess: premiumFilter !== "all" ? premiumFilter : undefined,
      });
      setUsersList(data || []);
    } catch (err: any) {
      console.warn("[loadUsers error]:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, courseFilter, bullPrintFilter, proFilter, premiumFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadUserDetails = useCallback(async (userId: number) => {
    try {
      setLoadingDetails(true);
      const data = await services.users.fetchUserManagementDetails(userId);
      if (data?.user) {
        const u = data.user;
        setSelectedUser(u);
        setAuditLogs(data.auditLogs || []);

        const basicState = u.basicToAdvanceAccess || u.courseAccess;
        setCourseForm({
          status: basicState.status,
          startDate: basicState.startDate
            ? basicState.startDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          expiryDate:
            basicState.expiryDate && basicState.expiryDate !== "LIFETIME"
              ? basicState.expiryDate.split("T")[0]
              : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          isLifetime: basicState.isLifetime,
          notes: "",
        });

        const bp = u.cycleBullPrintAccess;
        setCycleBullPrintForm({
          status: bp?.status ?? "off",
          startDate: bp?.startDate
            ? bp.startDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          expiryDate:
            bp?.expiryDate && bp.expiryDate !== "LIFETIME"
              ? bp.expiryDate.split("T")[0]
              : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          isLifetime: bp?.isLifetime ?? false,
          notes: "",
        });

        setProForm({
          status: u.proAccess.status,
          startDate: u.proAccess.startDate
            ? u.proAccess.startDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          expiryDate:
            u.proAccess.expiryDate && u.proAccess.expiryDate !== "LIFETIME"
              ? u.proAccess.expiryDate.split("T")[0]
              : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          isLifetime: u.proAccess.isLifetime,
          notes: "",
        });

        setPremiumForm({
          status: u.premiumAccess.status,
          startDate: u.premiumAccess.startDate
            ? u.premiumAccess.startDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          expiryDate:
            u.premiumAccess.expiryDate && u.premiumAccess.expiryDate !== "LIFETIME"
              ? u.premiumAccess.expiryDate.split("T")[0]
              : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
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

  const stats = useMemo(() => {
    let activeUsers = 0;
    let suspendedUsers = 0;
    let courseUsers = 0;
    let bullPrintUsers = 0;
    let proUsers = 0;
    let premiumUsers = 0;

    for (const u of usersList) {
      if (u.accountStatus === "active") activeUsers++;
      if (u.accountStatus === "suspended" || u.accountStatus === "banned") suspendedUsers++;
      if (u.isBasicToAdvanceOn ?? u.isCourseOn) courseUsers++;
      if (u.isCycleBullPrintOn) bullPrintUsers++;
      if (u.isProOn) proUsers++;
      if (u.isPremiumOn) premiumUsers++;
    }

    return {
      total: usersList.length,
      activeUsers,
      suspendedUsers,
      courseUsers,
      bullPrintUsers,
      proUsers,
      premiumUsers,
    };
  }, [usersList]);

  const handleSaveAccess = async (accessType: "course" | "basic_to_advance" | "cycle_bull_print" | "pro" | "premium") => {
    if (!selectedUserId) return;
    const form =
      accessType === "cycle_bull_print"
        ? cycleBullPrintForm
        : accessType === "course" || accessType === "basic_to_advance"
        ? courseForm
        : accessType === "pro"
        ? proForm
        : premiumForm;

    try {
      setSavingAccessType(accessType);
      setActionSuccess(null);
      setActionError(null);

      await services.users.updateUserManagementAccess({
        userId: selectedUserId,
        accessType,
        status: form.status,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        expiryDate: form.isLifetime ? null : form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        isLifetime: form.isLifetime,
        isOverrideBlocked: false,
        notes: form.notes || undefined,
      });

      const label =
        accessType === "cycle_bull_print"
          ? "CYCLE BULL PRINT"
          : accessType === "course" || accessType === "basic_to_advance"
          ? "BASIC TO ADVANCE"
          : accessType.toUpperCase();
      setActionSuccess(`${label} Access updated successfully!`);
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

  const handleClearOverride = async (accessType: "course" | "basic_to_advance" | "cycle_bull_print" | "pro" | "premium") => {
    if (!selectedUserId) return;
    try {
      setSavingAccessType(`clear_${accessType}`);
      setActionSuccess(null);
      setActionError(null);

      await services.users.clearUserManagementOverride(selectedUserId, accessType);
      const label =
        accessType === "cycle_bull_print"
          ? "CYCLE BULL PRINT"
          : accessType === "course" || accessType === "basic_to_advance"
          ? "BASIC TO ADVANCE"
          : accessType.toUpperCase();
      setActionSuccess(`Admin override cleared for ${label}. Automatic entitlement restored!`);
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
      await services.users.setUserManagementAccountStatus(selectedUserId, status);
      setActionSuccess(`Account status updated to ${status.toUpperCase()}!`);
      await loadUserDetails(selectedUserId);
      await loadUsers();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update account status.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  return {
    usersList,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    bullPrintFilter,
    setBullPrintFilter,
    proFilter,
    setProFilter,
    premiumFilter,
    setPremiumFilter,
    selectedUserId,
    setSelectedUserId,
    loadingDetails,
    selectedUser,
    auditLogs,
    actionSuccess,
    setActionSuccess,
    actionError,
    setActionError,
    courseForm,
    setCourseForm,
    cycleBullPrintForm,
    setCycleBullPrintForm,
    proForm,
    setProForm,
    premiumForm,
    setPremiumForm,
    savingAccessType,
    loadUsers,
    loadUserDetails,
    stats,
    handleSaveAccess,
    handleClearOverride,
    handleSetAccountStatus,
  };
}
