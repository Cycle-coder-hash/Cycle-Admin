import { useState, useEffect, useCallback } from "react";
import { Student } from "../lib/types";
import { services } from "../services";

export interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  reload: () => Promise<void>;
  grantAccess: (studentId: number, bundleId: number) => Promise<boolean>;
  updateRole: (studentId: number, role: "user" | "support" | "admin") => Promise<boolean>;
  actionMessage: string | null;
  clearActionMessage: () => void;
}

export function useStudents(): UseStudentsReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.users.fetchUsers();
      setStudents(data);
    } catch (err: any) {
      console.warn("[useStudents load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const grantAccess = useCallback(
    async (studentId: number, bundleId: number) => {
      try {
        await services.users.grantAccess(studentId, bundleId);
        setActionMessage("Access granted to student in DB.");
        setTimeout(() => setActionMessage(null), 4000);
        await reload();
        return true;
      } catch (err: any) {
        alert("Failed to grant access: " + err.message);
        return false;
      }
    },
    [reload]
  );

  const updateRole = useCallback(
    async (studentId: number, role: "user" | "support" | "admin") => {
      try {
        await services.users.updateRole(studentId, role);
        setActionMessage("User role updated in DB.");
        setTimeout(() => setActionMessage(null), 4000);
        await reload();
        return true;
      } catch (err: any) {
        alert("Failed to update role: " + err.message);
        return false;
      }
    },
    [reload]
  );

  return {
    students,
    loading,
    reload,
    grantAccess,
    updateRole,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
  };
}
