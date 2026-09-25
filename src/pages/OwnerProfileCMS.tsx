import React, { useState, useEffect } from "react";
import {
  Camera,
  Upload,
  Trash2,
  UserCheck,
  FileText,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  ShieldCheck,
  Users,
  GraduationCap,
  Sparkles,
  Target,
  Zap,
  Activity,
  Globe,
  RefreshCw,
  ExternalLink,
  Send,
  Mail,
  Eye,
  EyeOff,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { AnimatedRgbBorder } from "../components/AnimatedRgbBorder";

export const TikTokIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.27 6.27 0 0 0 1.93-4.52V8.69a8.18 8.18 0 0 0 4.79 1.54V6.78a4.85 4.85 0 0 1-.99-.09Z" />
  </svg>
);

export const YoutubeIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const InstagramIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const XTwitterIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const FacebookIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export interface OwnerProfileData {
  isVisible?: boolean;
  name: string;
  role: string;
  roleBn?: string;
  bioEn: string;
  bioBn?: string;
  detailsEn?: string;
  detailsBn?: string;
  photoUrl: string;
  experienceYears?: string;
  studentsCount?: string;
  tradingStyle?: string;
  signatureQuoteEn?: string;
  signatureQuoteBn?: string;
  telegram?: string;
  tiktok?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  email?: string;
  showExperienceCard: boolean;
  experienceLabel?: string;
  experienceIcon?: string;
  showMentoredCard: boolean;
  mentoredLabel?: string;
  mentoredIcon?: string;
  showMethodologyCard: boolean;
  methodologyLabel?: string;
  methodologyIcon?: string;
  showDetailsParagraph: boolean;
}

interface OwnerProfileCMSProps {
  profile: OwnerProfileData;
  onSave: (data: OwnerProfileData) => Promise<void>;
  onReload?: () => void;
  isSaving?: boolean;
}

export const renderOwnerStatIcon = (iconName?: string, className: string = "size-4") => {
  switch (iconName) {
    case "clock":
      return <Clock className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "trending":
    case "trending-up":
      return <TrendingUp className={className} />;
    case "shield":
      return <ShieldCheck className={className} />;
    case "users":
      return <Users className={className} />;
    case "userCheck":
    case "user-check":
      return <UserCheck className={className} />;
    case "graduation":
    case "graduation-cap":
      return <GraduationCap className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "target":
      return <Target className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "award":
    default:
      return <Award className={className} />;
  }
};

export const OwnerProfileCMS: React.FC<OwnerProfileCMSProps> = ({
  profile,
  onSave,
  onReload,
  isSaving,
}) => {
  const [form, setForm] = useState<OwnerProfileData>({ ...profile });
  const [previewLang, setPreviewLang] = useState<"en" | "bn">("en");

  useEffect(() => {
    if (profile) {
      setForm({ ...profile });
    }
  }, [profile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Owner Profile & Founder CMS
            </h2>
            {form.isVisible !== false ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live on Public Website
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <EyeOff size={12} />
                Hidden from Website
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Edit the founder's biography, credentials, photo, and visibility displayed on the main website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReload}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition"
          >
            <RefreshCw size={13} />
            <span>Reload Saved</span>
          </button>

          <a
            href="http://localhost:3000/#owner-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition"
          >
            <span>View Live Site</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website Section Visibility Card */}
            <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${form.isVisible !== false ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>
                    {form.isVisible !== false ? <Eye size={20} /> : <EyeOff size={20} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Website Section Visibility
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {form.isVisible !== false
                        ? "Founder section is currently visible on the landing page."
                        : "Founder section is hidden from the landing page."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isVisible: prev.isVisible === false ? true : false }))}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.isVisible !== false ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      form.isVisible !== false ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Photo Card */}
            <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Camera size={18} className="text-sky-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Profile Photo Management
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-sky-500/50 bg-slate-900 flex items-center justify-center shrink-0">
                  {form.photoUrl ? (
                    <img
                      src={form.photoUrl}
                      alt="Owner"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <UserCheck size={36} className="text-slate-600" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition">
                      <Upload size={14} />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    {form.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                        className="flex items-center gap-1 rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-900/50 transition"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={form.photoUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
                  />

                  {form.photoUrl && form.photoUrl.startsWith("data:image/") && (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2.5 text-[11px] font-semibold text-sky-300 flex items-center gap-2">
                      <Sparkles size={14} className="text-sky-400 shrink-0" />
                      <span>Local image file loaded. Clicking "Save Owner Profile" will automatically upload to ImgBB Cloud CDN and store a permanent fast URL.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Identity & Title */}
            <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <UserCheck size={18} className="text-sky-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Name & Institutional Title
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm font-bold text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-semibold text-white outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300">Title (Bengali)</label>
                  <input
                    type="text"
                    value={form.roleBn || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, roleBn: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-semibold text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Biography Description */}
            <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileText size={18} className="text-sky-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Founder Description
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Description (English) *</label>
                <textarea
                  rows={4}
                  required
                  value={form.bioEn}
                  onChange={(e) => setForm((prev) => ({ ...prev, bioEn: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Description (Bengali)</label>
                <textarea
                  rows={4}
                  value={form.bioBn || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, bioBn: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>
            </div>

            {/* SOCIAL MEDIA LINKS */}
            <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-violet-400" />
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      SOCIAL MEDIA LINKS
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Enter the 5 centralized social-media links displayed in the Founder / About section. Empty links will be hidden.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 uppercase tracking-wider">
                  Central Row
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {/* 1. TikTok URL */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-white">
                      <TikTokIcon className="size-3" />
                    </span>
                    <span>TikTok URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@cycleofchart"
                    value={form.tiktok || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, tiktok: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                {/* 2. YouTube URL */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-500/15 text-rose-400">
                      <YoutubeIcon className="size-3" />
                    </span>
                    <span>YouTube URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@cycleofchart"
                    value={form.youtube || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                {/* 3. Instagram URL */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-pink-500/15 text-pink-400">
                      <InstagramIcon className="size-3" />
                    </span>
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/cycleofchart"
                    value={form.instagram || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                {/* 4. X / Twitter URL */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-500/15 text-sky-400">
                      <XTwitterIcon className="size-3" />
                    </span>
                    <span>X / Twitter URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/cycleofchart"
                    value={form.twitter || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                {/* 5. Facebook URL */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/15 text-blue-400">
                      <FacebookIcon className="size-3" />
                    </span>
                    <span>Facebook URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/cycleofchart"
                    value={form.facebook || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, facebook: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              {/* Dedicated Save Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Save all 5 social links to database immediately.
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow transition"
                >
                  {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Save Social Media Links</span>
                </button>
              </div>
            </div>

            {/* Primary Submit */}
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-md hover:bg-sky-400 transition w-full sm:w-auto min-w-[200px]"
            >
              {isSaving && <RefreshCw size={14} className="animate-spin" />}
              <span>Save Owner Profile</span>
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              Live Home Preview
            </span>

            <div className="flex items-center rounded-xl bg-slate-900 p-1 text-xs border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewLang("en")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLang === "en" ? "bg-sky-500 text-slate-950" : "text-slate-400"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang("bn")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  previewLang === "bn" ? "bg-sky-500 text-slate-950" : "text-slate-400"
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Visibility Status Pill */}
          <div
            className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-bold transition ${
              form.isVisible !== false
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {form.isVisible !== false ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>
                {form.isVisible !== false
                  ? "Section will display on home page"
                  : "Section is hidden from visitors"}
              </span>
            </div>
            <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              {form.isVisible !== false ? "Visible" : "Hidden"}
            </span>
          </div>

          {/* Public Style Preview Box */}
          <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 text-white shadow-2xl relative overflow-hidden">
            <AnimatedRgbBorder />
            <div className="relative z-10 space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#38bdf8]">
                  {previewLang === "bn" ? "ফাউন্ডার পরিচিতি" : "FOUNDER & LEAD MENTOR"}
                </span>
                <h4 className="text-lg font-black text-white mt-1">
                  {previewLang === "bn" ? "সাইকেল অব চার্ট-এর রূপকার" : "The Mind Behind Cycle of Chart"}
                </h4>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="w-20 h-20 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-sky-500 to-blue-600 shrink-0">
                  {form.photoUrl ? (
                    <img
                      src={form.photoUrl}
                      alt={form.name}
                      className="w-full h-full object-cover object-top rounded-[14px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <UserCheck size={24} />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-base font-black text-white">{form.name || "Owner Name"}</div>
                  <div className="inline-flex items-center gap-1 mt-1 rounded-full bg-sky-400/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 border border-sky-500/20">
                    <ShieldCheck size={12} className="text-sky-400 shrink-0" />
                    <span>
                      {previewLang === "bn" && form.roleBn ? form.roleBn : form.role || "Lead Trader"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-2">
                {previewLang === "bn" && form.bioBn ? form.bioBn : form.bioEn || "Biography goes here..."}
              </p>

              {/* Central Social Media Links in Preview */}
              {(() => {
                const previewSocials = [
                  { key: "tiktok", label: "TikTok", url: form.tiktok, icon: TikTokIcon, color: "text-white bg-slate-800" },
                  { key: "youtube", label: "YouTube", url: form.youtube, icon: YoutubeIcon, color: "text-rose-400 bg-slate-800" },
                  { key: "instagram", label: "Instagram", url: form.instagram, icon: InstagramIcon, color: "text-pink-400 bg-slate-800" },
                  { key: "twitter", label: "X / Twitter", url: form.twitter, icon: XTwitterIcon, color: "text-sky-400 bg-slate-800" },
                  { key: "facebook", label: "Facebook", url: form.facebook, icon: FacebookIcon, color: "text-blue-400 bg-slate-800" },
                ].filter((item) => item.url && item.url.trim() !== "");

                if (previewSocials.length === 0) return null;

                return (
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-800">
                    {previewSocials.map((item) => {
                      const Icon = item.icon;
                      return (
                        <span
                          key={item.key}
                          className={`p-1.5 rounded-lg border border-slate-700 shadow-sm ${item.color}`}
                          title={item.label}
                        >
                          <Icon className="size-3.5" />
                        </span>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
