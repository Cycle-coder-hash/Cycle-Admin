import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  Activity,
  Zap,
} from "lucide-react";
import {
  services,
  type AiConfigPublicStatus,
  type AiBudgetStatus,
  type AiReportIssueItem,
  type TestAiConnectionResult,
} from "../services";

const PRIMARY_PRESETS = [
  { id: "openrouter/auto", label: "Auto (Fastest/Cost)", provider: "OpenRouter" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B", provider: "Meta" },
  { id: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "Google" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek V3", provider: "DeepSeek" },
];

const FALLBACK_PRESETS = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini (Default Fallback)", provider: "OpenAI" },
  { id: "openrouter/auto", label: "OpenRouter Auto", provider: "OpenRouter" },
  { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
];

export const AiReportCMS: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"config" | "budget" | "issues">("config");

  // Config State
  const [config, setConfig] = useState<AiConfigPublicStatus | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [primaryModel, setPrimaryModel] = useState("openrouter/auto");
  const [fallbackModel, setFallbackModel] = useState("openai/gpt-4o-mini");

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingKey, setIsRemovingKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestAiConnectionResult | null>(null);

  // Budget & Issues State
  const [budget, setBudget] = useState<AiBudgetStatus | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [issues, setIssues] = useState<AiReportIssueItem[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<AiReportIssueItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"Approved" | "Rejected">("Approved");
  const [reviewReason, setReviewReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Global Notification Banner
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      const res = await services.aiReport.getConfig();
      setConfig(res);
      if (res.primaryModelId) setPrimaryModel(res.primaryModelId);
      if (res.fallbackModelId) setFallbackModel(res.fallbackModelId);
    } catch (err: any) {
      console.error("[loadConfig error]:", err);
      setNotice({ type: "error", text: err.message || "Failed to load AI configuration." });
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  const loadBudget = useCallback(async () => {
    try {
      setLoadingBudget(true);
      const res = await services.aiReport.getBudget();
      setBudget(res);
    } catch (err: any) {
      console.error("[loadBudget error]:", err);
    } finally {
      setLoadingBudget(false);
    }
  }, []);

  const loadIssues = useCallback(async () => {
    try {
      setLoadingIssues(true);
      const res = await services.aiReport.getIssues();
      setIssues(res);
    } catch (err: any) {
      console.error("[loadIssues error]:", err);
    } finally {
      setLoadingIssues(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (activeSubTab === "budget") loadBudget();
    if (activeSubTab === "issues") loadIssues();
  }, [activeSubTab, loadBudget, loadIssues]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setNotice(null);
      const res = await services.aiReport.saveConfig({
        openRouterApiKey: apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
        primaryModelId: primaryModel.trim(),
        fallbackModelId: fallbackModel.trim(),
      });
      setConfig(res);
      setApiKeyInput("");
      setNotice({ type: "success", text: "AI Report configuration saved successfully!" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save configuration." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!window.confirm("Are you sure you want to remove the custom Admin OpenRouter API key? The system will revert to the server environment fallback if present.")) {
      return;
    }
    try {
      setIsRemovingKey(true);
      setNotice(null);
      const res = await services.aiReport.removeKey();
      setConfig(res);
      setApiKeyInput("");
      setNotice({ type: "info", text: "Admin API Key removed. System reverted to environment key or unconfigured state." });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to remove key." });
    } finally {
      setIsRemovingKey(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await services.aiReport.testConnection({
        modelId: primaryModel.trim(),
        apiKey: apiKeyInput.trim() || undefined,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        model: primaryModel,
        latencyMs: 0,
        error: err.message || "Connection test failed.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReviewIssue = async () => {
    if (!selectedIssue || !reviewReason.trim()) return;
    try {
      setIsSubmittingReview(true);
      await services.aiReport.reviewIssue({
        issueId: selectedIssue.id,
        decision: reviewDecision,
        reason: reviewReason.trim(),
      });
      setSelectedIssue(null);
      setReviewReason("");
      loadIssues();
      setNotice({ type: "success", text: `Issue ${selectedIssue.id} resolved as ${reviewDecision}.` });
    } catch (err: any) {
      alert(err.message || "Failed to review issue.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#070e1b] via-[#09152a] to-[#050b16] p-6 shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Sparkles size={16} />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                CYCLE OF CHART AI OPERATIONS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Cycle AI Engine & OpenRouter CMS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Configure server-side encrypted OpenRouter API keys, primary & fallback LLM models, budget usage guardrails, and review trader dispute cases.
            </p>
          </div>

          {/* Status Badge */}
          {config && (
            <div className="shrink-0 flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
                  config.keySource === "admin"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : config.keySource === "env"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {config.keySource === "admin" ? (
                  <>
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Admin Key Active</span>
                  </>
                ) : config.keySource === "env" ? (
                  <>
                    <KeyRound size={14} className="text-amber-400" />
                    <span>Using Env Key</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={14} className="text-rose-400" />
                    <span>No Key Configured</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Notification Banner */}
      {notice && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-medium border ${
            notice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : notice.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-sky-500/10 border-sky-500/30 text-sky-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <Check size={16} />
            ) : notice.type === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-mono text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("config")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "config"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Cpu size={14} />
          <span>OpenRouter & Model Routing</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("budget")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "budget"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <DollarSign size={14} />
          <span>Budget & Cost Limits</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("issues")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === "issues"
              ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
              : "bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <AlertCircle size={14} />
          <span>Disputes & Issue Review</span>
        </button>
      </div>

      {/* ================= TAB 1: CONFIG & MODELS ================= */}
      {activeSubTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <form
            onSubmit={handleSaveConfig}
            className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#091122] p-6 space-y-6"
          >
            {/* OpenRouter API Key Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <KeyRound size={14} className="text-sky-400" />
                  <span>OpenRouter Secret API Key</span>
                </label>
                {config?.keySource === "admin" && (
                  <button
                    type="button"
                    onClick={handleRemoveKey}
                    disabled={isRemovingKey}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>{isRemovingKey ? "Removing..." : "Remove Custom Key"}</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={
                    config?.keySource === "admin"
                      ? "•••••••••••••••••••••••••••••••• (Encrypted on Server)"
                      : "Enter OpenRouter API key (sk-or-v1-...)"
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Encrypted via AES-256-GCM authenticated cipher before saving. Never returned in plaintext to the browser.
              </p>
            </div>

            {/* Primary Model */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span>Primary Generation Model ID</span>
              </label>
              <input
                type="text"
                value={primaryModel}
                onChange={(e) => setPrimaryModel(e.target.value)}
                placeholder="e.g. openrouter/auto or anthropic/claude-3.5-sonnet"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRIMARY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPrimaryModel(preset.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      primaryModel === preset.id
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fallback Model */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Layers size={14} className="text-sky-400" />
                <span>Automatic Fallback Model ID</span>
              </label>
              <input
                type="text"
                value={fallbackModel}
                onChange={(e) => setFallbackModel(e.target.value)}
                placeholder="e.g. openai/gpt-4o-mini"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {FALLBACK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFallbackModel(preset.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      fallbackModel === preset.id
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Buttons & Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving Configuration..." : "Save AI Configuration"}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Activity size={14} className={isTesting ? "animate-spin text-sky-400" : "text-sky-400"} />
                <span>{isTesting ? "Testing Connection..." : "Test Model Connection"}</span>
              </button>
            </div>

            {/* Live Test Results Ping Card */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono space-y-1 ${
                  testResult.success
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{testResult.success ? "✓ Connection Successful" : "✗ Connection Failed"}</span>
                  <span>{testResult.latencyMs}ms</span>
                </div>
                <div className="text-[11px] text-slate-300">{testResult.message || testResult.error}</div>
              </div>
            )}
          </form>

          {/* Right Info & Guidelines Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 space-y-4">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-sky-400" />
                <span>Institutional AI Routing Specs</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Primary Model:</strong> Used for all incoming report analysis requests. Defaults to <code className="text-sky-300 font-mono">openrouter/auto</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Automatic Failover:</strong> If the primary model encounters a 503/429 or provider outage, the pipeline fails over seamlessly to the Fallback Model.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Truthful Failure Guarantee:</strong> If both primary and fallback models fail, the job fails visibly and does <strong>not</strong> consume the trader's weekly quota.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>
                    <strong>Secret Isolation:</strong> Keys are stored server-side only in encrypted settings. Client applications never receive plain credentials.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BUDGET & LIMITS ================= */}
      {activeSubTab === "budget" && (
        <div className="space-y-6">
          {loadingBudget ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
              Loading budget and utilization ledger...
            </div>
          ) : budget ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Monthly Ceiling</div>
                <div className="text-xl font-black text-white font-mono">${budget.monthlyBudgetUsd.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500">Spend: ${budget.monthlySpendUsd.toFixed(3)}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Monthly Utilization</div>
                <div className="text-xl font-black text-sky-400 font-mono">{budget.monthlyUtilizationPercent.toFixed(1)}%</div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${
                      budget.isHardLimitReached ? "bg-rose-500" : budget.isThresholdAlert ? "bg-amber-400" : "bg-sky-400"
                    }`}
                    style={{ width: `${Math.min(budget.monthlyUtilizationPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Daily Spend Ceiling</div>
                <div className="text-xl font-black text-white font-mono">${budget.dailyBudgetUsd.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500">Today: ${budget.dailySpendUsd.toFixed(3)}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#091122] p-4 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Engine Status</div>
                <div
                  className={`text-xl font-black font-mono ${
                    budget.canAcceptJobs ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {budget.canAcceptJobs ? "Accepting Jobs" : "Hard Limit Attained"}
                </div>
                <div className="text-[10px] text-slate-500">{budget.activeReservationsCount} active locks</div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">No budget data available.</div>
          )}
        </div>
      )}

      {/* ================= TAB 3: TRADER ISSUES REVIEW ================= */}
      {activeSubTab === "issues" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-[#091122] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-sky-400" />
                <span>Trader Flagged Concerns & Disputed Findings</span>
              </div>
              <button
                type="button"
                onClick={loadIssues}
                className="text-xs font-mono text-sky-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw size={12} className={loadingIssues ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingIssues ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Scanning issue queue...</div>
            ) : issues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Issue ID</th>
                      <th className="py-2.5 px-3">User ID</th>
                      <th className="py-2.5 px-3">Report ID</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {issues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-white font-semibold">{iss.id}</td>
                        <td className="py-3 px-3 text-slate-400">{iss.userId}</td>
                        <td className="py-3 px-3 text-sky-400">{iss.reportId}</td>
                        <td className="py-3 px-3 text-slate-300">{iss.affectedSection}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              iss.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : iss.status === "Rejected"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {iss.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIssue(iss);
                              setReviewReason(iss.resolutionNote || "");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-sans transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No open trader issues or flagged reports in the queue.
              </div>
            )}
          </div>

          {/* Issue Review Modal */}
          {selectedIssue && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#091122] p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="text-sm font-bold text-white">Review Issue: {selectedIssue.id}</div>
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-400 font-mono">
                    Report ID: <span className="text-sky-400">{selectedIssue.reportId}</span> (User: {selectedIssue.userId})
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Trader Concern:</div>
                    {selectedIssue.userDescription}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-white block">Decision</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewDecision("Approved")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        reviewDecision === "Approved"
                          ? "bg-emerald-500 text-slate-950 shadow-md"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      Approve Correction
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewDecision("Rejected")}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        reviewDecision === "Rejected"
                          ? "bg-rose-500 text-slate-950 shadow-md"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      Reject Concern
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">Administrative Note to Trader</label>
                    <textarea
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="Explain resolution rationale clearly..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReviewIssue}
                    disabled={isSubmittingReview || !reviewReason.trim()}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Decision"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
