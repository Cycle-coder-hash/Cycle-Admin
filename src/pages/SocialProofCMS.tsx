import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  Star,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  Quote,
  Loader2,
} from "lucide-react";
import { useSocialProof } from "../hooks/useSocialProof";
import { SocialProofModal } from "../modals/SocialProofModal";
import { SocialProofEntry } from "../services/SocialProofService";

export const SocialProofCMS: React.FC = () => {
  const {
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
    reload,
  } = useSocialProof();

  // Settings local state
  const [isVisible, setIsVisible] = useState(settings.isVisible);
  const [trustedCountText, setTrustedCountText] = useState(settings.trustedCountText);
  const [showStarRating, setShowStarRating] = useState(settings.showStarRating);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SocialProofEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(settings.isVisible);
    setTrustedCountText(settings.trustedCountText || "");
    setShowStarRating(settings.showStarRating);
    setIsSettingsDirty(false);
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        isVisible,
        trustedCountText: trustedCountText.trim(),
        showStarRating,
      });
      setIsSettingsDirty(false);
    } catch {}
  };

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: SocialProofEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const activeCount = entries.filter((e) => e.isActive).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Message */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-bold ${
            actionMessage.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={clearActionMessage}
            className="text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">Social Proof Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage the public Social Proof Row displaying verified active traders, ratings, and quotes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSavingSettings || !isSettingsDirty}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition cursor-pointer"
          >
            {isSavingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Global Row Settings Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-5 shadow-lg">
        <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Users size={16} className="text-sky-400" />
          <span>Row Configuration</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Visibility Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {isVisible ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-500" />}
                <span>Public Visibility</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isVisible ? "Active & rendered on homepage" : "Hidden from public website"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => {
                  setIsVisible(e.target.checked);
                  setIsSettingsDirty(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Trusted Count Headline */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <label className="block text-xs font-bold text-white mb-1">
              Member Count Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Join 1,200+ Active Traders"
              value={trustedCountText}
              onChange={(e) => {
                setTrustedCountText(e.target.value);
                setIsSettingsDirty(true);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-sky-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Leave blank to use default count.</p>
          </div>

          {/* 5-Star Rating Badge Toggle */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span>5-Star Rating Badge</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {showStarRating ? "Displays 5.0 (500+ Reviews)" : "Rating badge hidden"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showStarRating}
                onChange={(e) => {
                  setShowStarRating(e.target.checked);
                  setIsSettingsDirty(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Featured Traders List */}
      <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Users size={16} className="text-sky-400" />
              <span>Featured Traders ({activeCount} Active / {entries.length} Total)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag or use arrows to order how avatars appear from left to right.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Trader</span>
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
            <Users size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No featured traders added yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Add Trader&quot; to feature your first student or trader in the Social Proof Row.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            {entries.map((entry, index) => {
              const isFirst = index === 0;
              const isLast = index === entries.length - 1;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3.5 transition-colors ${
                    entry.isActive ? "hover:bg-slate-900/60" : "bg-slate-950/80 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Left: Reorder & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => moveEntry(entry.id, "up")}
                        className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => moveEntry(entry.id, "down")}
                        className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {/* Order index pill */}
                    <span className="text-[10px] font-mono text-slate-500 w-4 text-center">
                      #{index + 1}
                    </span>

                    {/* Avatar */}
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.name}
                        className="size-10 rounded-full object-cover border border-slate-700 bg-slate-900 shrink-0"
                      />
                    ) : (
                      <div className="size-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                        {(entry.name || "CT").slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">{entry.name}</span>
                        {entry.role && <span className="text-[10px] text-slate-400">({entry.role})</span>}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                            entry.badge === "PREMIUM"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                              : entry.badge === "PRO"
                              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                              : entry.badge === "STUDENT"
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                              : "border-slate-700 bg-slate-800 text-slate-300"
                          }`}
                        >
                          {entry.badge}
                        </span>
                        {entry.hasConsent && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold" title="Verified Consent Confirmed">
                            <ShieldCheck size={11} />
                            Consent
                          </span>
                        )}
                      </div>

                      {entry.reviewText && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5 flex items-center gap-1">
                          <Quote size={10} className="shrink-0 text-slate-500" />
                          <span>&quot;{entry.reviewText}&quot;</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {/* Active Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleActive(entry.id)}
                      className={`rounded-xl px-2.5 py-1 text-[10px] font-bold border transition cursor-pointer ${
                        entry.isActive
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {entry.isActive ? "Active" : "Inactive"}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(entry)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                      title="Edit Person"
                    >
                      <Edit2 size={14} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(entry.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Person"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#070e1b] p-5 shadow-2xl text-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Remove Person?</span>
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Are you sure you want to remove this trader from the Social Proof Row?
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteEntry(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-xl bg-rose-500 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-600 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <SocialProofModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          await saveEntry(data);
        }}
        entry={editingEntry}
        isSaving={isSavingEntry}
      />
    </div>
  );
};
