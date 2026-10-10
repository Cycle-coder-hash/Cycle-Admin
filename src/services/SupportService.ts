import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { SupportConversation, SupportMessage, CustomerSupportContext } from "../lib/types";
import { APP_CONFIG } from "../core/config/env";

export interface ISupportService {
  fetchConversations(): Promise<SupportConversation[]>;
  markConversationRead(conversationId: number): Promise<{ success: boolean }>;
  fetchConversationMessages(conversationId: number): Promise<SupportMessage[]>;
  sendReply(conversationId: number, message: string, customerId?: number): Promise<{ success: boolean; message?: SupportMessage }>;
  deleteMessage(conversationId: number, messageId: number): Promise<{ success: boolean }>;
  deleteConversation(conversationId: number): Promise<{ success: boolean }>;
  fetchCustomerContext(customerId: number): Promise<CustomerSupportContext | null>;
  fetchTickets(): Promise<any[]>;
  updateTicketStatus(ticketId: number, status: string): Promise<{ success: boolean }>;
  fetchMetrics(): Promise<any>;
}

export class SupportService extends HttpClient implements ISupportService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchConversations(): Promise<SupportConversation[]> {
    try {
      const data = await this.get<{ success?: boolean; conversations?: SupportConversation[] }>(
        "/support/conversations"
      );
      if (data?.success && Array.isArray(data.conversations)) {
        return data.conversations;
      }
    } catch (err) {
      console.warn("[API_BASE/support/conversations unreachable, trying direct Supabase]:", err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>(
        "settings",
        "key=eq.support_conversations_registry&select=value"
      );
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const list = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(list)) {
          const customerIds = Array.from(
            new Set(list.map((c: any) => Number(c.customerId)).filter((id: number) => !isNaN(id)))
          );
          const [usersList, msgsRows] = await Promise.all([
            customerIds.length > 0
              ? this.supabase.fetchRaw<any[]>("users", `id=in.(${customerIds.join(",")})&select=id,name,email,phone`)
              : Promise.resolve([]),
            Promise.all(
              list.map(async (c: any) => {
                try {
                  const mRows = await this.supabase.fetchRaw<any[]>(
                    "settings",
                    `key=eq.support_messages_${c.id}&select=value`
                  );
                  if (mRows && mRows[0]?.value) {
                    const mVal = mRows[0].value;
                    const parsed = typeof mVal === "string" ? JSON.parse(mVal) : mVal;
                    return { convId: Number(c.id), messages: Array.isArray(parsed) ? parsed : [] };
                  }
                } catch {}
                return { convId: Number(c.id), messages: [] };
              })
            ),
          ]);

          const usersMap = new Map((Array.isArray(usersList) ? usersList : []).map((u: any) => [Number(u.id), u]));
          const msgsMap = new Map(msgsRows.map((m) => [m.convId, m.messages]));

          const summaries = list.map((conv: any) => {
            const numConvId = Number(conv.id);
            const numCustId = Number(conv.customerId);
            const user = usersMap.get(numCustId);
            const messages = msgsMap.get(numConvId) || [];
            const lastMsg = messages.length > 0 ? messages[messages.length - 1] : conv.lastMessage || null;
            const unreadCount = messages.filter(
              (m: any) => (m.senderRole === "customer" || m.senderRole === "user") && !m.readAt
            ).length;

            return {
              id: numConvId,
              customerId: numCustId,
              createdAt: conv.createdAt || new Date().toISOString(),
              updatedAt: conv.updatedAt || new Date().toISOString(),
              lastMessageAt: conv.lastMessageAt || (lastMsg ? lastMsg.createdAt : conv.createdAt),
              customer: {
                id: numCustId,
                name: user?.name || conv.customer?.name || `Customer #${numCustId}`,
                email: user?.email || conv.customer?.email || null,
                phone: user?.phone || conv.customer?.phone || null,
                avatar: user?.avatar || conv.customer?.avatar || null,
                createdAt: user?.createdAt || null,
              },
              lastMessage: lastMsg,
              unreadCount,
              totalMessages: messages.length,
            };
          });

          summaries.sort((a: any, b: any) => {
            const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
          });

          return summaries;
        }
      }
    } catch (err) {
      console.warn("[fetchSupportConversations Supabase error]:", err);
    }
    return [];
  }

  public async fetchTickets(): Promise<any[]> {
    return this.fetchConversations();
  }

  public async markConversationRead(conversationId: number): Promise<{ success: boolean }> {
    const numId = Number(conversationId);
    try {
      const data = await this.post<{ success?: boolean }>("/support/mark-read", {
        conversationId: numId,
      });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[markConversationRead primary failed, trying direct Supabase]:", err);
    }

    try {
      const now = new Date().toISOString();
      const msgsRows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.support_messages_${numId}&select=value`);
      if (msgsRows && msgsRows[0]?.value) {
        const rawVal = msgsRows[0].value;
        const msgs = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(msgs)) {
          let modified = false;
          for (const m of msgs) {
            if (m.senderRole !== "admin" && !m.readAt) {
              m.readAt = now;
              modified = true;
            }
          }
          if (modified) {
            await this.supabase.post("settings?on_conflict=key", {
              key: `support_messages_${numId}`,
              value: JSON.stringify(msgs),
              updatedAt: now,
            }, { Prefer: "resolution=merge-duplicates" });
          }
        }
      }

      const regRows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.support_conversations_registry&select=value");
      if (regRows && regRows[0]?.value) {
        const rawVal = regRows[0].value;
        const list = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(list)) {
          const conv = list.find((c: any) => Number(c.id) === numId);
          if (conv) {
            conv.unreadCount = 0;
            await this.supabase.post("settings?on_conflict=key", {
              key: "support_conversations_registry",
              value: JSON.stringify(list),
              updatedAt: now,
            }, { Prefer: "resolution=merge-duplicates" });
          }
        }
      }
      return { success: true };
    } catch (err) {
      console.warn("[markConversationRead Supabase error]:", err);
      return { success: true };
    }
  }

  public async fetchConversationMessages(conversationId: number): Promise<SupportMessage[]> {
    const numId = Number(conversationId);
    try {
      const data = await this.get<{ success?: boolean; messages?: SupportMessage[] }>(
        `/support/conversations/${numId}/messages`
      );
      if (data?.success && Array.isArray(data.messages)) {
        return data.messages;
      }
    } catch (err) {
      console.warn(`[fetchConversationMessages failed, trying Supabase]:`, err);
    }

    try {
      const rows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.support_messages_${numId}&select=value`);
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            id: Number(m.id),
            conversationId: Number(m.conversationId || numId),
            senderId: Number(m.senderId),
            senderRole: m.senderRole,
            message: m.message,
            readAt: m.readAt || null,
            createdAt: m.createdAt,
          }));
        }
      }
    } catch (err) {
      console.warn("[fetchConversationMessages Supabase error]:", err);
    }
    return [];
  }

  public async sendReply(
    conversationId: number,
    message: string,
    customerId?: number
  ): Promise<{ success: boolean; message?: SupportMessage }> {
    const numConvId = Number(conversationId);
    const trimmed = message.trim();
    try {
      const data = await this.post<{ success: boolean; reply?: SupportMessage }>(
        "/support/reply",
        {
          conversationId: numConvId,
          customerId: customerId ? Number(customerId) : undefined,
          message: trimmed,
          senderId: 1,
        }
      );
      if (data?.success && data.reply) return { success: true, message: data.reply };
      if (data?.success) return data;
    } catch (err) {
      console.warn("[sendReply primary failed, trying Supabase]:", err);
    }

    try {
      const now = new Date().toISOString();
      const msgsRows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.support_messages_${numConvId}&select=value`);
      let msgs: SupportMessage[] = [];
      if (msgsRows && msgsRows[0]?.value) {
        const rawVal = msgsRows[0].value;
        const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) msgs = parsed;
      }

      const nextId = msgs.length > 0 ? Math.max(...msgs.map((m) => Number(m.id) || 0)) + 1 : 1;
      const newMsg: SupportMessage = {
        id: nextId,
        conversationId: numConvId,
        senderId: 1,
        senderRole: "admin",
        message: trimmed,
        createdAt: now,
      };

      msgs.push(newMsg);
      await this.supabase.post("settings?on_conflict=key", {
        key: `support_messages_${numConvId}`,
        value: JSON.stringify(msgs),
        updatedAt: now,
      }, { Prefer: "resolution=merge-duplicates" });

      return { success: true, message: newMsg };
    } catch (err: any) {
      throw new Error(err.message || "Failed to send admin reply");
    }
  }

  public async deleteMessage(conversationId: number, messageId: number): Promise<{ success: boolean }> {
    const numConvId = Number(conversationId);
    const numMsgId = Number(messageId);
    try {
      const data = await this.post<{ success?: boolean }>("/support/delete-message", {
        conversationId: numConvId,
        messageId: numMsgId,
      });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[deleteMessage primary failed, trying Supabase]:", err);
    }

    try {
      const now = new Date().toISOString();
      const msgsRows = await this.supabase.fetchRaw<any[]>("settings", `key=eq.support_messages_${numConvId}&select=value`);
      let msgs: SupportMessage[] = [];
      if (msgsRows && msgsRows[0]?.value) {
        const rawVal = msgsRows[0].value;
        const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) msgs = parsed;
      }
      const filtered = msgs.filter((m) => Number(m.id) !== numMsgId);
      await this.supabase.post("settings?on_conflict=key", {
        key: `support_messages_${numConvId}`,
        value: JSON.stringify(filtered),
        updatedAt: now,
      }, { Prefer: "resolution=merge-duplicates" });

      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete support message");
    }
  }

  public async deleteConversation(conversationId: number): Promise<{ success: boolean }> {
    const numConvId = Number(conversationId);
    try {
      const data = await this.post<{ success?: boolean }>("/support/delete-conversation", {
        conversationId: numConvId,
      });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[deleteConversation primary failed, trying Supabase]:", err);
    }

    try {
      const now = new Date().toISOString();
      await this.supabase.delete(`settings?key=eq.support_messages_${numConvId}`);

      const regRows = await this.supabase.fetchRaw<any[]>("settings", "key=eq.support_conversations_registry&select=value");
      if (regRows && regRows[0]?.value) {
        const rawVal = regRows[0].value;
        const list = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(list)) {
          const filtered = list.filter((c: any) => Number(c.id) !== numConvId);
          await this.supabase.post("settings?on_conflict=key", {
            key: "support_conversations_registry",
            value: JSON.stringify(filtered),
            updatedAt: now,
          }, { Prefer: "resolution=merge-duplicates" });
        }
      }
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete support conversation");
    }
  }

  public async fetchCustomerContext(customerId: number): Promise<CustomerSupportContext | null> {
    try {
      const data = await this.get<{ success?: boolean; context?: CustomerSupportContext }>(
        `/support/customer-context/${customerId}`
      );
      if (data?.success && data.context) return data.context;
    } catch (err) {
      console.warn(`[fetchCustomerContext failed, trying Supabase]:`, err);
    }

    try {
      const [userRows, entRows, orderRows] = await Promise.all([
        this.supabase.fetchRaw<any[]>("users", `id=eq.${customerId}&select=*`),
        this.supabase.fetchRaw<any[]>("entitlements", `userId=eq.${customerId}&select=*`),
        this.supabase.fetchRaw<any[]>("orders", `customerId=eq.${customerId}&select=*&order=id.desc`),
      ]);

      let customer: any = { id: customerId, name: `Customer #${customerId}`, email: null, phone: null, role: "user", createdAt: null };
      if (Array.isArray(userRows) && userRows.length > 0) customer = userRows[0];

      let entitlements: any[] = [];
      if (Array.isArray(entRows)) {
        entitlements = entRows.map((e: any) => ({
          id: e.id,
          orderId: e.orderId,
          productId: e.productId,
          bundleId: e.bundleId,
          scope: e.scope,
          productTitle: e.scope?.startsWith("bundle:") ? "Full Master Bundle" : "Course / PDF Access",
          grantedAt: e.createdAt || new Date().toISOString(),
        }));
      }

      let orders: any[] = [];
      let totalSpend = 0;
      if (Array.isArray(orderRows)) {
        orders = orderRows.map((o: any) => {
          if (o.paymentStatus === "approved") {
            totalSpend += parseFloat(o.amount) || 0;
          }
          return {
            id: o.id,
            amount: o.amount || "0",
            currency: o.currency || "BDT",
            paymentMethod: o.paymentMethod || "bkash",
            paymentStatus: o.paymentStatus || "pending",
            orderStatus: o.orderStatus || "pending",
            bundleId: o.bundleId,
            productId: o.productId,
            selectedPdfIds: o.selectedPdfIds,
            createdAt: o.createdAt || new Date().toISOString(),
          };
        });
      }

      return {
        customer: {
          id: customer.id,
          openId: customer.openId,
          name: customer.name || `Customer #${customer.id}`,
          email: customer.email,
          phone: customer.phone,
          avatar: customer.avatar,
          role: customer.role || "user",
          createdAt: customer.createdAt,
        },
        entitlements,
        orders,
        stats: {
          totalSpend,
          totalOrders: orders.length,
          activeEntitlementsCount: entitlements.length,
        },
      };
    } catch (err) {
      console.warn("[fetchCustomerContext Supabase error]:", err);
      return null;
    }
  }

  public async updateTicketStatus(_ticketId: number, _status: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  public async fetchMetrics(): Promise<any> {
    return {
      totalTickets: 0,
      openTickets: 0,
      pendingTickets: 0,
      waitingUserTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      avgResolutionHours: 0,
    };
  }
}

export const defaultSupportService = new SupportService();
