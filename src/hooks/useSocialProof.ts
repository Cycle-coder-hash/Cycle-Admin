import { useState, useEffect, useCallback } from "react";
import {
  defaultSocialProofService,
  SocialProofSettings,
  SocialProofEntry,
  DEFAULT_SOCIAL_PROOF_SETTINGS,
} from "../services/SocialProofService";

export function useSocialProof() {
  const [settings, setSettings] = useState<SocialProofSettings>(DEFAULT_SOCIAL_PROOF_SETTINGS);
  const [entries, setEntries] = useState<SocialProofEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const clearActionMessage = useCallback(() => setActionMessage(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedEntries] = await Promise.all([
        defaultSocialProofService.fetchSettings(),
        defaultSocialProofService.fetchEntries(),
      ]);
      setSettings(fetchedSettings);
      setEntries(fetchedEntries);
    } catch (err: any) {
      console.error("[useSocialProof loadData error]:", err);
      setActionMessage({ type: "error", text: "Failed to load Social Proof data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSettings = useCallback(async (newSettings: SocialProofSettings) => {
    setIsSavingSettings(true);
    try {
      const saved = await defaultSocialProofService.saveSettings(newSettings);
      setSettings(saved);
      setActionMessage({ type: "success", text: "Social Proof settings saved successfully!" });
      return saved;
    } catch (err: any) {
      console.error("[useSocialProof updateSettings error]:", err);
      setActionMessage({ type: "error", text: err.message || "Failed to save Social Proof settings" });
      throw err;
    } finally {
      setIsSavingSettings(false);
    }
  }, []);

  const saveEntry = useCallback(async (entryData: Omit<SocialProofEntry, "order"> & { order?: number }) => {
    setIsSavingEntry(true);
    try {
      const current = [...entries];
      const existingIdx = current.findIndex((e) => e.id === entryData.id);
      let updatedList: SocialProofEntry[];

      if (existingIdx >= 0) {
        current[existingIdx] = {
          ...current[existingIdx],
          ...entryData,
          order: entryData.order ?? current[existingIdx].order,
        };
        updatedList = current;
      } else {
        const newEntry: SocialProofEntry = {
          ...entryData,
          order: entryData.order ?? current.length + 1,
        };
        updatedList = [...current, newEntry];
      }

      // Re-normalize order
      updatedList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      updatedList.forEach((e, idx) => {
        e.order = idx + 1;
      });

      await defaultSocialProofService.saveEntries(updatedList);
      setEntries(updatedList);
      setActionMessage({
        type: "success",
        text: existingIdx >= 0 ? "Person updated successfully!" : "Person added to Social Proof successfully!",
      });
      return updatedList;
    } catch (err: any) {
      console.error("[useSocialProof saveEntry error]:", err);
      setActionMessage({ type: "error", text: err.message || "Failed to save entry" });
      throw err;
    } finally {
      setIsSavingEntry(false);
    }
  }, [entries]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const filtered = entries.filter((e) => e.id !== id);
      filtered.forEach((e, idx) => {
        e.order = idx + 1;
      });
      await defaultSocialProofService.saveEntries(filtered);
      setEntries(filtered);
      setActionMessage({ type: "success", text: "Person removed from Social Proof" });
    } catch (err: any) {
      console.error("[useSocialProof deleteEntry error]:", err);
      setActionMessage({ type: "error", text: err.message || "Failed to delete entry" });
      throw err;
    }
  }, [entries]);

  const toggleActive = useCallback(async (id: string) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e));
    try {
      await defaultSocialProofService.saveEntries(updated);
      setEntries(updated);
      setActionMessage({ type: "success", text: "Status updated" });
    } catch (err: any) {
      console.error("[useSocialProof toggleActive error]:", err);
      setActionMessage({ type: "error", text: "Failed to update status" });
    }
  }, [entries]);

  const moveEntry = useCallback(async (id: string, direction: "up" | "down") => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === entries.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const reordered = [...entries];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    reordered.forEach((e, i) => {
      e.order = i + 1;
    });

    try {
      await defaultSocialProofService.saveEntries(reordered);
      setEntries(reordered);
    } catch (err: any) {
      console.error("[useSocialProof moveEntry error]:", err);
      setActionMessage({ type: "error", text: "Failed to reorder entries" });
    }
  }, [entries]);

  return {
    settings,
    entries,
    loading,
    isSavingSettings,
    isSavingEntry,
    actionMessage,
    clearActionMessage,
    updateSettings,
    saveEntry,
    deleteEntry,
    toggleActive,
    moveEntry,
    reload: loadData,
  };
}
