import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  PackageCheck,
  Receipt,
  CheckCheck,
  Check,
  Clock,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Filter,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";
import {
  SupportConversation,
  SupportMessage,
  CustomerSupportContext,
} from "../lib/types";
import {
  fetchSupportConversationsApi,
  fetchConversationMessagesApi,
  sendAdminReplyApi,
  markConversationReadApi,
  fetchCustomerContextApi,
} from "../lib/api";

interface SupportMessagesProps {
  onReload?: () => void;
}

export const SupportMessages: React.FC<SupportMessagesProps> = ({ onReload }) => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [customerContext, setCustomerContext] = useState<CustomerSupportContext | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [showMobileContext, setShowMobileContext] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Load Conversations
  const loadConversations = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingConversations(true);
    try {
      const data = await fetchSupportConversationsApi();
      setConversations(data);
    } catch (err) {
      console.warn("[SupportMessages] loadConversations error:", err);
    } finally {
      if (!quiet) setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => {
      loadConversations(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  // 2. Load Messages for Active Conversation
  const loadMessages = useCallback(async (quiet = false) => {
    if (!selectedConversationId) return;
    if (!quiet) setIsLoadingMessages(true);
    try {
      const msgs = await fetchConversationMessagesApi(selectedConversationId);
      setMessages(msgs);
      if (!quiet) {
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.warn("[SupportMessages] loadMessages error:", err);
    } finally {
      if (!quiet) setIsLoadingMessages(false);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages();
      const interval = setInterval(() => {
        loadMessages(true);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId, loadMessages]);

  // 3. Load Customer Context (Profile, Entitlements, Orders)
  const loadCustomerContext = useCallback(async () => {
    if (!activeConversation?.customerId) {
      setCustomerContext(null);
      return;
    }
    setIsLoadingContext(true);
    try {
      const ctx = await fetchCustomerContextApi(activeConversation.customerId);
      setCustomerContext(ctx);
    } catch (err) {
      console.warn("[SupportMessages] loadCustomerContext error:", err);
      setCustomerContext(null);
    } finally {
      setIsLoadingContext(false);
    }
  }, [activeConversation?.customerId]);

  useEffect(() => {
    loadCustomerContext();
  }, [loadCustomerContext]);

  // 4. Auto Mark Read when viewing conversation with unread count
  useEffect(() => {
    if (selectedConversationId && activeConversation && activeConversation.unreadCount > 0) {
      markConversationReadApi(selectedConversationId)
        .then(() => {
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c))
          );
          if (onReload) onReload();
        })
        .catch(console.warn);
    }
  }, [selectedConversationId, activeConversation?.unreadCount, onReload]);

  // 5. Send Admin Reply
  const handleSendReply = async () => {
    if (!selectedConversationId || !replyMessage.trim() || isSendingReply) return;
    const text = replyMessage.trim();
    setIsSendingReply(true);

    try {
      const res = await sendAdminReplyApi(selectedConversationId, text);
      setReplyMessage("");
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message!]);
      } else {
        await loadMessages(true);
      }
      await loadConversations(true);
      setTimeout(scrollToBottom, 50);
      if (textareaRef.current) textareaRef.current.focus();
    } catch (err: any) {
      alert("Failed to send reply: " + (err.message || "Unknown error"));
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Filtered Conversations List
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (unreadOnlyFilter && c.unreadCount === 0) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = c.customer?.name?.toLowerCase() || "";
      const email = c.customer?.email?.toLowerCase() || "";
      const lastMsg = c.lastMessage?.message?.toLowerCase() || "";
      return name.includes(q) || email.includes(q) || lastMsg.includes(q);
    });
  }, [conversations, searchQuery, unreadOnlyFilter]);

  const totalUnreadAll = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] rounded-2xl border border-slate-800 bg-[#070e1b] overflow-hidden shadow-2xl">
      {/* Top Banner / Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MessageSquare size={18} />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              Direct Customer Support Messaging
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h1>
            <p className="text-[11px] text-slate-400">
              1-on-1 real-time direct dialogue with customer account context
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalUnreadAll > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
              <span className="size-2 rounded-full bg-amber-400 animate-ping"></span>
              {totalUnreadAll} Unread {totalUnreadAll === 1 ? "Message" : "Messages"}
            </div>
          )}

          <button
            onClick={() => {
              loadConversations();
              if (selectedConversationId) {
                loadMessages();
                loadCustomerContext();
              }
            }}
            disabled={isLoadingConversations || isLoadingMessages}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/60 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <RefreshCw
              size={13}
              className={isLoadingConversations || isLoadingMessages ? "animate-spin text-sky-400" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main 3-Panel Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
        {/* ============================================================== */}
        {/* PANEL 1: CUSTOMER CONVERSATION LIST (Col span 3-4)            */}
        {/* ============================================================== */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-800/80 bg-[#070e1b] flex flex-col min-h-0">
          {/* Search & Filter Bar */}
          <div className="p-3.5 border-b border-slate-800/80 space-y-2.5 bg-slate-900/40">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers or messages..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setUnreadOnlyFilter(!unreadOnlyFilter)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  unreadOnlyFilter
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                    : "border border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white"
                }`}
              >
                <Filter size={12} />
                <span>Unread Only</span>
              </button>

              <span className="text-[11px] text-slate-500 font-medium">
                {filteredConversations.length} conversation{filteredConversations.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850/40">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <RefreshCw size={24} className="animate-spin text-sky-400 mb-2" />
                <p className="text-xs">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <MessageSquare size={32} className="text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-400">No conversations found</p>
                <p className="text-[11px] text-slate-500">
                  {searchQuery || unreadOnlyFilter
                    ? "Try clearing filters"
                    : "Customer conversations will appear here"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId;
                const hasUnread = conv.unreadCount > 0;
                const lastMsg = conv.lastMessage;
                const customerName = conv.customer?.name || `Customer #${conv.customerId}`;
                const initial = customerName.charAt(0).toUpperCase();

                const timeStr = lastMsg?.createdAt
                  ? formatRelativeTime(lastMsg.createdAt)
                  : conv.createdAt
                  ? formatRelativeTime(conv.createdAt)
                  : "";

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      setShowMobileContext(false);
                    }}
                    className={`w-full text-left p-3.5 transition-all duration-150 flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-sky-500/10 border-l-4 border-l-sky-500"
                        : "hover:bg-slate-800/40 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {conv.customer?.avatar ? (
                        <img
                          src={conv.customer.avatar}
                          alt={customerName}
                          className="size-10 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 font-black text-white text-xs shadow-md">
                          {initial}
                        </div>
                      )}
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-amber-500 border-2 border-[#070e1b]"></span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-sky-300" : hasUnread ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {customerName}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 font-medium">{timeStr}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mb-1">
                        {conv.customer?.email || `Customer ID: #${conv.customerId}`}
                      </div>

                      {/* Last message preview */}
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-[11px] truncate ${
                            hasUnread ? "font-bold text-slate-200" : "text-slate-400"
                          }`}
                        >
                          {lastMsg ? (
                            <>
                              {lastMsg.senderRole === "admin" && (
                                <span className="text-sky-400 font-semibold">You: </span>
                              )}
                              {lastMsg.message}
                            </>
                          ) : (
                            <span className="italic text-slate-500">No messages yet</span>
                          )}
                        </p>

                        {hasUnread && (
                          <span className="shrink-0 flex items-center justify-center size-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL 2: ACTIVE CHAT THREAD (Col span 5-6)                     */}
        {/* ============================================================== */}
        <div className="md:col-span-8 lg:col-span-6 flex flex-col min-h-0 bg-[#060c18] border-r border-slate-800/80">
          {activeConversation ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 font-bold text-white text-xs">
                    {(activeConversation.customer?.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {activeConversation.customer?.name || `Customer #${activeConversation.customerId}`}
                      </span>
                      <span className="rounded-md bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.2 text-[9px] font-bold text-sky-400 uppercase tracking-wider">
                        Customer
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {activeConversation.customer?.email || `Account #${activeConversation.customerId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile toggle for Context Panel */}
                  <button
                    onClick={() => setShowMobileContext(!showMobileContext)}
                    className="lg:hidden flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[11px] font-bold text-slate-300"
                  >
                    <Info size={13} />
                    <span>{showMobileContext ? "Hide Info" : "Customer Info"}</span>
                  </button>

                  <button
                    onClick={() => loadMessages()}
                    disabled={isLoadingMessages}
                    className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                    title="Refresh Thread"
                  >
                    <RefreshCw size={13} className={isLoadingMessages ? "animate-spin text-sky-400" : ""} />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-0">
                {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <RefreshCw size={24} className="animate-spin text-sky-400 mb-2" />
                    <p className="text-xs">Loading dialogue...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                    <MessageSquare size={36} className="text-slate-600" />
                    <p className="text-xs font-bold text-slate-400">No message history yet</p>
                    <p className="text-[11px] text-slate-500 text-center max-w-xs">
                      Send a message below to start communicating directly with this customer.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isAdmin = msg.senderRole === "admin" || msg.senderRole === "support";
                    const isCustomer = !isAdmin;
                    const showDateHeader =
                      index === 0 ||
                      new Date(messages[index - 1].createdAt).toDateString() !==
                        new Date(msg.createdAt).toDateString();

                    return (
                      <React.Fragment key={msg.id || index}>
                        {showDateHeader && (
                          <div className="flex items-center justify-center my-3">
                            <span className="rounded-full bg-slate-850 px-3 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-800">
                              {formatMessageDate(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2.5 ${
                            isAdmin ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* Customer Avatar on Left */}
                          {isCustomer && (
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
                              {(activeConversation.customer?.name || "C").charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed whitespace-pre-wrap break-words ${
                              isAdmin
                                ? "bg-sky-600 text-white rounded-br-none border border-sky-400/20"
                                : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider ${
                                  isAdmin ? "text-sky-200" : "text-sky-400"
                                }`}
                              >
                                {isAdmin ? "Support Staff" : activeConversation.customer?.name || "Customer"}
                              </span>
                              <span
                                className={`text-[9px] ${
                                  isAdmin ? "text-sky-100/80" : "text-slate-400"
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>

                            <p className="font-medium text-[12px]">{msg.message}</p>

                            {/* Read Status for Admin messages */}
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-sky-200/80">
                                {msg.readAt ? (
                                  <>
                                    <span>Seen</span>
                                    <CheckCheck size={12} className="text-sky-200" />
                                  </>
                                ) : (
                                  <>
                                    <span>Sent</span>
                                    <Check size={12} className="text-sky-200" />
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Admin Avatar on Right */}
                          {isAdmin && (
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500 font-black text-[10px] text-slate-950 shadow-md">
                              COC
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Box (Text-only, strictly no uploads) */}
              <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/70 backdrop-blur-sm">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 focus-within:border-sky-500 transition shadow-inner">
                  <textarea
                    ref={textareaRef}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Type your reply to customer... (Press Enter to send, Shift+Enter for newline)"
                    className="w-full resize-none bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between border-t border-slate-850 pt-2 mt-1">
                    <span className="text-[10px] text-slate-500">
                      Direct 1-on-1 dialogue with customer
                    </span>

                    <div className="flex items-center gap-2">
                      {replyMessage && (
                        <button
                          type="button"
                          onClick={() => setReplyMessage("")}
                          className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300 transition"
                        >
                          Clear
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || isSendingReply}
                        className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-sky-400 disabled:opacity-50 transition shadow-md shadow-sky-500/20"
                      >
                        {isSendingReply ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>Send Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-850 border border-slate-850 text-slate-600">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-300">Select a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a customer from the left list to view their live message history and account details.
              </p>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* PANEL 3: CUSTOMER CONTEXT PANEL (Col span 3)                  */}
        {/* ============================================================== */}
        <div
          className={`lg:col-span-3 bg-[#070e1b] flex flex-col min-h-0 overflow-y-auto ${
            showMobileContext ? "fixed inset-0 z-50 p-4 bg-[#070e1b]" : "hidden lg:flex"
          }`}
        >
          {showMobileContext && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 lg:hidden mb-3">
              <span className="text-xs font-bold text-white">Customer Account Context</span>
              <button
                onClick={() => setShowMobileContext(false)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-white"
              >
                Close
              </button>
            </div>
          )}

          {activeConversation ? (
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="border-b border-slate-800/80 pb-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                  Customer Intelligence
                </div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  Account Profile & Access Context
                </div>
              </div>

              {isLoadingContext ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <RefreshCw size={20} className="animate-spin text-sky-400 mb-2" />
                  <p className="text-xs">Loading context...</p>
                </div>
              ) : (
                <>
                  {/* Customer Profile Card */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 font-black text-white text-sm shadow-md">
                        {(customerContext?.customer.name || activeConversation.customer?.name || "C")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {customerContext?.customer.name ||
                            activeConversation.customer?.name ||
                            `Customer #${activeConversation.customerId}`}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          ID: #{activeConversation.customerId}
                        </div>
                        <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 text-[9px] font-bold text-emerald-400 mt-1">
                          Active Customer
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-500 shrink-0" />
                        <span className="truncate">
                          {customerContext?.customer.email || activeConversation.customer?.email || "No email"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-500 shrink-0" />
                        <span className="truncate">
                          {customerContext?.customer.phone || activeConversation.customer?.phone || "No phone"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-500 shrink-0" />
                        <span className="text-slate-400">
                          Joined:{" "}
                          {customerContext?.customer.createdAt
                            ? formatDate(customerContext.customer.createdAt)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">Total Spend</div>
                      <div className="text-xs font-black text-emerald-400 mt-0.5">
                        ৳{Number(customerContext?.stats.totalSpend || 0).toLocaleString()} BDT
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5">
                      <div className="text-[10px] text-slate-400 font-medium">Total Orders</div>
                      <div className="text-xs font-black text-sky-400 mt-0.5">
                        {customerContext?.stats.totalOrders || 0} Orders
                      </div>
                    </div>
                  </div>

                  {/* Active Entitlements / Purchased Products */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <PackageCheck size={14} className="text-sky-400" />
                        <span>Purchased Access</span>
                      </div>
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.2 text-[10px] font-bold text-sky-400">
                        {customerContext?.entitlements.length || 0}
                      </span>
                    </div>

                    {customerContext?.entitlements && customerContext.entitlements.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {customerContext.entitlements.map((ent) => (
                          <div
                            key={ent.id}
                            className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">
                                {ent.productTitle || "Course / PDF Access"}
                              </span>
                              <span className="rounded bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 text-[9px] font-black uppercase">
                                Active
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-mono text-slate-500">{ent.scope}</span>
                              <span>{formatDate(ent.grantedAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        No active entitlements recorded for this customer.
                      </p>
                    )}
                  </div>

                  {/* Order History */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Receipt size={14} className="text-indigo-400" />
                        <span>Order History</span>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] font-bold text-slate-400">
                        {customerContext?.orders.length || 0}
                      </span>
                    </div>

                    {customerContext?.orders && customerContext.orders.length > 0 ? (
                      <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
                        {customerContext.orders.map((ord) => {
                          const isApproved = ord.paymentStatus === "approved";
                          const isPending = ord.paymentStatus === "pending";

                          return (
                            <div
                              key={ord.id}
                              className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold text-sky-400">
                                  #COC-{ord.id}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${
                                    isApproved
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : isPending
                                      ? "bg-amber-500/15 text-amber-400"
                                      : "bg-red-500/15 text-red-400"
                                  }`}
                                >
                                  {ord.paymentStatus}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-black text-slate-200">
                                  ৳{Number(ord.amount).toLocaleString()} {ord.currency || "BDT"}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase font-medium">
                                  {ord.paymentMethod}
                                </span>
                              </div>

                              <div className="text-[9px] text-slate-500">
                                {formatDate(ord.createdAt)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        No orders recorded for this customer.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <User size={28} className="mx-auto text-slate-600" />
              <p className="text-xs">Select a conversation to inspect customer context</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helpers
function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

function formatMessageDate(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

function formatRelativeTime(isoStr: string): string {
  try {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(isoStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
