import React, { useState } from "react";
import { UserCheck, Building2, Eye, EyeOff } from "lucide-react";
import { AnimatedRgbBorder } from "./AnimatedRgbBorder";
import {
  TikTokIcon,
  YoutubeIcon,
  InstagramIcon,
  XTwitterIcon,
  FacebookIcon,
} from "./SocialIcons";
import { OwnerProfileData } from "../pages/OwnerProfileCMS";

export interface OwnerProfilePreviewProps {
  form: OwnerProfileData;
}

export const OwnerProfilePreview: React.FC<OwnerProfilePreviewProps> = ({ form }) => {
  const [previewLang, setPreviewLang] = useState<"en" | "bn">("en");

  const previewSocials = [
    { key: "tiktok", label: "TikTok", url: form.tiktok, icon: TikTokIcon, color: "text-white bg-slate-800" },
    { key: "youtube", label: "YouTube", url: form.youtube, icon: YoutubeIcon, color: "text-rose-400 bg-slate-800" },
    { key: "instagram", label: "Instagram", url: form.instagram, icon: InstagramIcon, color: "text-pink-400 bg-slate-800" },
    { key: "twitter", label: "X / Twitter", url: form.twitter, icon: XTwitterIcon, color: "text-sky-400 bg-slate-800" },
    { key: "facebook", label: "Facebook", url: form.facebook, icon: FacebookIcon, color: "text-blue-400 bg-slate-800" },
  ].filter((item) => item.url && item.url.trim() !== "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            LIVE DESKTOP & MOBILE PREVIEW
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time visual rendering matching the public website About & Founder section.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
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

          {/* Dual Profile Side-by-Side Cards */}
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            {/* Profile 1: Founder */}
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

            {/* Profile 2: Cycle of Chart */}
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
          {previewSocials.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
};
