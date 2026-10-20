import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  UserX,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { services, type ActiveMentorInfo, type MentorUserDirectoryItem } from "../services";

export const MentorControlCMS: React.FC = () => {
  const [activeMentor, setActiveMentor] = useState<ActiveMentorInfo | null>(null);
  const [users, setUsers] = useState<MentorUserDirectoryItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyPremium, setOnlyPremium] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(true);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadActiveMentor = useCallback(async () => {
    try {
      const mentor = await services.mentor.getActiveMentor();
      setActiveMentor(mentor);
    } catch (err: any) {
      console.error("[loadActiveMentor error]:", err);
    }
  }, []);

  const loadDirectory = useCallback(async () => {
    try {
      setLoadingDirectory(true);
      const res = await services.mentor.listUsers(searchQuery, onlyPremium, page, pageSize);
      setUsers(res.users);
      setTotalUsers(res.total);
    } catch (err: any) {
      console.error("[loadDirectory error]:", err);
    } finally {
      setLoadingDirectory(false);
    }
  }, [searchQuery, onlyPremium, page, pageSize]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadActiveMentor(), loadDirectory()]);
    setLoading(false);
  }, [loadActiveMentor, loadDirectory]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAppoint = async (user: MentorUserDirectoryItem) => {
    if (!user.isEligible) {
      alert("Only users with an active Premium subscription can be appointed as Mentor.");
      return;
    }

    const confirmText = activeMentor?.isAssigned
      ? `Replace current Mentor "${activeMentor.name}" with "${user.name}"? Student conversation histories will be preserved. Proceed?`
      : `Appoint "${user.name}" as the official verified 1-on-1 Mentor?`;

    if (!confirm(confirmText)) return;

    try {
      setActionLoadingId(user.id);
      setActionMessage(null);
      const updated = await services.mentor.appointMentor(user.id);
      setActiveMentor(updated);
      setActionMessage({
        type: "success",
        text: `Successfully appointed ${user.name} (#${user.id}) as the active Mentor.`,
      });
      await loadDirectory();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to appoint Mentor.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove the current active Mentor? Students will not be able to send new messages until a new Mentor is appointed.")) {
      return;
    }

    try {
      setIsRemoving(true);
      setActionMessage(null);
      await services.mentor.removeMentor();
      setActiveMentor({
        isAssigned: false,
        mentorId: null,
        name: null,
        avatar: null,
        isEligible: false,
        appointedAt: null,
      });
      setActionMessage({
        type: "success",
        text: "Active Mentor removed successfully. The platform is now in unassigned status.",
      });
      await loadDirectory();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to remove active Mentor.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-[#091326] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-600/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
            <UserCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Official 1-on-1 Mentor Control</span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-400">
                Live
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage the single official Mentor assigned to receive and reply to student messages, chart reviews, and trade videos.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadAll()}
          disabled={loading || loadingDirectory}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
        >
          <RefreshCw className={`size-3.5 ${loading || loadingDirectory ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <Check className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Current Active Mentor Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0b162c] to-[#070e1b] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Current Active Mentor Status
            </h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
              activeMentor?.isAssigned
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                : "bg-amber-500/15 border border-amber-500/40 text-amber-400"
            }`}
          >
            {activeMentor?.isAssigned ? "1 Active Mentor Assigned" : "Vacant / No Mentor"}
          </span>
        </div>

        {activeMentor?.isAssigned ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="relative size-16 rounded-full overflow-hidden bg-slate-800 border-2 border-sky-400 shadow-lg shadow-sky-500/20 shrink-0">
                {activeMentor.avatar ? (
                  <img
                    src={activeMentor.avatar}
                    alt={activeMentor.name || "Mentor"}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center font-black text-xl text-sky-300">
                    {(activeMentor.name || "M").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{activeMentor.name}</h3>
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-sky-500 text-white shadow-md shadow-sky-500/50">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    User #{activeMentor.mentorId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="size-3.5" />
                    Premium Verified
                  </span>
                  <span>•</span>
                  {activeMentor.appointedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      Appointed on {new Date(activeMentor.appointedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <UserX className="size-4" />
                <span>{isRemoving ? "Removing..." : "Remove Mentor"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center space-y-2">
            <div className="inline-flex items-center justify-center size-10 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No Official Mentor Appointed</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Choose an eligible Premium trader from the candidate directory below to appoint as the official 1-on-1 Mentor.
            </p>
          </div>
        )}
      </div>

      {/* Candidate Directory Table */}
      <div className="p-6 rounded-2xl bg-[#091326] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">User Directory & Mentor Candidates</h2>
            <p className="text-xs text-slate-400">
              Only active Premium accounts are eligible for appointment as Mentor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search user name or email..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 w-56 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => {
                setOnlyPremium((prev) => !prev);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                onlyPremium
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Filter className="size-3" />
              <span>{onlyPremium ? "Premium Only" : "All Plans"}</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070e1b] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Subscription Plan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Mentor Eligibility</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#091326]/50">
                {loadingDirectory ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-sky-400" />
                      Loading candidate directory...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isCurrent = u.id === activeMentor?.mentorId;
                    const isAppointing = actionLoadingId === u.id;

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-slate-800/40 transition ${
                          isCurrent ? "bg-sky-500/5" : ""
                        }`}
                      >
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="size-full object-cover" />
                              ) : (
                                <div className="size-full flex items-center justify-center font-bold text-slate-300">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isCurrent && (
                                  <span className="size-3.5 rounded-full bg-sky-500 text-white inline-flex items-center justify-center">
                                    <Check className="size-2 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ID: #{u.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-slate-400">
                          {u.email || "—"}
                        </td>

                        {/* Plan */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              u.plan === "premium"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : u.plan === "pro"
                                ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                              u.accountStatus === "active"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {u.accountStatus}
                          </span>
                        </td>

                        {/* Eligibility */}
                        <td className="py-3 px-4 text-center">
                          {u.isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <ShieldCheck className="size-3.5" />
                              Eligible (Premium)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <ShieldAlert className="size-3.5" />
                              Requires Premium
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          {isCurrent ? (
                            <span className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold text-[11px] border border-sky-400/40">
                              Current Mentor
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAppoint(u)}
                              disabled={!u.isEligible || isAppointing}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                                u.isEligible
                                  ? "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm shadow-sky-500/20 cursor-pointer"
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                              }`}
                            >
                              {isAppointing
                                ? "Appointing..."
                                : activeMentor?.isAssigned
                                ? "Replace Mentor"
                                : "Make Mentor"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 bg-[#070e1b] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {users.length} of {totalUsers} candidates
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-mono text-xs">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorControlCMS;
