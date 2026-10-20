import React, { useState, useEffect, useMemo } from "react";
import {
  Share2,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Save,
  Globe,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import {
  TikTokIcon,
  YoutubeIcon,
  InstagramIcon,
  XTwitterIcon,
  FacebookIcon,
} from "../components/SocialIcons";

export interface OwnerProfileData {
  tiktok?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  [key: string]: any;
}

interface OwnerProfileCMSProps {
  profile: OwnerProfileData;
  onSave: (data: OwnerProfileData) => Promise<unknown> | void;
  onReload?: () => void;
  isSaving?: boolean;
}

export function isValidHttpUrl(string?: string): boolean {
  if (!string || !string.trim()) return true;
  try {
    const url = new URL(string.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface SocialChannelConfig {
  key: "tiktok" | "youtube" | "instagram" | "twitter" | "facebook";
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  brandColor: string;
  badgeColor: string;
  description: string;
}

const SOCIAL_CHANNELS: SocialChannelConfig[] = [
  {
    key: "tiktok",
    label: "TikTok URL",
    placeholder: "https://www.tiktok.com/@cycleofchart",
    icon: TikTokIcon,
    brandColor: "text-slate-100 bg-slate-800",
    badgeColor: "border-slate-700 text-slate-300",
    description: "Official TikTok channel for educational market breakdown clips.",
  },
  {
    key: "youtube",
    label: "YouTube URL",
    placeholder: "https://www.youtube.com/@cycleofchart",
    icon: YoutubeIcon,
    brandColor: "text-red-500 bg-red-500/10",
    badgeColor: "border-red-500/30 text-red-400",
    description: "Official YouTube channel for institutional trading tutorials and webinars.",
  },
  {
    key: "instagram",
    label: "Instagram URL",
    placeholder: "https://www.instagram.com/cycleofchart",
    icon: InstagramIcon,
    brandColor: "text-pink-500 bg-pink-500/10",
    badgeColor: "border-pink-500/30 text-pink-400",
    description: "Official Instagram profile for market charts, session reviews, and updates.",
  },
  {
    key: "twitter",
    label: "X (Twitter) URL",
    placeholder: "https://x.com/cycleofchart",
    icon: XTwitterIcon,
    brandColor: "text-slate-100 bg-slate-800",
    badgeColor: "border-slate-700 text-slate-300",
    description: "Official X profile for macro news alerts and algorithmic market updates.",
  },
  {
    key: "facebook",
    label: "Facebook URL",
    placeholder: "https://www.facebook.com/cycleofchart",
    icon: FacebookIcon,
    brandColor: "text-blue-500 bg-blue-500/10",
    badgeColor: "border-blue-500/30 text-blue-400",
    description: "Official Facebook page and community announcements.",
  },
];

export const OwnerProfileCMS: React.FC<OwnerProfileCMSProps> = ({
  profile,
  onSave,
  onReload,
  isSaving = false,
}) => {
  const [form, setForm] = useState<OwnerProfileData>(() => ({
    tiktok: profile?.tiktok || "",
    youtube: profile?.youtube || "",
    instagram: profile?.instagram || "",
    facebook: profile?.facebook || "",
    twitter: profile?.twitter || "",
  }));

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        tiktok: profile.tiktok || "",
        youtube: profile.youtube || "",
        instagram: profile.instagram || "",
        facebook: profile.facebook || "",
        twitter: profile.twitter || "",
      }));
    }
  }, [profile]);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    for (const channel of SOCIAL_CHANNELS) {
      const val = form[channel.key];
      if (val && !isValidHttpUrl(val)) {
        errs[channel.key] = "Must start with http:// or https://";
      }
    }
    return errs;
  }, [form]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const configuredCount = useMemo(() => {
    return SOCIAL_CHANNELS.filter((ch) => Boolean(form[ch.key]?.trim())).length;
  }, [form]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedNotice(false);
  };

  const handleClear = (key: string) => {
    setForm((prev) => ({ ...prev, [key]: "" }));
    setSavedNotice(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

    const payload = {
      ...profile,
      tiktok: form.tiktok?.trim() || "",
      youtube: form.youtube?.trim() || "",
      instagram: form.instagram?.trim() || "",
      facebook: form.facebook?.trim() || "",
      twitter: form.twitter?.trim() || "",
    };

    try {
      await onSave(payload);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error("[OwnerProfileCMS save error]:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      {savedNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Cycle Social ID links saved successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Share2 size={18} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">Cycle Social ID</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage official brand social media handles (TikTok, YouTube, Instagram, X/Twitter, Facebook).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reload</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || hasErrors}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? "Saving..." : "Save Links"}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Globe size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connected Channels</div>
            <div className="text-lg font-black text-white">{configuredCount} / {SOCIAL_CHANNELS.length} Active</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security & Integrity</div>
            <div className="text-lg font-black text-emerald-400">{hasErrors ? "Fix Invalid URLs" : "Validated HTTPS"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Public Representation</div>
            <div className="text-lg font-black text-amber-400">Official Brand Handles</div>
          </div>
        </div>
      </div>

      {/* Main 5 Social Handles Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#070e1b] p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-white">5 Official Social Media Links</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter valid public profile URLs. Empty fields will hide the respective channel link from the public website.
          </p>
        </div>

        <div className="space-y-4">
          {SOCIAL_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const value = form[channel.key] || "";
            const err = validationErrors[channel.key];
            const isValid = value.trim().length > 0 && !err;

            return (
              <div
                key={channel.key}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition-colors hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${channel.brandColor}`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{channel.label}</span>
                      <p className="text-[10px] text-slate-500">{channel.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isValid && (
                      <a
                        href={value.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition"
                      >
                        <span>Test Link</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {value.trim() && (
                      <button
                        type="button"
                        onClick={() => handleClear(channel.key)}
                        className="text-[11px] text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    placeholder={channel.placeholder}
                    value={value}
                    onChange={(e) => handleChange(channel.key, e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition focus:ring-1 ${
                      err
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500"
                        : "border-slate-800 focus:border-sky-500 focus:ring-sky-500"
                    }`}
                  />
                </div>

                {err && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-400">
                    <AlertCircle size={12} />
                    <span>{err}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end border-t border-slate-800 pt-4">
          <button
            type="submit"
            disabled={isSaving || hasErrors}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-black text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? "Saving Links..." : "Save All Links"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
