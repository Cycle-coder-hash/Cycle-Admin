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
  Building2,
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

  // Profile 2 (Cycle of Chart / Brand Profile)
  profile2Name?: string;
  profile2Role?: string;
  profile2RoleBn?: string;
  profile2PhotoUrl?: string;
  profile2BioEn?: string;
  profile2BioBn?: string;
  profile2TradingStyle?: string;
  profile2Telegram?: string;
  profile2Youtube?: string;
  profile2Facebook?: string;
  profile2Twitter?: string;
  profile2Email?: string;
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
  const [activeSection, setActiveSection] = useState<"all" | "profile1" | "profile2" | "socials">("all");
  const [savingSection, setSavingSection] = useState<string | null>(null);
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

  const handleProfile2PhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profile2PhotoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile1 = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingSection("profile1");
      await onSave({
        ...profile,
        ...form,
        name: form.name,
        role: form.role,
        roleBn: form.roleBn,
        bioEn: form.bioEn,
        bioBn: form.bioBn,
        photoUrl: form.photoUrl,
        isVisible: form.isVisible,
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveProfile2 = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingSection("profile2");
      await onSave({
        ...profile,
        ...form,
        profile2Name: form.profile2Name !== undefined ? form.profile2Name.trim() : "Cycle of Chart",
        profile2Role: form.profile2Role !== undefined ? form.profile2Role.trim() : "Institutional Trading Mentor",
        profile2RoleBn: form.profile2RoleBn !== undefined ? form.profile2RoleBn.trim() : "",
        profile2BioEn: form.profile2BioEn !== undefined ? form.profile2BioEn.trim() : "",
        profile2BioBn: form.profile2BioBn !== undefined ? form.profile2BioBn.trim() : "",
        profile2PhotoUrl: form.profile2PhotoUrl || "/logo.jpg",
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveSocials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingSection("socials");
      await onSave({
        ...profile,
        ...form,
        tiktok: form.tiktok,
        youtube: form.youtube,
        instagram: form.instagram,
        twitter: form.twitter,
        facebook: form.facebook,
      });
    } finally {
      setSavingSection(null);
    }
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSection("all");
      await onSave(form);
    } finally {
      setSavingSection(null);
    }
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
            Independently manage both the Founder/Owner profile and the Cycle of Chart brand profile displayed on the public landing page.
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

      {/* Section Filter / Focus Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveSection("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === "all"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>All Sections</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("profile1")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === "profile1"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck size={14} className="text-sky-400" />
          <span>Profile 1: Founder (Left)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("profile2")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === "profile2"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 size={14} className="text-cyan-400" />
          <span>Profile 2: Cycle of Chart (Right)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("socials")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSection === "socials"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Share2 size={14} className="text-violet-400" />
          <span>Social Media Links</span>
        </button>
      </div>

      {/* Editor & Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSubmitAll} className="space-y-6">
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
                        ? "Founder/About section is currently visible on the landing page."
                        : "Founder/About section is hidden from the landing page."}
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

            {/* ========================================================================= */}
            {/* PROFILE 1: FOUNDER / OWNER PROFILE (LEFT) */}
            {/* ========================================================================= */}
            {(activeSection === "all" || activeSection === "profile1") && (
              <div className="space-y-6">
                {/* Photo Card */}
                <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Camera size={18} className="text-sky-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Profile 1: Founder Photo Management
                      </h3>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 uppercase tracking-wider">
                      Left Column
                    </span>
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
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500 font-mono"
                      />

                      {form.photoUrl && form.photoUrl.startsWith("data:image/") && (
                        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2.5 text-[11px] font-semibold text-sky-300 flex items-center gap-2">
                          <Sparkles size={14} className="text-sky-400 shrink-0" />
                          <span>Local image file loaded. Clicking save will automatically upload to ImgBB Cloud CDN and store a permanent fast URL.</span>
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
                      Founder Name & Institutional Title
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

                  {/* Dedicated Save Button for Profile 1 */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Saves changes to Founder / Owner profile without affecting Profile 2.
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveProfile1}
                      disabled={isSaving || savingSection === "profile1"}
                      className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow transition self-end sm:self-auto"
                    >
                      {savingSection === "profile1" || isSaving ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      <span>Save Founder Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PROFILE 2: CYCLE OF CHART / BRAND PROFILE (RIGHT) */}
            {/* ========================================================================= */}
            {(activeSection === "all" || activeSection === "profile2") && (
              <div className="rounded-3xl border border-cyan-500/30 bg-[#070e1b] p-6 space-y-6">
                {/* Profile 2 Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white uppercase tracking-wider">
                          CYCLE OF CHART PROFILE
                        </h3>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                          Right Column
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Brand identity, logo/image, institutional role, and narrative statement.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-xl self-start sm:self-center border border-cyan-800/60">
                    Profile 2 Controls
                  </span>
                </div>

                {/* 1. [Logo / Image] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-cyan-400" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Brand / Profile 2 Logo & Image
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-slate-900 shadow-md flex items-center justify-center">
                        {form.profile2PhotoUrl ? (
                          <img
                            src={form.profile2PhotoUrl}
                            alt="Brand Logo"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <Building2 size={32} className="text-slate-600" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition">
                          <Upload size={14} />
                          <span>Upload Brand Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfile2PhotoUpload}
                            className="hidden"
                          />
                        </label>

                        {form.profile2PhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, profile2PhotoUrl: "" }))}
                            className="flex items-center gap-1 rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-900/50 transition"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        placeholder="Or paste direct logo URL (https://...)"
                        value={form.profile2PhotoUrl || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, profile2PhotoUrl: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 font-mono"
                      />

                      {form.profile2PhotoUrl && form.profile2PhotoUrl.startsWith("data:image/") && (
                        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-[11px] font-semibold text-cyan-300 flex items-center gap-2">
                          <Sparkles size={14} className="text-cyan-400 shrink-0" />
                          <span>Local image file loaded. Clicking save will automatically upload to ImgBB Cloud CDN and store a permanent fast URL.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. [Name] */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Brand Profile Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cycle of Chart"
                    value={form.profile2Name !== undefined ? form.profile2Name : "Cycle of Chart"}
                    onChange={(e) => setForm((prev) => ({ ...prev, profile2Name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm font-bold text-white outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Changing this name updates only the Brand profile on the right column. It will never overwrite the Founder name.
                  </p>
                </div>

                {/* 3. [Role] */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Brand Designation & Title
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Title / Role (English)
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Institutional Trading Mentor"
                        value={form.profile2Role !== undefined ? form.profile2Role : "Institutional Trading Mentor"}
                        onChange={(e) => setForm((prev) => ({ ...prev, profile2Role: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-semibold text-white outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Title / Role (Bengali)
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. ইন্সটিটিউশনাল ট্রেডিং মেন্টর"
                        value={form.profile2RoleBn || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, profile2RoleBn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-semibold text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. [Description] */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-cyan-400" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Brand Description / Narrative Statement
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Brand Description (English)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="Cycle of Chart is an institutional trading education and market research initiative committed to mentoring traders in SMC, liquidity engineering, and rule-based execution."
                        value={form.profile2BioEn || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, profile2BioEn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white outline-none focus:border-cyan-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Brand Description (Bengali)
                      </span>
                      <textarea
                        rows={3}
                        placeholder="সাইকেল অব চার্ট একটি প্রাতিষ্ঠানিক ট্রেডিং শিক্ষা ও মার্কেট রিসার্চ প্ল্যাটফর্ম যা এসএমসি, লিকুইডিটি ইঞ্জিনিয়ারিং এবং নিয়মতান্ত্রিক এক্সিকিউশনে ট্রেডারদের প্রশিক্ষণ দেয়।"
                        value={form.profile2BioBn || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, profile2BioBn: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white outline-none focus:border-cyan-500 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Dedicated Save Button */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Saves all changes made to the Cycle of Chart profile without modifying Profile 1.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveProfile2}
                    disabled={isSaving || savingSection === "profile2"}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow transition self-end sm:self-auto"
                  >
                    {savingSection === "profile2" || isSaving ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    <span>Save Cycle of Chart Profile</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SOCIAL MEDIA LINKS SECTION */}
            {/* ========================================================================= */}
            {(activeSection === "all" || activeSection === "socials") && (
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
                    type="button"
                    onClick={handleSaveSocials}
                    disabled={isSaving || savingSection === "socials"}
                    className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow transition"
                  >
                    {savingSection === "socials" || isSaving ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    <span>Save Social Media Links</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Unified Master Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
              <div>
                <div className="text-xs font-black">Dual-Profile CMS Ready</div>
                <div className="text-[11px] text-slate-400">Saves both profiles and social links directly to database.</div>
              </div>
              <button
                type="submit"
                disabled={isSaving || savingSection !== null}
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-md hover:bg-sky-400 transition w-full sm:w-auto min-w-[200px]"
              >
                {savingSection === "all" || isSaving ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                <span>Save All Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              Live Dual-Profile Home Preview
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

          {/* Public Style Dual-Profile Preview Box */}
          <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden">
            <AnimatedRgbBorder />
            <div className="relative z-10 space-y-4">
              <div className="text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#38bdf8]">
                  {previewLang === "bn" ? "ফাউন্ডার ও মেন্টর পরিচিতি" : "FOUNDER & LEAD MENTORS"}
                </span>
                <h4 className="text-base sm:text-lg font-black text-white mt-1">
                  {previewLang === "bn" ? "সাইকেল অব চার্ট-এর রূপকার" : "The Mind Behind Cycle of Chart"}
                </h4>
              </div>

              {/* Dual Profile Side-by-Side Cards (Matching Home.tsx) */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {/* Profile 1 (Left): Founder */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Founder
                  </span>

                  <div className="relative mt-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md">
                      {form.photoUrl ? (
                        <img
                          src={form.photoUrl}
                          alt={form.name || "Founder"}
                          className="w-full h-full object-cover object-top rounded-[10px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserCheck size={22} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs sm:text-sm font-black text-white line-clamp-1">
                    {form.name || "Founder Name"}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-sky-400 line-clamp-1">
                    {previewLang === "bn" && form.roleBn ? form.roleBn : form.role || "Lead Trader"}
                  </div>
                </div>

                {/* Profile 2 (Right): Cycle of Chart */}
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-900/80 border border-cyan-800/40 relative">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Brand
                  </span>

                  <div className="relative mt-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-500 to-sky-600 shadow-md">
                      {form.profile2PhotoUrl ? (
                        <img
                          src={form.profile2PhotoUrl}
                          alt={form.profile2Name || "Cycle of Chart"}
                          className="w-full h-full object-cover object-top rounded-[10px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-cyan-400">
                          <Building2 size={22} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs sm:text-sm font-black text-white line-clamp-1">
                    {form.profile2Name || "Cycle of Chart"}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-cyan-400 line-clamp-1">
                    {previewLang === "bn" && form.profile2RoleBn
                      ? form.profile2RoleBn
                      : form.profile2Role || (previewLang === "bn" ? "ইন্সটিটিউশনাল ট্রেডিং মেন্টর" : "Institutional Trading Mentor")}
                  </div>
                </div>
              </div>

              {/* Bio Texts */}
              <div className="space-y-2 pt-2 text-center">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {previewLang === "bn" && form.bioBn ? form.bioBn : form.bioEn || "Founder biography..."}
                </p>
                {(() => {
                  const p2Bio = previewLang === "bn" && form.profile2BioBn ? form.profile2BioBn : form.profile2BioEn;
                  if (!p2Bio) return null;
                  return (
                    <p className="text-[11px] text-cyan-300/80 leading-relaxed pt-1.5 border-t border-slate-800 line-clamp-2">
                      {p2Bio}
                    </p>
                  );
                })()}
              </div>

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
