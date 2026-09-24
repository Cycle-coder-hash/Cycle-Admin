import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  LeaderboardWeightsConfig,
  defaultLeaderboardWeights,
  fetchLeaderboardWeightsApi,
  updateLeaderboardWeightsApi,
  recalculateLeaderboardApi,
} from "../lib/api";

export const LeaderboardSettings: React.FC = () => {
  const [weights, setWeights] = useState<LeaderboardWeightsConfig>(defaultLeaderboardWeights);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [recalculateMessage, setRecalculateMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchLeaderboardWeightsApi();
        if (mounted) setWeights(data);
      } catch (err) {
        console.error("Failed to load leaderboard weights:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalWeight = useMemo(() => {
    return (
      (Number(weights.ruleAdherence) || 0) +
      (Number(weights.disciplineRoutine) || 0) +
      (Number(weights.winRate) || 0) +
      (Number(weights.consistency) || 0) +
      (Number(weights.profitFactor) || 0)
    );
  }, [weights]);

  const normalizedPercentages = useMemo(() => {
    if (totalWeight <= 0) {
      return {
        ruleAdherence: 0,
        disciplineRoutine: 0,
        winRate: 0,
        consistency: 0,
        profitFactor: 0,
      };
    }
    return {
      ruleAdherence: ((Number(weights.ruleAdherence) || 0) / totalWeight) * 100,
      disciplineRoutine: ((Number(weights.disciplineRoutine) || 0) / totalWeight) * 100,
      winRate: ((Number(weights.winRate) || 0) / totalWeight) * 100,
      consistency: ((Number(weights.consistency) || 0) / totalWeight) * 100,
      profitFactor: ((Number(weights.profitFactor) || 0) / totalWeight) * 100,
    };
  }, [weights, totalWeight]);

  const handleWeightChange = (key: keyof LeaderboardWeightsConfig, valStr: string) => {
    const val = Math.max(0, parseInt(valStr, 10) || 0);
    setWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleResetDefaults = () => {
    setWeights(defaultLeaderboardWeights);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight <= 0) return;

    setIsSaving(true);
    try {
      const updated = await updateLeaderboardWeightsApi(weights);
      setWeights(updated);
      setSaveSuccess("Leaderboard weights successfully saved and synchronized!");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      alert("Failed to save leaderboard weights: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setRecalculateMessage(null);
    try {
      const res = await recalculateLeaderboardApi();
      if (res.success) {
        setRecalculateMessage(
          `Leaderboard recalculated successfully! ${typeof res.count === "number" ? `(${res.count} active traders ranked)` : ""}`
        );
      } else {
        alert("Recalculation error: " + res.error);
      }
    } catch (err: any) {
      alert("Recalculation failed: " + err.message);
    } finally {
      setIsRecalculating(false);
      setTimeout(() => setRecalculateMessage(null), 5000);
    }
  };

  const metricsConfig = [
    {
      key: "ruleAdherence" as const,
      label: "Rule Adherence Weight",
      description: "Enforces 1% risk rules and killzone adherence per trade.",
      color: "sky",
    },
    {
      key: "disciplineRoutine" as const,
      label: "Discipline Routine Weight",
      description: "Evaluates daily habit checklist completions and psychological routine.",
      color: "emerald",
    },
    {
      key: "winRate" as const,
      label: "Win Rate Weight",
      description: "Rewards high percentage of winning setups among documented trades.",
      color: "cyan",
    },
    {
      key: "consistency" as const,
      label: "Consistency & Streak Weight",
      description: "Tracks active daily trade logging streaks and sustained journaling.",
      color: "purple",
    },
    {
      key: "profitFactor" as const,
      label: "Profit Factor Quality Weight",
      description: "Binds gross profit to loss ratio on a 0-100 normalized scale.",
      color: "amber",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw size={24} className="animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-[#0b1329]/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy size={18} />
            </div>
            <h3 className="text-xl font-black text-white">Global Leaderboard Scoring Matrix</h3>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
              0–100 Normalized
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 max-w-2xl leading-relaxed">
            Adjust the relative weights for the 5 core performance pillars. Total weights are dynamically normalized to map to the 0–100 scale. Set any metric weight to 0 to disable it completely.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3.5 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRecalculating ? "animate-spin" : ""} />
            <span>{isRecalculating ? "Recalculating..." : "🔄 Recalculate Leaderboard"}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {recalculateMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs font-bold text-sky-300 animate-in fade-in">
          <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
          <span>{recalculateMessage}</span>
        </div>
      )}

      {/* Validation Warning if all 0 */}
      {totalWeight <= 0 && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-300">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>All weights cannot be 0. At least one metric weight must be greater than zero.</span>
        </div>
      )}

      {/* Weight Inputs & Live Normalized Percentage Sliders */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricsConfig.map((metric) => {
            const currentWeight = Number(weights[metric.key]) || 0;
            const pct = normalizedPercentages[metric.key];
            const isDisabled = currentWeight === 0;

            return (
              <div
                key={metric.key}
                className={`rounded-2xl border p-4 transition-all space-y-3 ${
                  isDisabled
                    ? "border-slate-800 bg-slate-900/40 opacity-70"
                    : "border-slate-700/80 bg-slate-900/80 shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{metric.label}</span>
                  {isDisabled ? (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                      Disabled
                    </span>
                  ) : (
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-black text-sky-400">
                      {pct.toFixed(1)}% active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={currentWeight}
                    onChange={(e) => handleWeightChange(metric.key, e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-base font-black text-white outline-none focus:border-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>

                {/* Progress bar visual */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>
              Total Weight: <strong className="text-white font-mono">{totalWeight}</strong> · Automatically normalized to 100% total score
            </span>
          </div>

          <button
            type="submit"
            disabled={isSaving || totalWeight <= 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-xs font-black text-slate-950 hover:from-sky-400 hover:to-blue-500 transition shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{isSaving ? "Saving Weights..." : "Save Leaderboard Weights"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
