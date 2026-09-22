import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  ShieldCheck,
  MessageSquare,
  Search,
  X,
  Send,
  RefreshCw,
  Clock,
  AlertCircle,
  Paperclip,
  ExternalLink,
  User,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { SupportTicket, SupportTicketReply } from "../lib/types";
import { fetchTicketDetailsApi, replyTicketApi } from "../lib/api";

interface SupportTicketsProps {
  tickets: SupportTicket[];
  onUpdateStatus: (ticketId: number, status: "open" | "in_progress" | "resolved" | "waiting_user" | "closed" | any) => void;
  onReload?: () => void;
}

export const SupportTickets: React.FC<SupportTicketsProps> = ({
  tickets,
  onUpdateStatus,
  onReload,
}) => {
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "waiting_user" | "resolved" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Drawer State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<SupportTicketReply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<string>("waiting_user");
  const [staffName, setStaffName] = useState<string>("Support Specialist");
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState<string>("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
  const [replyErrorMessage, setReplyErrorMessage] = useState<string | null>(null);

  const repliesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter tickets
  const filtered = tickets.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = t.ticketCode?.toLowerCase().includes(q);
      const subjectMatch = t.subject?.toLowerCase().includes(q);
      const messageMatch = t.message?.toLowerCase().includes(q);
      const nameMatch = t.userName?.toLowerCase().includes(q);
      const emailMatch = t.userEmail?.toLowerCase().includes(q);
      const idMatch = String(t.id).includes(q) || String(t.userId).includes(q);
      if (!codeMatch && !subjectMatch && !messageMatch && !nameMatch && !emailMatch && !idMatch) {
        return false;
      }
    }
    return true;
  });

  // Count tickets per filter
  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    waiting_user: tickets.filter((t) => t.status === "waiting_user").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  // Open ticket modal & load conversation history
  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
    setReplyStatus("waiting_user");
    setReplyAttachmentUrl("");
    setReplySuccessMessage(null);
    setReplyErrorMessage(null);
    setIsLoadingReplies(true);

    try {
      const data = await fetchTicketDetailsApi(ticket.id);
      if (data.ticket) {
        setSelectedTicket(data.ticket);
      }
      setTicketReplies(data.replies || []);
    } catch (err: any) {
      console.warn("Failed to load replies:", err);
      setTicketReplies([]);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Auto-scroll conversation to bottom
  useEffect(() => {
    if (selectedTicket && !isLoadingReplies) {
      repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket, ticketReplies, isLoadingReplies]);

  // Handle submit reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSendingReply(true);
    setReplySuccessMessage(null);
    setReplyErrorMessage(null);

    try {
      const res = await replyTicketApi(
        selectedTicket.id,
        replyMessage.trim(),
        replyStatus,
        staffName || "Support Specialist",
        replyAttachmentUrl.trim() || undefined
      );

      if (res.success) {
        setReplySuccessMessage("Reply sent and ticket status updated successfully!");
        setReplyMessage("");
        setReplyAttachmentUrl("");

        // Append new reply to modal
        if (res.reply) {
          setTicketReplies((prev) => [...prev, res.reply!]);
        }

        // Update selected ticket status locally
        setSelectedTicket((prev) => (prev ? { ...prev, status: replyStatus } : null));

        // Notify parent handler to update status in main state
        onUpdateStatus(selectedTicket.id, replyStatus as any);
        if (onReload) onReload();

        setTimeout(() => setReplySuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setReplyErrorMessage(err.message || "Failed to submit reply. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Helper: Status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/40">
            <Check size={11} />
            Resolved
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-sky-950 text-sky-400 border border-sky-800/40">
            <Clock size={11} />
            In Progress
          </span>
        );
      case "waiting_user":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-purple-950 text-purple-400 border border-purple-800/40">
            <Clock size={11} />
            Waiting User
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
            <X size={11} />
            Closed
          </span>
        );
      case "open":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-800/40">
            <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
            Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck size={26} className="text-sky-400" />
            <span>Student Support Desk</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Review student inquiries, track communication threads, and post official staff replies directly to students.
          </p>
        </div>

        {onReload && (
          <button
            onClick={() => onReload()}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <RefreshCw size={14} />
            <span>Refresh Tickets</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: "all", label: "All" },
              { key: "open", label: "Open" },
              { key: "in_progress", label: "In Progress" },
              { key: "waiting_user", label: "Waiting" },
              { key: "resolved", label: "Resolved" },
              { key: "closed", label: "Closed" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition flex items-center gap-1.5 ${
                filter === item.key
                  ? "bg-sky-500 text-slate-950 font-black shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  filter === item.key ? "bg-slate-950/20 text-slate-950" : "bg-slate-900 text-slate-400"
                }`}
              >
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student, email, subject, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pr-3 pl-9 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 focus:bg-slate-900 transition"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            <MessageSquare size={36} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No support tickets found</h3>
            <p className="mt-1 text-xs text-slate-500">
              There are no support tickets matching your current filter criteria.
            </p>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-slate-800/90 bg-slate-900/60 p-5 sm:p-6 transition hover:border-slate-700"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-sky-400">
                      {t.ticketCode || `#TKT-${t.id}`}
                    </span>
                    {t.category && (
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {t.category}
                      </span>
                    )}
                    {renderStatusBadge(t.status)}
                  </div>

                  <h3 className="mt-1.5 font-black text-base text-white">{t.subject}</h3>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <User size={12} className="text-slate-500" />
                      {t.userName || `Student #${t.userId}`}
                    </span>
                    {t.userEmail && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Mail size={12} className="text-slate-500" />
                        {t.userEmail}
                      </span>
                    )}
                    <span>•</span>
                    <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Primary: View & Reply Button */}
                  <button
                    onClick={() => handleOpenTicket(t)}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition shadow-sm"
                  >
                    <MessageSquare size={14} />
                    <span>View & Reply</span>
                  </button>

                  {/* Quick Resolve Button */}
                  {t.status !== "resolved" && (
                    <button
                      onClick={() => onUpdateStatus(t.id, "resolved")}
                      className="flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                      title="Quick mark as resolved"
                    >
                      <Check size={13} />
                      <span className="hidden sm:inline">Resolve</span>
                    </button>
                  )}

                  {/* Quick In Progress Button */}
                  {t.status === "open" && (
                    <button
                      onClick={() => onUpdateStatus(t.id, "in_progress")}
                      className="rounded-xl border border-slate-800 px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
                      title="Mark as in progress"
                    >
                      In Progress
                    </button>
                  )}
                </div>
              </div>

              {/* Message Snippet */}
              <p className="mt-3.5 rounded-2xl bg-slate-950/70 p-3.5 text-xs text-slate-300 leading-relaxed line-clamp-2">
                {t.message}
              </p>

              {/* Attachment Preview if any */}
              {t.attachmentUrl && (
                <div className="mt-2.5">
                  <a
                    href={t.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:underline"
                  >
                    <Paperclip size={13} />
                    <span>View Student Attachment</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW & REPLY MODAL / DRAWER */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-sky-400">
                      {selectedTicket.ticketCode || `#TKT-${selectedTicket.id}`}
                    </span>
                    {selectedTicket.category && (
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {selectedTicket.category}
                      </span>
                    )}
                    {renderStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="font-black text-base text-white truncate max-w-md sm:max-w-xl">
                    {selectedTicket.subject}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Student Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 bg-slate-950/40 px-6 py-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <User size={13} className="text-slate-500" />
                  {selectedTicket.userName || `Student #${selectedTicket.userId}`}
                </span>
                {selectedTicket.userEmail && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Mail size={13} className="text-slate-500" />
                    {selectedTicket.userEmail}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Created: {new Date(selectedTicket.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Conversation Stream (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[46vh]">
              {/* Message #1: Student Initial Inquiry */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex size-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold text-xs shrink-0">
                  {selectedTicket.userName?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      {selectedTicket.userName || "Student"} <span className="text-slate-500 font-normal">(Initial Inquiry)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.message}
                  </p>

                  {selectedTicket.attachmentUrl && (
                    <div className="mt-2.5">
                      <a
                        href={selectedTicket.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                      >
                        <Paperclip size={13} />
                        <span>View Attachment</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies History */}
              {isLoadingReplies ? (
                <div className="flex items-center justify-center py-6 text-slate-500">
                  <RefreshCw size={18} className="animate-spin mr-2" />
                  <span className="text-xs font-semibold">Loading conversation thread...</span>
                </div>
              ) : (
                ticketReplies.map((r) => {
                  const isStaff = r.senderRole === "support" || r.senderRole === "admin";
                  return (
                    <div
                      key={r.id}
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        isStaff
                          ? "border-sky-500/30 bg-sky-950/20 ml-4 sm:ml-8"
                          : "border-slate-800 bg-slate-950/60 mr-4 sm:mr-8"
                      }`}
                    >
                      <div
                        className={`flex size-9 items-center justify-center rounded-full font-bold text-xs shrink-0 ${
                          isStaff
                            ? "bg-sky-500 text-slate-950 ring-2 ring-sky-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {isStaff ? <ShieldCheck size={16} /> : r.senderName?.[0]?.toUpperCase() || "U"}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{r.senderName}</span>
                            {isStaff && (
                              <span className="rounded-full bg-sky-950 border border-sky-800/40 px-2 py-0.2 text-[10px] font-black text-sky-400">
                                Support Team (Staff)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {r.message}
                        </p>

                        {r.attachmentUrl && (
                          <div className="mt-2.5">
                            <a
                              href={r.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-sky-400 hover:underline"
                            >
                              <Paperclip size={13} />
                              <span>View Attached File</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={repliesEndRef} />
            </div>

            {/* Notification / Feedback alerts */}
            {replySuccessMessage && (
              <div className="mx-6 mb-2 flex items-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-400 animate-in fade-in">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{replySuccessMessage}</span>
              </div>
            )}
            {replyErrorMessage && (
              <div className="mx-6 mb-2 flex items-center gap-2 rounded-xl border border-rose-800/40 bg-rose-950/40 p-3 text-xs font-bold text-rose-400 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{replyErrorMessage}</span>
              </div>
            )}

            {/* Staff Reply Composer Box */}
            <div className="border-t border-slate-800 bg-slate-950/80 p-5">
              <form onSubmit={handleSendReply} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Replying as:</span>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="Staff Name"
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-sky-400 font-bold outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Status after reply:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white font-bold outline-none focus:border-sky-500"
                    >
                      <option value="waiting_user">Waiting for User</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Close Ticket</option>
                      <option value="open">Keep Open</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Type your professional response to the student here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-1">
                    <Paperclip size={14} className="text-slate-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Optional attachment URL (e.g. image/drive link)"
                      value={replyAttachmentUrl}
                      onChange={(e) => setReplyAttachmentUrl(e.target.value)}
                      className="w-full sm:w-80 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="rounded-xl border border-slate-800 px-3.5 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReply || !replyMessage.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isSendingReply ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send Reply to Student</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
