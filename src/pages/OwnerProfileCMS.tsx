import React, { useState } from "react";
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
} from "lucide-react";
import { AnimatedRgbBorder } from "../components/AnimatedRgbBorder";

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
  youtube?: string;
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

            {/* Submit */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
