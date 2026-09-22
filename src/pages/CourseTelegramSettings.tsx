import React, { useState, useEffect } from "react";
import {
  Send,
  Power,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Clock,
  Layers,
} from "lucide-react";
import { CourseTelegramConfig, defaultCourseTelegramConfig } from "../lib/api";

interface CourseTelegramSettingsProps {
  config: CourseTelegramConfig;
  onSave: (config: CourseTelegramConfig) => Promise<void>;
  onReload?: () => void;
  isSaving?: boolean;
}

export const CourseTelegramSettings: React.FC<CourseTelegramSettingsProps> = ({
  config,
  onSave,
  onReload,
  isSaving = false,
}) => {
  const [form, setForm] = useState<CourseTelegramConfig>({
    ...defaultCourseTelegramConfig,
    ...(config || {}),
  });

  const [previewLang, setPreviewLang] = useState<"en" | "bn">("bn");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        ...defaultCourseTelegramConfig,
        ...config,
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const previewTitle = previewLang === "bn" ? form.titleBn || form.titleEn : form.titleEn;
  const previewMessage = previewLang === "bn" ? form.messageBn || form.messageEn : form.messageEn;
  const previewJoin = previewLang === "bn" ? form.joinButtonTextBn || form.joinButtonTextEn : form.joinButtonTextEn;
  const previewDismiss = previewLang === "bn" ? form.dismissButtonTextBn || form.dismissButtonTextEn : form.dismissButtonTextEn;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Course Telegram Community Settings
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                form.enabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {form.enabled ? "Popup Active" : "Popup Disabled"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Configure the automated post-approval modal inviting enrolled students into the official Course Telegram group.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reload Saved</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>{isSaving ? "Saving..." : "Save Telegram Settings"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Course Telegram settings saved and synced directly to Supabase & Live Web application!</span>
        </div>
      )}

      {/* Main Grid: Settings Form & Live Preview */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        
        {/* Left Column: Form Settings (7 cols) */}
        <div className="space-y-6 xl:col-span-7">
          
          {/* Main Activation Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Power size={16} className={form.enabled ? "text-emerald-400" : "text-slate-500"} />
                  Enable Course Telegram Modal
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  When ON, students whose payments are approved for Course / Full Bundle will receive this popup upon entering their dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setForm((prev: CourseTelegramConfig) => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.enabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Telegram URL */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300">
                Official Telegram Community URL
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Send size={15} />
                </div>
                <input
                  type="url"
                  placeholder="https://t.me/+AbCdEfGhIjK or https://t.me/your_course_channel"
                  value={form.telegramUrl}
                  onChange={(e) => setForm({ ...form, telegramUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {!form.telegramUrl.trim() ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} />
                    Link is currently empty. Enter your official course group or invite link before launching.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Verified Link: <a href={form.telegramUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">{form.telegramUrl} <ExternalLink size={10} /></a>
                  </span>
                )}
              </p>
            </div>

            {/* Display Mode */}
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers size={14} className="text-sky-400" />
                  Display Mode (প্রদর্শন মোড)
                </label>
                <select
                  value={form.displayMode}
                  onChange={(e) => setForm({ ...form, displayMode: e.target.value as "once" | "until_joined" })}
                  className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="once">Show Once (একবার দেখাবে - dismiss করলে আর দেখাবে না)</option>
                  <option value="until_joined">Show Until Joined (যুক্ত না হওয়া পর্যন্ত বারবার দেখাবে)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  {form.displayMode === "once"
                    ? "Popup appears once per approved course order. Dismissing it marks it acknowledged."
                    : "Popup will continue to show on subsequent dashboard visits until student clicks Join Telegram."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-sky-400" />
                  Popup Delay (Seconds)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={form.popupDelay ?? 0}
                  onChange={(e) => setForm({ ...form, popupDelay: Number(e.target.value) || 0 })}
                  className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                  placeholder="0 (Instant)"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Seconds to wait after student enters dashboard before showing modal (0 = instant).
                </p>
              </div>
            </div>
          </div>

          {/* Bilingual Modal Content Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white">
                Bilingual Popup Content (ইংরেজি ও বাংলা টেক্সট)
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Customize titles, messages, and button labels in both English and Bangla.
              </p>
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Title (Bangla - বাংলা)
                </label>
                <input
                  type="text"
                  value={form.titleBn}
                  onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Message (English)
                </label>
                <textarea
                  rows={4}
                  value={form.messageEn}
                  onChange={(e) => setForm({ ...form, messageEn: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-3 text-xs font-medium text-white focus:border-sky-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Message (Bangla - বাংলা)
                </label>
                <textarea
                  rows={4}
                  value={form.messageBn}
                  onChange={(e) => setForm({ ...form, messageBn: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-3 text-xs font-medium text-white focus:border-sky-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Button Texts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Join Button Text (EN / BN)
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.joinButtonTextEn}
                    placeholder="EN: JOIN TELEGRAM"
                    onChange={(e) => setForm({ ...form, joinButtonTextEn: e.target.value })}
                    className="rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={form.joinButtonTextBn}
                    placeholder="BN: TELEGRAM এ যুক্ত হোন"
                    onChange={(e) => setForm({ ...form, joinButtonTextBn: e.target.value })}
                    className="rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Dismiss Button Text (EN / BN)
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.dismissButtonTextEn}
                    placeholder="EN: MAYBE LATER"
                    onChange={(e) => setForm({ ...form, dismissButtonTextEn: e.target.value })}
                    className="rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={form.dismissButtonTextBn}
                    placeholder="BN: পরে যুক্ত হব"
                    onChange={(e) => setForm({ ...form, dismissButtonTextBn: e.target.value })}
                    className="rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Student Preview (5 cols) */}
        <div className="space-y-4 xl:col-span-5">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                <Eye size={15} className="text-sky-400" />
                <span>Student Experience Live Preview</span>
              </div>
              
              <div className="flex items-center rounded-xl bg-slate-800 p-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewLang("bn")}
                  className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer ${
                    previewLang === "bn" ? "bg-sky-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang("en")}
                  className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer ${
                    previewLang === "en" ? "bg-sky-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Mock Dashboard Background with Modal Overlay */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#070e1b] p-5 shadow-2xl">
              
              {/* Top Bar Accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

              {/* Status Indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Sparkles size={11} className="text-sky-400" />
                  Live Modal Preview
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    form.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {form.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* Modal Box */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 p-5 shadow-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                      <Sparkles size={10} />
                      <span>{previewLang === "bn" ? "কোর্স অ্যাক্সেস ভেরিফায়েড" : "Course Access Verified"}</span>
                    </div>
                    <h4 className="mt-1 text-sm font-black text-white">
                      {previewTitle}
                    </h4>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 mb-4 text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                  {previewMessage}
                  
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                    <span>{previewLang === "bn" ? "শুধুমাত্র অনুমোদিত শিক্ষার্থীদের জন্য প্রাইভেট কমিউনিটি" : "Private Community exclusively for enrolled students"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 text-center rounded-xl border border-slate-700 text-slate-400 text-xs font-bold">
                    {previewDismiss}
                  </div>
                  <div className="flex-1 py-2 text-center rounded-xl bg-sky-500 text-slate-950 text-xs font-black shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5">
                    <Send size={12} />
                    <span>{previewJoin}</span>
                  </div>
                </div>
              </div>

              {/* Helper notice */}
              <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Rules Applied:</div>
                <div>• Appears ONLY for Course and Full Bundle purchases (never PDF-only).</div>
                <div>• Triggered upon Admin Payment Approval (never on pending TrxID).</div>
                <div>• Display Mode: <b className="text-white uppercase">{form.displayMode}</b></div>
                <div>• URL: <b className="text-sky-400">{form.telegramUrl || "(Empty - not yet configured)"}</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
