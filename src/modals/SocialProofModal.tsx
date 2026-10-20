import React, { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle2, AlertCircle, Camera, ShieldCheck, Loader2 } from "lucide-react";
import { SocialProofEntry, defaultSocialProofService } from "../services/SocialProofService";

interface SocialProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SocialProofEntry, "order"> & { order?: number }) => Promise<void>;
  entry: SocialProofEntry | null;
  isSaving?: boolean;
}

export const SocialProofModal: React.FC<SocialProofModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entry,
  isSaving = false,
}) => {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [badge, setBadge] = useState<"FREE" | "PRO" | "PREMIUM" | "STUDENT">("STUDENT");
  const [reviewText, setReviewText] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) {
      setName(entry.name || "");
      setAvatarUrl(entry.avatarUrl || "");
      setBadge(entry.badge || "STUDENT");
      setReviewText(entry.reviewText || "");
      setHasConsent(entry.hasConsent ?? true);
      setIsActive(entry.isActive ?? true);
    } else {
      setName("");
      setAvatarUrl("");
      setBadge("STUDENT");
      setReviewText("");
      setHasConsent(false);
      setIsActive(true);
    }
    setError(null);
  }, [entry, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setIsUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const cdnUrl = await defaultSocialProofService.uploadAvatar(dataUrl);
        setAvatarUrl(cdnUrl || dataUrl);
      } catch (err) {
        console.warn("[Avatar upload failed, falling back to data URL]:", err);
        setAvatarUrl(dataUrl);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a trader / person name.");
      return;
    }
    if (!avatarUrl.trim()) {
      setError("Please upload an avatar photo or provide an image URL.");
      return;
    }
    if (!hasConsent) {
      setError("Explicit consent is required before publicly featuring a trader.");
      return;
    }

    try {
      await onSave({
        id: entry?.id || `sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: entry?.userId || null,
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
        badge,
        reviewText: reviewText.trim() || undefined,
        hasConsent: true,
        isActive,
        order: entry?.order,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save entry");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#070e1b] p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white">
              {entry ? "Edit Featured Trader" : "Add Featured Trader"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure person details for the public Social Proof Row.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Avatar Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Trader Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0 rounded-full border-2 border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="size-full object-cover" />
                ) : (
                  <Camera size={24} className="text-slate-600" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={18} className="animate-spin text-sky-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                >
                  <Upload size={13} />
                  <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                </button>
                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shakib Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-white placeholder:text-slate-600 outline-none focus:border-sky-500"
            />
          </div>

          {/* Badge Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subscription / Role Badge
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["PREMIUM", "PRO", "STUDENT", "FREE"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBadge(b)}
                  className={`rounded-xl border py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    badge === b
                      ? b === "PREMIUM"
                        ? "border-amber-500 bg-amber-500/20 text-amber-300"
                        : b === "PRO"
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                        : b === "STUDENT"
                        ? "border-sky-500 bg-sky-500/20 text-sky-300"
                        : "border-slate-500 bg-slate-800 text-slate-300"
                      : "border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Review / Testimonial Quote */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Short Review / Quote (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Cycle of Chart completely transformed my algorithmic risk management and daily discipline."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-sky-500"
            />
          </div>

          {/* Verified Consent Checkbox */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  Confirmed Explicit Consent
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  The student/trader has given consent to have their name, avatar, and testimonial displayed publicly on the platform.
                </p>
              </div>
            </label>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <span className="text-xs font-bold text-slate-300">Visible on Public Row</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-5 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>{isSaving ? "Saving..." : entry ? "Update Person" : "Add Person"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
