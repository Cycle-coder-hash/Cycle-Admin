import React, { useState, useEffect } from "react";
import {
  Check,
  Copy,
  RefreshCw,
  Power,
  ShieldCheck,
  AlertCircle,
  Megaphone,
  Sparkles,
  CreditCard,
  Sliders,
  CheckCircle2,
  Send,
  ExternalLink,
} from "lucide-react";
import { BkashLogo, NagadLogo, RocketLogo } from "../components/PaymentIcons";
import { PaymentSettingsConfig, defaultPaymentConfig } from "../lib/api";

interface PlatformSettingsProps {
  config: PaymentSettingsConfig;
  onSave: (config: PaymentSettingsConfig) => Promise<void>;
  onReload?: () => void;
  isSaving?: boolean;
}

export const PlatformSettings: React.FC<PlatformSettingsProps> = ({
  config,
  onSave,
  onReload,
  isSaving = false,
}) => {
  const [form, setForm] = useState<PaymentSettingsConfig>({
    bkash: { ...defaultPaymentConfig.bkash, ...(config?.bkash || {}) },
    nagad: { ...defaultPaymentConfig.nagad, ...(config?.nagad || {}) },
    rocket: { ...defaultPaymentConfig.rocket, ...(config?.rocket || {}) },
    announcement: config?.announcement ?? defaultPaymentConfig.announcement,
    announcementActive: config?.announcementActive !== false,
    studentTelegramUrl: config?.studentTelegramUrl ?? defaultPaymentConfig.studentTelegramUrl,
    studentTelegramDescription: config?.studentTelegramDescription ?? defaultPaymentConfig.studentTelegramDescription,
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedPreviewMethod, setSelectedPreviewMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");

  useEffect(() => {
    if (config) {
      setForm({
        bkash: { ...defaultPaymentConfig.bkash, ...(config.bkash || {}) },
        nagad: { ...defaultPaymentConfig.nagad, ...(config.nagad || {}) },
        rocket: { ...defaultPaymentConfig.rocket, ...(config.rocket || {}) },
        announcement: config.announcement ?? defaultPaymentConfig.announcement,
        announcementActive: config.announcementActive !== false,
        studentTelegramUrl: config.studentTelegramUrl ?? defaultPaymentConfig.studentTelegramUrl,
        studentTelegramDescription: config.studentTelegramDescription ?? defaultPaymentConfig.studentTelegramDescription,
      });
    }
  }, [config]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggle = (gateway: "bkash" | "nagad" | "rocket") => {
    setForm((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        enabled: !prev[gateway].enabled,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const activeCount = [form.bkash.enabled, form.nagad.enabled, form.rocket.enabled].filter(Boolean).length;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Payment Gateways & System Settings
            </h2>
            <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-400 border border-sky-500/20">
              Live Checkout Sync
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Control payment gateways availability (ON/OFF), account numbers, types, and notice banner seen by students during checkout.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onReload && (
            <button
              type="button"
              onClick={onReload}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition"
            >
              <RefreshCw size={13} />
              <span>Reload Saved</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>{isSaving ? "Saving..." : "Save All Gateways"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Payment gateway settings updated and synchronized with Supabase database!</span>
          </div>
        </div>
      )}

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Gateways
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{activeCount} / 3</span>
            <span className="text-xs text-slate-500">online</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Disabled Gateways
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${3 - activeCount > 0 ? "text-amber-400" : "text-slate-400"}`}>
              {3 - activeCount} / 3
            </span>
            <span className="text-xs text-slate-500">hidden</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#070e1b] p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Notice Banner Status
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${form.announcementActive ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
            <span className="text-sm font-black text-white">
              {form.announcementActive ? "Active on Checkout" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Gateway Cards & Settings */}
        <form onSubmit={handleSubmit} className="xl:col-span-7 space-y-6">
          {/* bKash Gateway Card */}
          <div
            className={`rounded-3xl border transition-all p-6 space-y-5 ${
              form.bkash.enabled
                ? "border-[#E2136E]/30 bg-[#E2136E]/5"
                : "border-slate-800 bg-[#070e1b] opacity-75"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 shrink-0">
                  <BkashLogo size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">bKash (বিকাশ)</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        form.bkash.enabled
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {form.bkash.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bangladesh's leading mobile financial service
                  </p>
                </div>
              </div>

              {/* ON/OFF Switch */}
              <button
                type="button"
                onClick={() => handleToggle("bkash")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.bkash.enabled ? "bg-[#E2136E]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.bkash.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  bKash Account Number *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    value={form.bkash.number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        bkash: { ...prev.bkash, number: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-sm font-bold text-white outline-none focus:border-[#E2136E]"
                    placeholder="019XXXXXXXX"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(form.bkash.number, "bkash")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white"
                  >
                    {copiedKey === "bkash" ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check size={11} /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={11} /> Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Account Type</label>
                <select
                  value={form.bkash.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bkash: {
                        ...prev.bkash,
                        type: e.target.value as "personal" | "merchant" | "agent",
                      },
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-sm font-bold text-white outline-none focus:border-[#E2136E]"
                >
                  <option value="personal">Personal (Send Money)</option>
                  <option value="merchant">Merchant (Payment)</option>
                  <option value="agent">Agent (Cash In)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                Instruction Note for Students
              </label>
              <input
                type="text"
                value={form.bkash.instructions || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    bkash: { ...prev.bkash, instructions: e.target.value },
                  }))
                }
                placeholder="Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন"
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-white outline-none focus:border-[#E2136E]"
              />
            </div>
          </div>

          {/* Nagad Gateway Card */}
          <div
            className={`rounded-3xl border transition-all p-6 space-y-5 ${
              form.nagad.enabled
                ? "border-[#F97316]/30 bg-[#F97316]/5"
                : "border-slate-800 bg-[#070e1b] opacity-75"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 shrink-0">
                  <NagadLogo size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Nagad (নগদ)</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        form.nagad.enabled
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {form.nagad.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bangladesh Post Office Digital Financial Service
                  </p>
                </div>
              </div>

              {/* ON/OFF Switch */}
              <button
                type="button"
                onClick={() => handleToggle("nagad")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.nagad.enabled ? "bg-[#F97316]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.nagad.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Nagad Account Number *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    value={form.nagad.number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        nagad: { ...prev.nagad, number: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-sm font-bold text-white outline-none focus:border-[#F97316]"
                    placeholder="019XXXXXXXX"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(form.nagad.number, "nagad")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white"
                  >
                    {copiedKey === "nagad" ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check size={11} /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={11} /> Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Account Type</label>
                <select
                  value={form.nagad.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      nagad: {
                        ...prev.nagad,
                        type: e.target.value as "personal" | "merchant" | "agent",
                      },
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-sm font-bold text-white outline-none focus:border-[#F97316]"
                >
                  <option value="personal">Personal (Send Money)</option>
                  <option value="merchant">Merchant (Payment)</option>
                  <option value="agent">Agent (Cash In)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                Instruction Note for Students
              </label>
              <input
                type="text"
                value={form.nagad.instructions || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nagad: { ...prev.nagad, instructions: e.target.value },
                  }))
                }
                placeholder="Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন"
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-white outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          {/* Rocket Gateway Card */}
          <div
            className={`rounded-3xl border transition-all p-6 space-y-5 ${
              form.rocket.enabled
                ? "border-[#8C3494]/30 bg-[#8C3494]/5"
                : "border-slate-800 bg-[#070e1b] opacity-75"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 shrink-0">
                  <RocketLogo size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Rocket (রকেট)</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        form.rocket.enabled
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {form.rocket.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dutch-Bangla Bank Mobile Banking
                  </p>
                </div>
              </div>

              {/* ON/OFF Switch */}
              <button
                type="button"
                onClick={() => handleToggle("rocket")}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.rocket.enabled ? "bg-[#8C3494]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.rocket.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Rocket Account Number *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    required
                    value={form.rocket.number}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        rocket: { ...prev.rocket, number: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-sm font-bold text-white outline-none focus:border-[#8C3494]"
                    placeholder="019XXXXXXXXX"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(form.rocket.number, "rocket")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white"
                  >
                    {copiedKey === "rocket" ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check size={11} /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={11} /> Copy
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Account Type</label>
                <select
                  value={form.rocket.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rocket: {
                        ...prev.rocket,
                        type: e.target.value as "personal" | "merchant" | "agent",
                      },
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-sm font-bold text-white outline-none focus:border-[#8C3494]"
                >
                  <option value="personal">Personal (Send Money)</option>
                  <option value="merchant">Merchant (Payment)</option>
                  <option value="agent">Agent (Cash In)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                Instruction Note for Students
              </label>
              <input
                type="text"
                value={form.rocket.instructions || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    rocket: { ...prev.rocket, instructions: e.target.value },
                  }))
                }
                placeholder="Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন"
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-white outline-none focus:border-[#8C3494]"
              />
            </div>
          </div>

          {/* Announcement Card */}
          <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Checkout Notice & Promo Banner
                  </h3>
                  <p className="text-xs text-slate-400">
                    Displayed at the top of the payment checkout page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    announcementActive: !prev.announcementActive,
                  }))
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.announcementActive ? "bg-amber-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.announcementActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                Notice Banner Content
              </label>
              <textarea
                rows={2}
                value={form.announcement || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, announcement: e.target.value }))
                }
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-white outline-none focus:border-amber-500 leading-relaxed"
                placeholder="Notice message for students..."
              />
            </div>
          </div>

          {/* VIP Student Private Telegram Community Link Card */}
          <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[#070e1b] to-blue-950/20 p-6 space-y-5 relative overflow-hidden shadow-xl shadow-sky-950/30">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0">
                  <Send size={22} className="translate-x-0.5 -translate-y-0.5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-white">
                      VIP Student Private Telegram Link
                    </h3>
                    <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      Paid Students Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    শুধুমাত্র ভেরিফাইড পেইড স্টুডেন্টদের ড্যাশবোর্ডে এবং পপআপে এই প্রাইভেট টেলিগ্রাম লিংক শো করবে।
                  </p>
                </div>
              </div>

              {form.studentTelegramUrl && (
                <a
                  href={form.studentTelegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition shrink-0"
                >
                  <ExternalLink size={13} />
                  <span>Test Link</span>
                </a>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Private Telegram Channel / Group Invite Link *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="url"
                    required
                    value={form.studentTelegramUrl || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        studentTelegramUrl: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-sky-500/40 bg-slate-900/90 p-3 font-mono text-sm font-bold text-white outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition pr-20"
                    placeholder="https://t.me/+joinchat_... or https://t.me/cycleofchart"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(form.studentTelegramUrl || "", "telegram")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition"
                  >
                    {copiedKey === "telegram" ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check size={12} /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={12} /> Copy
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  পেইড স্টুডেন্ট পেমেন্ট এপ্রুভ হওয়ার পর পপআপে "Join VIP Telegram" বাটনে ক্লিক করলে সরাসরি এই লিংকে যাবে।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Community Description / Welcome Note
                </label>
                <input
                  type="text"
                  value={form.studentTelegramDescription || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      studentTelegramDescription: e.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs text-white outline-none focus:border-sky-500 transition"
                  placeholder="Official Cycle of Chart VIP Student Telegram Channel & Group"
                />
              </div>

              {/* Security Shield Note */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-emerald-400">Strict Student Protection Active: </span>
                  ফ্রি ইবুক ডাউনলোডকারী বা পেন্ডিং অর্ডার থাকা সাধারণ ভিজিটররা এই লিংক কখনো দেখতে পাবে না। শুধুমাত্র এডমিন যখন অর্ডার ভেরিফাই ও এপ্রুভ করবেন, তখনই স্টুডেন্ট এই লিংকে জয়েন করার সুযোগ পাবে।
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-black text-slate-950 hover:bg-sky-400 transition shadow-xl flex items-center justify-center gap-2"
          >
            {isSaving && <RefreshCw size={16} className="animate-spin" />}
            <span>{isSaving ? "Saving Settings..." : "Save Gateway & Platform Settings"}</span>
          </button>
        </form>

        {/* Right: Live Customer Checkout Preview */}
        <div className="xl:col-span-5 xl:sticky xl:top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles size={14} className="text-sky-400" />
              Live Customer Checkout Preview
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              cycleofchart.vercel.app/checkout
            </span>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#070e1b] p-6 shadow-2xl space-y-5">
            {/* Promo banner preview */}
            {form.announcementActive && form.announcement && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-200 flex items-center gap-2">
                <Megaphone size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">{form.announcement}</span>
              </div>
            )}

            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                1. Select Payment Method
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Only enabled gateways are visible to students
              </p>
            </div>

            {/* Gateway Selector Preview */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* bKash preview card */}
              {form.bkash.enabled ? (
                <button
                  type="button"
                  onClick={() => setSelectedPreviewMethod("bkash")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                    selectedPreviewMethod === "bkash"
                      ? "border-[#E2136E] bg-[#E2136E]/15 text-white ring-1 ring-[#E2136E]"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="h-8 w-full px-1 rounded-lg bg-white flex items-center justify-center shadow-xs border border-slate-200">
                    <BkashLogo size={18} />
                  </div>
                  <span className="text-xs font-black mt-1.5">bKash</span>
                  <span className="text-[9px] text-[#E2136E] font-bold uppercase mt-0.5">
                    {form.bkash.type}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-dashed border-slate-800/60 bg-slate-950/40 text-slate-600 opacity-50">
                  <div className="h-8 w-full px-1 rounded-lg bg-white/30 flex items-center justify-center border border-slate-700/40">
                    <BkashLogo size={18} className="grayscale opacity-40" />
                  </div>
                  <span className="text-[10px] font-bold mt-1.5">Disabled</span>
                </div>
              )}

              {/* Nagad preview card */}
              {form.nagad.enabled ? (
                <button
                  type="button"
                  onClick={() => setSelectedPreviewMethod("nagad")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                    selectedPreviewMethod === "nagad"
                      ? "border-[#F97316] bg-[#F97316]/15 text-white ring-1 ring-[#F97316]"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="h-8 w-full px-1 rounded-lg bg-white flex items-center justify-center shadow-xs border border-slate-200">
                    <NagadLogo size={18} />
                  </div>
                  <span className="text-xs font-black mt-1.5">Nagad</span>
                  <span className="text-[9px] text-[#F97316] font-bold uppercase mt-0.5">
                    {form.nagad.type}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-dashed border-slate-800/60 bg-slate-950/40 text-slate-600 opacity-50">
                  <div className="h-8 w-full px-1 rounded-lg bg-white/30 flex items-center justify-center border border-slate-700/40">
                    <NagadLogo size={18} className="grayscale opacity-40" />
                  </div>
                  <span className="text-[10px] font-bold mt-1.5">Disabled</span>
                </div>
              )}

              {/* Rocket preview card */}
              {form.rocket.enabled ? (
                <button
                  type="button"
                  onClick={() => setSelectedPreviewMethod("rocket")}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                    selectedPreviewMethod === "rocket"
                      ? "border-[#8C3494] bg-[#8C3494]/15 text-white ring-1 ring-[#8C3494]"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="h-8 w-full px-1 rounded-lg bg-white flex items-center justify-center shadow-xs border border-slate-200">
                    <RocketLogo size={18} />
                  </div>
                  <span className="text-xs font-black mt-1.5">Rocket</span>
                  <span className="text-[9px] text-[#C084FC] font-bold uppercase mt-0.5">
                    {form.rocket.type}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-dashed border-slate-800/60 bg-slate-950/40 text-slate-600 opacity-50">
                  <div className="h-8 w-full px-1 rounded-lg bg-white/30 flex items-center justify-center border border-slate-700/40">
                    <RocketLogo size={18} className="grayscale opacity-40" />
                  </div>
                  <span className="text-[10px] font-bold mt-1.5">Disabled</span>
                </div>
              )}
            </div>

            {/* Selected Method Details Box Preview */}
            {activeCount > 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Send Money to this {selectedPreviewMethod.toUpperCase()} number:
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="font-mono text-base font-black text-white tracking-wider">
                    {form[selectedPreviewMethod].number || "Not configured"}
                  </span>
                  <span className="text-[11px] font-bold text-sky-400">Copy</span>
                </div>

                {form[selectedPreviewMethod].instructions && (
                  <p className="text-[11px] text-slate-400 italic">
                    Note: {form[selectedPreviewMethod].instructions}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center space-y-1">
                <AlertCircle className="size-6 text-rose-400 mx-auto" />
                <div className="text-xs font-black text-rose-300">
                  All Payment Gateways Are Currently Disabled!
                </div>
                <p className="text-[11px] text-rose-400/80">
                  Students will see a "Payments Temporarily Unavailable" notice.
                </p>
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                256-Bit SSL Encrypted
              </span>
              <span>100% Manual Verification</span>
            </div>
          </div>

          {/* Live Student VIP Telegram Popup Preview */}
          <div className="rounded-3xl border border-sky-500/30 bg-[#070e1b] p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Send size={13} />
                Paid Student VIP Modal Preview
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Auto-Triggered
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Once an order is marked <span className="text-emerald-400 font-bold">Approved</span>, the student sees:
            </p>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>🎓 VIP Student Community</span>
                <span className="text-[10px] text-sky-400 font-mono">#COC-STUDENT</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Target Link: <span className="text-sky-300 font-mono">{form.studentTelegramUrl || "Not configured"}</span>
              </div>
              <div className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-slate-950 text-xs font-black text-center shadow-md">
                🚀 Join VIP Telegram Community
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
