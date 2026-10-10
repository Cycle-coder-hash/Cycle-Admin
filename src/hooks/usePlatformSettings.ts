import { useState, useEffect, useCallback } from "react";
import { services, PaymentSettingsConfig, defaultPaymentConfig } from "../services";
import { AuditEvent } from "../lib/types";

export interface UsePlatformSettingsReturn {
  config: PaymentSettingsConfig;
  logs: AuditEvent[];
  isSaving: boolean;
  loading: boolean;
  saveSettings: (newConfig: PaymentSettingsConfig) => Promise<boolean>;
  reload: () => Promise<void>;
  actionMessage: string | null;
  clearActionMessage: () => void;
}

export function usePlatformSettings(): UsePlatformSettingsReturn {
  const [config, setConfig] = useState<PaymentSettingsConfig>(defaultPaymentConfig);
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentData, logsData] = await Promise.allSettled([
        services.settings.fetchPaymentSettings(),
        services.settings.fetchAuditLogs(),
      ]);

      if (paymentData.status === "fulfilled" && paymentData.value) {
        setConfig(paymentData.value);
      }
      if (logsData.status === "fulfilled" && logsData.value) {
        setLogs(logsData.value);
      }
    } catch (err: any) {
      console.warn("[usePlatformSettings load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveSettings = useCallback(async (newConfig: PaymentSettingsConfig) => {
    try {
      setIsSaving(true);
      const updated = await services.settings.updatePaymentSettings(newConfig);
      setConfig(updated || newConfig);
      setActionMessage("Payment gateway settings updated and synchronized with database!");
      setTimeout(() => setActionMessage(null), 4000);
      return true;
    } catch (err: any) {
      alert("Failed to save payment settings: " + err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    config,
    logs,
    isSaving,
    loading,
    saveSettings,
    reload,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
  };
}
