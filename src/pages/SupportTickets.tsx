import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Lock,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  Tag,
  Calendar,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { SupportTicket, SupportTicketReply, TicketInternalNote, SupportMetrics } from "../lib/types";
import {
  fetchTicketDetailsApi,
  replyTicketApi,
  addTicketInternalNoteApi,
  updateTicketPriorityApi,
  assignTicketStaffApi,
  fetchSupportMetricsApi,
} from "../lib/api";

interface SupportTicketsProps {
  tickets: SupportTicket[];
  onUpdateStatus: (ticketId: number, status: string) => void;
  onReload?: () => void;
}

// Canonical status definitions
type CanonicalStatus = "all" | "open" | "pending" | "in_progress" | "waiting_customer" | "solved" | "closed";
type CanonicalPriority = "all" | "low" | "medium" | "high" | "urgent";

function normalizeStatus(status?: string): string {
  if (!status) return "open";
  const s = status.toLowerCase();
  if (s === "waiting_user" || s === "waiting for customer") return "waiting_customer";
  if (s === "resolved" || s === "solve") return "solved";
  if (s === "in-progress") return "in_progress";
  return s;
}

function normalizePriority(p?: string): "low" | "medium" | "high" | "urgent" {
  if (!p) return "medium";
  const lp = p.toLowerCase();
  if (lp === "urgent" || lp === "critical") return "urgent";
  if (lp === "high") return "high";
  if (lp === "low") return "low";
  return "medium";
}

export const SupportTickets: React.FC<SupportTicketsProps> = ({
  tickets,
  onUpdateStatus,
  onReload,
}) => {
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<CanonicalStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<CanonicalPriority>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "updated">("newest");

  // Metrics from API
  const [serverMetrics, setServerMetrics] = useState<SupportMetrics | null>(null);

  // Modal / Drawer State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"chat" | "notes">("chat");
  const [ticketReplies, setTicketReplies] = useState<SupportTicketReply[]>([]);
  const [internalNotes, setInternalNotes] = useState<TicketInternalNote[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Reply Form State
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<string>("waiting_customer");
  const [staffName, setStaffName] = useState<string>("Support Specialist");
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState<string>("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
  const [replyErrorMessage, setReplyErrorMessage] = useState<string | null>(null);

  // Internal Note Form State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteAuthorName, setNoteAuthorName] = useState("Staff Specialist");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccessMessage, setNoteSuccessMessage] = useState<string | null>(null);
  const [noteErrorMessage, setNoteErrorMessage] = useState<string | null>(null);

  // Property editing inside modal
  const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);
  const [propertyFeedback, setPropertyFeedback] = useState<string | null>(null);

  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  // Load metrics on mount
  useEffect(() => {
    fetchSupportMetricsApi()
      .then((m) => {
        if (m) setServerMetrics(m);
      })
      .catch(() => {});
  }, [tickets]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tickets]);

  // Calculate live counts per status
  const counts = useMemo(() => {
    const c = {
      all: tickets.length,
      open: 0,
      pending: 0,
      in_progress: 0,
      waiting_customer: 0,
      solved: 0,
      closed: 0,
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    tickets.forEach((t) => {
      const norm = normalizeStatus(t.status);
      if (norm === "open") c.open++;
      else if (norm === "pending") c.pending++;
      else if (norm === "in_progress") c.in_progress++;
      else if (norm === "waiting_customer") c.waiting_customer++;
      else if (norm === "solved") c.solved++;
      else if (norm === "closed") c.closed++;

      const p = normalizePriority(t.priority);
      c[p]++;
    });
    return c;
  }, [tickets]);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        const normStatus = normalizeStatus(t.status);
        if (statusFilter !== "all" && normStatus !== statusFilter) return false;

        const normPriority = normalizePriority(t.priority);
        if (priorityFilter !== "all" && normPriority !== priorityFilter) return false;

        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const codeMatch = t.ticketCode?.toLowerCase().includes(q);
          const subjectMatch = t.subject?.toLowerCase().includes(q);
          const messageMatch = t.message?.toLowerCase().includes(q);
          const nameMatch = t.userName?.toLowerCase().includes(q);
          const emailMatch = t.userEmail?.toLowerCase().includes(q);
          const staffMatch = t.assignedStaff?.toLowerCase().includes(q);
          const idMatch = String(t.id).includes(q) || String(t.userId).includes(q);
          if (!codeMatch && !subjectMatch && !messageMatch && !nameMatch && !emailMatch && !staffMatch && !idMatch) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "updated") {
          const timeA = new Date(a.updatedAt || a.createdAt).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt).getTime();
          return timeB - timeA;
        }
        if (sortBy === "priority") {
          const weight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          const pA = weight[normalizePriority(a.priority)] || 1;
          const pB = weight[normalizePriority(b.priority)] || 1;
          return pB - pA;
        }
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tickets, statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  // Open ticket modal & load conversation history and notes
  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setActiveModalTab("chat");
    setReplyMessage("");
    setReplyStatus("waiting_customer");
    setReplyAttachmentUrl("");
    setReplySuccessMessage(null);
    setReplyErrorMessage(null);
    setNewNoteContent("");
    setNoteSuccessMessage(null);
    setNoteErrorMessage(null);
    setPropertyFeedback(null);
    setIsLoadingDetails(true);

    try {
      const data = await fetchTicketDetailsApi(ticket.id);
      if (data.ticket) {
        setSelectedTicket(data.ticket);
      }
      setTicketReplies(data.replies || []);
      setInternalNotes(data.internalNotes || []);
    } catch (err: any) {
      console.warn("Failed to load ticket details:", err);
      setTicketReplies([]);
      setInternalNotes([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Real-time polling for ticket replies and status while modal is open
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(async () => {
      try {
        const data = await fetchTicketDetailsApi(selectedTicket.id);
        if (data.replies && data.replies.length > 0) {
          setTicketReplies((prev) => {
            if (prev.length !== data.replies.length) {
              return data.replies;
            }
            return prev;
          });
        }
        if (data.ticket) {
          setSelectedTicket((prev) => {
            if (!prev) return data.ticket;
            if (prev.status !== data.ticket?.status || prev.updatedAt !== data.ticket?.updatedAt) {
              return { ...prev, ...data.ticket };
            }
            return prev;
          });
        }
      } catch {}
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  // Auto-scroll conversation to bottom
  useEffect(() => {
    if (selectedTicket && activeModalTab === "chat" && !isLoadingDetails) {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket, ticketReplies, activeModalTab, isLoadingDetails]);

  // Handle staff reply submission
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
        setReplySuccessMessage("Staff reply sent successfully! Ticket status updated.");
        setReplyMessage("");
        setReplyAttachmentUrl("");

        if (res.reply) {
          setTicketReplies((prev) => [...prev, res.reply!]);
        }

        setSelectedTicket((prev) =>
          prev ? { ...prev, status: replyStatus, assignedStaff: staffName || prev.assignedStaff } : null
        );

        onUpdateStatus(selectedTicket.id, replyStatus);
        if (onReload) onReload();

        setTimeout(() => setReplySuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setReplyErrorMessage(err.message || "Failed to submit reply. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Handle internal note submission
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newNoteContent.trim()) return;

    setIsSavingNote(true);
    setNoteSuccessMessage(null);
    setNoteErrorMessage(null);

    try {
      const res = await addTicketInternalNoteApi(
        selectedTicket.id,
        newNoteContent.trim(),
        noteAuthorName || "Staff Specialist"
      );

      if (res.success && res.note) {
        setInternalNotes((prev) => [res.note!, ...prev]);
        setNewNoteContent("");
        setNoteSuccessMessage("Private note saved for support team.");
        setTimeout(() => setNoteSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      setNoteErrorMessage(err.message || "Failed to save internal note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle inline property changes
  const handleInlineStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    setIsUpdatingProperty(true);
    setPropertyFeedback(null);
    try {
      onUpdateStatus(selectedTicket.id, newStatus);
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      setPropertyFeedback(`Status updated to ${newStatus.replace("_", " ")}`);
      setTimeout(() => setPropertyFeedback(null), 3000);
      if (onReload) onReload();
    } catch (err: any) {
      setPropertyFeedback("Error updating status");
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  const handleInlinePriorityChange = async (newPriority: string) => {
    if (!selectedTicket) return;
    setIsUpdatingProperty(true);
    setPropertyFeedback(null);
    try {
      await updateTicketPriorityApi(selectedTicket.id, newPriority);
      setSelectedTicket((prev) => (prev ? { ...prev, priority: newPriority } : null));
      setPropertyFeedback(`Priority updated to ${newPriority}`);
      setTimeout(() => setPropertyFeedback(null), 3000);
      if (onReload) onReload();
    } catch (err: any) {
      setPropertyFeedback("Error updating priority");
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  const handleInlineAssignStaff = async (newStaff: string) => {
    if (!selectedTicket) return;
    setIsUpdatingProperty(true);
    setPropertyFeedback(null);
    try {
      await assignTicketStaffApi(selectedTicket.id, newStaff);
      setSelectedTicket((prev) => (prev ? { ...prev, assignedStaff: newStaff } : null));
      setPropertyFeedback(`Ticket assigned to ${newStaff}`);
      setTimeout(() => setPropertyFeedback(null), 3000);
      if (onReload) onReload();
    } catch (err: any) {
      setPropertyFeedback("Error assigning staff");
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  // Status Badge Renderer
  const renderStatusBadge = (rawStatus: string) => {
    const s = normalizeStatus(rawStatus);
    switch (s) {
      case "solved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <Check size={11} className="stroke-[3]" />
            Solved
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-sky-950/80 text-sky-400 border border-sky-800/40">
            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
            In Progress
          </span>
        );
      case "waiting_customer":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-purple-950/80 text-purple-300 border border-purple-800/40">
            <Clock size={11} />
            Waiting for Customer
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-amber-950/80 text-amber-300 border border-amber-800/40">
            <Clock size={11} />
            Pending
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-slate-800/80 text-slate-400 border border-slate-700">
            <X size={11} />
            Closed
          </span>
        );
      case "open":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
            Open
          </span>
        );
    }
  };

  // Priority Badge Renderer
  const renderPriorityBadge = (rawPriority?: string) => {
    const p = normalizePriority(rawPriority);
    switch (p) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Flame size={11} className="text-rose-400 fill-rose-500/20" />
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <ArrowUp size={11} className="stroke-[2.5]" />
            High
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase bg-slate-800/80 text-slate-400 border border-slate-700/60">
            <ArrowDown size={11} />
            Low
          </span>
        );
      case "medium":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Minus size={11} />
            Medium
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* SaaS Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/80 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Support Desk Workspace</span>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-black text-sky-300 border border-sky-500/30 uppercase">
                  SaaS v2.0
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Multi-channel ticket management, real-time customer messaging, priority triage, and private internal notes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {onReload && (
            <button
              onClick={() => onReload()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition shadow-sm"
            >
              <RefreshCw size={13} />
              <span>Refresh Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Dashboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", count: counts.all, color: "text-slate-200", border: "border-slate-800", bg: "bg-slate-900/60" },
          { label: "Open", count: counts.open, color: "text-rose-400", border: "border-rose-900/40", bg: "bg-rose-950/20" },
          { label: "Pending", count: counts.pending, color: "text-amber-300", border: "border-amber-900/40", bg: "bg-amber-950/20" },
          { label: "In Progress", count: counts.in_progress, color: "text-sky-400", border: "border-sky-900/40", bg: "bg-sky-950/20" },
          { label: "Waiting Customer", count: counts.waiting_customer, color: "text-purple-300", border: "border-purple-900/40", bg: "bg-purple-950/20" },
          { label: "Solved", count: counts.solved, color: "text-emerald-400", border: "border-emerald-900/40", bg: "bg-emerald-950/20" },
          { label: "Closed", count: counts.closed, color: "text-slate-400", border: "border-slate-800", bg: "bg-slate-900/40" },
        ].map((m, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border ${m.border} ${m.bg} p-3 sm:p-4 transition hover:border-slate-700`}
          >
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</div>
            <div className={`mt-1 text-2xl font-black ${m.color}`}>{m.count}</div>
          </div>
        ))}
      </div>

      {/* Priority Distribution & SLAs Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-400 flex items-center gap-1.5">
            <Layers size={13} className="text-slate-500" />
            Priority Breakdown:
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
            <Flame size={12} /> Urgent: <strong className="text-white">{counts.urgent}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-orange-400 font-bold">
            <ArrowUp size={12} /> High: <strong className="text-white">{counts.high}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
            <Minus size={12} /> Medium: <strong className="text-white">{counts.medium}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-400 font-bold">
            <ArrowDown size={12} /> Low: <strong className="text-white">{counts.low}</strong>
          </span>
        </div>

        {serverMetrics && (
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>
              Avg First Response: <strong className="text-sky-300">{serverMetrics.avgResponseMinutes} min</strong>
            </span>
            <span>•</span>
            <span>
              Avg Resolution: <strong className="text-emerald-300">{serverMetrics.avgResolutionHours} hrs</strong>
            </span>
          </div>
        )}
      </div>

      {/* Filter, Search & Sort Control Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "all", label: "All Tickets", count: counts.all },
              { key: "open", label: "Open", count: counts.open },
              { key: "pending", label: "Pending", count: counts.pending },
              { key: "in_progress", label: "In Progress", count: counts.in_progress },
              { key: "waiting_customer", label: "Waiting Customer", count: counts.waiting_customer },
              { key: "solved", label: "Solved", count: counts.solved },
              { key: "closed", label: "Closed", count: counts.closed },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === item.key
                  ? "bg-sky-500 text-slate-950 font-black shadow-sm"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  statusFilter === item.key ? "bg-slate-950/20 text-slate-950" : "bg-slate-900 text-slate-400"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="updated">Sort: Recently Updated</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, student, email, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-1.5 pr-3 pl-9 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ticket List Cards */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center text-slate-500">
            <MessageSquare size={38} className="mx-auto text-slate-700 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">No support tickets match your filters</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your status, priority, or search query.
            </p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="group rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5 sm:p-6 transition hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-sky-400">
                      {t.ticketCode || `#TKT-${t.id}`}
                    </span>
                    {t.category && (
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {t.category}
                      </span>
                    )}
                    {renderPriorityBadge(t.priority)}
                    {renderStatusBadge(t.status)}
                    {t.assignedStaff && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700/50">
                        <UserCheck size={11} className="text-sky-400" />
                        {t.assignedStaff}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-base text-white group-hover:text-sky-300 transition">
                    {t.subject}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
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
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar size={11} />
                      Created {new Date(t.createdAt).toLocaleString()}
                    </span>
                    {t.lastReplyAt && (
                      <>
                        <span>•</span>
                        <span className="text-slate-400 font-medium">
                          Last reply: {new Date(t.lastReplyAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                  <button
                    onClick={() => handleOpenTicket(t)}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition shadow-sm"
                  >
                    <MessageSquare size={13} />
                    <span>Open & Reply</span>
                  </button>

                  {normalizeStatus(t.status) !== "solved" && (
                    <button
                      onClick={() => onUpdateStatus(t.id, "solved")}
                      className="flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                      title="Quick mark as solved"
                    >
                      <Check size={13} />
                      <span className="hidden sm:inline">Solve</span>
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
      {/* 2-COLUMN VIEW & REPLY SAAS WORKSPACE MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex h-[94vh] w-full max-w-6xl flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/95">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <MessageSquare size={20} />
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
                    {renderPriorityBadge(selectedTicket.priority)}
                    {renderStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="font-black text-base text-white truncate max-w-md sm:max-w-xl">
                    {selectedTicket.subject}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {propertyFeedback && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded-lg px-2.5 py-1 animate-in fade-in">
                    {propertyFeedback}
                  </span>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* Left Column (8 cols): Conversation / Notes & Composer */}
              <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
                {/* Tabs switcher: Conversation vs Internal Notes */}
                <div className="flex items-center border-b border-slate-800/80 bg-slate-950/50 px-6 py-2.5 gap-4">
                  <button
                    onClick={() => setActiveModalTab("chat")}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                      activeModalTab === "chat"
                        ? "bg-sky-500 text-slate-950 font-black shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>Customer Chat</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        activeModalTab === "chat" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ticketReplies.length + 1}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModalTab("notes")}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                      activeModalTab === "notes"
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : "text-amber-300/80 hover:text-amber-200"
                    }`}
                  >
                    <Lock size={13} />
                    <span>Internal Staff Notes</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        activeModalTab === "notes" ? "bg-slate-950/20 text-slate-950" : "bg-amber-950/60 text-amber-300"
                      }`}
                    >
                      {internalNotes.length}
                    </span>
                  </button>
                </div>

                {/* Content Stream Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <RefreshCw size={24} className="animate-spin mb-2 text-sky-400" />
                      <span className="text-xs font-semibold">Loading conversation & notes...</span>
                    </div>
                  ) : activeModalTab === "chat" ? (
                    <>
                      {/* Student Initial Inquiry Box */}
                      <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="flex size-9 items-center justify-center rounded-full bg-slate-800 text-slate-200 font-bold text-xs shrink-0 ring-2 ring-slate-700">
                          {selectedTicket.userName?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">
                              {selectedTicket.userName || "Student"}{" "}
                              <span className="text-slate-500 font-normal">(Initial Inquiry)</span>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(selectedTicket.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
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

                      {/* Reply Messages Stream */}
                      {ticketReplies.map((r) => {
                        const isStaff = r.senderRole === "support" || r.senderRole === "admin";
                        return (
                          <div
                            key={r.id}
                            className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                              isStaff
                                ? "border-sky-500/30 bg-sky-950/25 ml-4 sm:ml-8"
                                : "border-slate-800 bg-slate-950/60 mr-4 sm:mr-8"
                            }`}
                          >
                            <div
                              className={`flex size-9 items-center justify-center rounded-full font-bold text-xs shrink-0 ${
                                isStaff
                                  ? "bg-sky-500 text-slate-950 ring-2 ring-sky-500/40"
                                  : "bg-slate-800 text-slate-200"
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
                                      Support Team
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                  <span>
                                    {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {isStaff && <CheckCircle size={10} className="text-sky-400" />}
                                </div>
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
                      })}
                      <div ref={conversationEndRef} />
                    </>
                  ) : (
                    /* Internal Staff Notes View */
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-start gap-3">
                        <Lock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-amber-300">Confidential Internal Notes</strong>
                          Notes added here are strictly visible to admins and support specialists. Customers will never see these notes.
                        </div>
                      </div>

                      {/* Add Note Form */}
                      <form onSubmit={handleAddInternalNote} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Lock size={13} className="text-amber-400" />
                            Write a private staff note
                          </span>
                          <input
                            type="text"
                            value={noteAuthorName}
                            onChange={(e) => setNoteAuthorName(e.target.value)}
                            placeholder="Your Name"
                            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-amber-300 font-bold outline-none focus:border-amber-500"
                          />
                        </div>

                        <textarea
                          rows={3}
                          required
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Document findings, refund checks, issue root cause, or handover instructions..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 transition"
                        />

                        <div className="flex items-center justify-end">
                          <button
                            type="submit"
                            disabled={isSavingNote || !newNoteContent.trim()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition disabled:opacity-50"
                          >
                            <Lock size={13} />
                            <span>{isSavingNote ? "Saving Note..." : "Save Internal Note"}</span>
                          </button>
                        </div>
                      </form>

                      {/* Existing Notes List */}
                      {internalNotes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
                          No internal notes have been added yet for this ticket.
                        </div>
                      ) : (
                        internalNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-2xl border border-amber-500/20 bg-amber-950/15 p-4 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                <Lock size={12} className="text-amber-400" />
                                {note.authorName}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Alerts / Feedback */}
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
                {noteSuccessMessage && (
                  <div className="mx-6 mb-2 flex items-center gap-2 rounded-xl border border-amber-800/40 bg-amber-950/40 p-3 text-xs font-bold text-amber-300 animate-in fade-in">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{noteSuccessMessage}</span>
                  </div>
                )}

                {/* Left Column Bottom: Staff Reply Composer (shown on Chat Tab) */}
                {activeModalTab === "chat" && (
                  <div className="border-t border-slate-800 bg-slate-950/90 p-4">
                    <form onSubmit={handleSendReply} className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-300">Staff:</span>
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
                            <option value="waiting_customer">Waiting for Customer</option>
                            <option value="in_progress">In Progress</option>
                            <option value="solved">Mark as Solved</option>
                            <option value="closed">Close Ticket</option>
                            <option value="pending">Mark as Pending</option>
                            <option value="open">Keep Open</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        required
                        placeholder="Write a clear, professional response to the customer..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-1">
                          <Paperclip size={14} className="text-slate-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="Optional attachment URL (image / document)"
                            value={replyAttachmentUrl}
                            onChange={(e) => setReplyAttachmentUrl(e.target.value)}
                            className="w-full sm:w-80 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-sky-500"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSendingReply || !replyMessage.trim()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-sky-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md self-end sm:self-auto"
                        >
                          {isSendingReply ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Send Customer Reply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column (4 cols): Properties Sidebar & Customer CRM */}
              <div className="lg:col-span-4 bg-slate-950/60 p-6 space-y-6 overflow-y-auto">
                {/* Ticket Properties */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <SlidersHorizontal size={13} />
                    <span>Ticket Properties</span>
                  </h4>

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Lifecycle Status</label>
                    <select
                      value={normalizeStatus(selectedTicket.status)}
                      onChange={(e) => handleInlineStatusChange(e.target.value)}
                      disabled={isUpdatingProperty}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-500"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_customer">Waiting for Customer</option>
                      <option value="solved">Solved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Ticket Priority</label>
                    <select
                      value={normalizePriority(selectedTicket.priority)}
                      onChange={(e) => handleInlinePriorityChange(e.target.value)}
                      disabled={isUpdatingProperty}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-500"
                    >
                      <option value="urgent">🔥 Urgent Priority</option>
                      <option value="high">🔺 High Priority</option>
                      <option value="medium">➖ Medium Priority</option>
                      <option value="low">🔽 Low Priority</option>
                    </select>
                  </div>

                  {/* Assigned Agent */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400">Assigned Support Agent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={selectedTicket.assignedStaff || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (selectedTicket.assignedStaff || "")) {
                            handleInlineAssignStaff(e.target.value);
                          }
                        }}
                        placeholder="Unassigned (Type name & blur)"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-sky-400 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Information (CRM Card) */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User size={13} />
                    <span>Customer Details</span>
                  </h4>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-slate-800 text-slate-200 font-bold">
                        {selectedTicket.userName?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {selectedTicket.userName || `Student #${selectedTicket.userId}`}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          User ID: {selectedTicket.userId || "Guest"}
                        </div>
                      </div>
                    </div>

                    {selectedTicket.userEmail && (
                      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5 text-slate-400 truncate">
                          <Mail size={12} className="text-slate-500 shrink-0" />
                          <span className="truncate">{selectedTicket.userEmail}</span>
                        </span>
                        <a
                          href={`mailto:${selectedTicket.userEmail}?subject=Support: ${encodeURIComponent(selectedTicket.subject)}`}
                          className="text-[10px] text-sky-400 hover:underline shrink-0 font-bold"
                        >
                          Email Student
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Timeline Meta */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Calendar size={13} />
                    <span>Audit Timeline</span>
                  </h4>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Created:</span>
                      <span className="font-semibold text-slate-300">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedTicket.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Updated:</span>
                        <span className="font-semibold text-slate-300">
                          {new Date(selectedTicket.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedTicket.firstResponseAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">First Staff Response:</span>
                        <span className="font-semibold text-sky-400">
                          {new Date(selectedTicket.firstResponseAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}
                    {selectedTicket.solvedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Solved At:</span>
                        <span className="font-semibold text-emerald-400">
                          {new Date(selectedTicket.solvedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
