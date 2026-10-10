import { useState, useEffect, useRef, useMemo, useCallback, KeyboardEvent } from "react";
import {
  SupportConversation,
  SupportMessage,
  CustomerSupportContext,
} from "../lib/types";
import { services } from "../services";

export interface UseSupportDeskReturn {
  conversations: SupportConversation[];
  filteredConversations: SupportConversation[];
  selectedConversationId: number | null;
  setSelectedConversationId: (id: number | null) => void;
  activeConversation: SupportConversation | null;
  messages: SupportMessage[];
  customerContext: CustomerSupportContext | null;
  replyMessage: string;
  setReplyMessage: (msg: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  unreadOnlyFilter: boolean;
  setUnreadOnlyFilter: (val: boolean) => void;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingContext: boolean;
  isSendingReply: boolean;
  isDeletingConversation: boolean;
  totalUnreadAll: number;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  loadConversations: (quiet?: boolean) => Promise<void>;
  loadMessages: (quiet?: boolean) => Promise<void>;
  loadCustomerContext: () => Promise<void>;
  handleSendReply: () => Promise<void>;
  handleDeleteConversation: () => Promise<void>;
  handleDeleteMessage: (messageId: number) => Promise<void>;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  scrollToBottom: () => void;
}

export function useSupportDesk(onReload?: () => void): UseSupportDeskReturn {
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
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 1. Load Conversations
  const loadConversations = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingConversations(true);
    try {
      const data = await services.support.fetchConversations();
      setConversations(data);
    } catch (err) {
      console.warn("[useSupportDesk] loadConversations error:", err);
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
    return conversations.find((c) => Number(c.id) === Number(selectedConversationId)) || null;
  }, [conversations, selectedConversationId]);

  // 2. Load Messages for Active Conversation
  const loadMessages = useCallback(
    async (quiet = false) => {
      if (!selectedConversationId) return;
      if (!quiet) setIsLoadingMessages(true);
      try {
        const msgs = await services.support.fetchConversationMessages(selectedConversationId);
        setMessages(msgs);
        if (!quiet) {
          setTimeout(scrollToBottom, 50);
        }
      } catch (err) {
        console.warn("[useSupportDesk] loadMessages error:", err);
      } finally {
        if (!quiet) setIsLoadingMessages(false);
      }
    },
    [selectedConversationId, scrollToBottom]
  );

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

  // 3. Load Customer Context
  const loadCustomerContext = useCallback(async () => {
    if (!activeConversation?.customerId) {
      setCustomerContext(null);
      return;
    }
    setIsLoadingContext(true);
    try {
      const ctx = await services.support.fetchCustomerContext(activeConversation.customerId);
      setCustomerContext(ctx);
    } catch (err) {
      console.warn("[useSupportDesk] loadCustomerContext error:", err);
      setCustomerContext(null);
    } finally {
      setIsLoadingContext(false);
    }
  }, [activeConversation?.customerId]);

  useEffect(() => {
    loadCustomerContext();
  }, [loadCustomerContext]);

  // 4. Auto Mark Read
  useEffect(() => {
    if (selectedConversationId && activeConversation && activeConversation.unreadCount > 0) {
      services.support
        .markConversationRead(selectedConversationId)
        .then(() => {
          setConversations((prev) =>
            prev.map((c) =>
              Number(c.id) === Number(selectedConversationId) ? { ...c, unreadCount: 0 } : c
            )
          );
          if (onReload) onReload();
        })
        .catch(console.warn);
    }
  }, [selectedConversationId, activeConversation?.unreadCount, onReload]);

  const handleDeleteConversation = async () => {
    if (!selectedConversationId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this conversation and all its messages from the database? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setIsDeletingConversation(true);
    try {
      await services.support.deleteConversation(selectedConversationId);
      const deletedId = selectedConversationId;
      setConversations((prev) => prev.filter((c) => Number(c.id) !== Number(deletedId)));
      setSelectedConversationId(null);
      setMessages([]);
      setCustomerContext(null);
      await loadConversations(true);
      if (onReload) onReload();
    } catch (err: any) {
      alert("Failed to delete conversation: " + (err.message || "Unknown error"));
    } finally {
      setIsDeletingConversation(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedConversationId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this message from the database?"
    );
    if (!confirmDelete) return;

    try {
      await services.support.deleteMessage(selectedConversationId, messageId);
      setMessages((prev) => prev.filter((m) => Number(m.id) !== Number(messageId)));
      await loadConversations(true);
    } catch (err: any) {
      alert("Failed to delete message: " + (err.message || "Unknown error"));
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversationId || !replyMessage.trim() || isSendingReply) return;
    const text = replyMessage.trim();
    setIsSendingReply(true);

    try {
      const res = await services.support.sendReply(
        selectedConversationId,
        text,
        activeConversation?.customerId
      );
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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

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
    return conversations.reduce((acc: number, c: SupportConversation) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  return {
    conversations,
    filteredConversations,
    selectedConversationId,
    setSelectedConversationId,
    activeConversation,
    messages,
    customerContext,
    replyMessage,
    setReplyMessage,
    searchQuery,
    setSearchQuery,
    unreadOnlyFilter,
    setUnreadOnlyFilter,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingContext,
    isSendingReply,
    isDeletingConversation,
    totalUnreadAll,
    messagesEndRef,
    textareaRef,
    loadConversations,
    loadMessages,
    loadCustomerContext,
    handleSendReply,
    handleDeleteConversation,
    handleDeleteMessage,
    handleKeyDown,
    scrollToBottom,
  };
}
