import { Order, Student, SupportConversation, SupportMessage, CustomerSupportContext, AuditEvent, CourseTelegramConfig } from "./types";
export type { CourseTelegramConfig, SupportConversation, SupportMessage, CustomerSupportContext };

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://cycleofchart.vercel.app";
const API_BASE = rawApiUrl.endsWith("/api/admin") 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/+$/, "")}/api/admin`;

const SUPABASE_URL = "https://pxrcaqmjmsvldhiyuacx.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmNhcW1qbXN2bGRoaXl1YWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjQ3MTUsImV4cCI6MjEwMzYwMDcxNX0.T9_0iHg5a-vHh2tpTrVUVlvIsp5G6UB1n_i_kHN9OoM";

async function supaFetch(path: string, init?: RequestInit) {
  const url = `${SUPABASE_URL}/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return res;
}

export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) return data.stats;
    }
  } catch (err) {
    console.warn("[API_BASE/stats unreachable, falling back to direct Supabase]:", err);
  }

  // Supabase fallback
  try {
    const [ordersRes, usersRes] = await Promise.all([
      supaFetch("orders?select=*"),
      supaFetch("users?select=*"),
    ]);
    const orders: any[] = ordersRes.ok ? await ordersRes.json() : [];
    const users: any[] = usersRes.ok ? await usersRes.json() : [];

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "approved")
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const pendingOrders = orders.filter((o) => o.paymentStatus === "pending").length;
    const totalStudents = users.length;

    return {
      totalRevenue,
      pendingOrders,
      totalStudents,
      activeNow: Math.max(1, Math.min(totalStudents, 5)),
    };
  } catch (err) {
    console.warn("[Supabase stats fallback error]:", err);
    return {
      totalRevenue: 0,
      pendingOrders: 0,
      totalStudents: 0,
      activeNow: 1,
    };
  }
}

export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) return data.orders;
    }
  } catch (err) {
    console.warn("[API_BASE/orders unreachable, falling back to direct Supabase]:", err);
  }

  try {
    const [ordersRes, usersRes] = await Promise.all([
      supaFetch("orders?select=*&order=id.desc"),
      supaFetch("users?select=id,name,email,phone"),
    ]);
    if (ordersRes.ok) {
      const orders = await ordersRes.json();
      const users = usersRes.ok ? await usersRes.json() : [];
      const userMap = new Map((Array.isArray(users) ? users : []).map((u: any) => [u.id, u]));

      if (Array.isArray(orders)) {
        return orders.map((o: any) => {
          const user = userMap.get(o.customerId);
          return {
            ...o,
            customerName: user?.name || o.customerName || undefined,
            customerEmail: user?.email || o.customerEmail || undefined,
            customerPhone: user?.phone || o.customerPhone || undefined,
          };
        });
      }
    }
  } catch (err) {
    console.warn("[Supabase orders fallback error]:", err);
  }
  return [];
}

export async function fetchAdminUsers(): Promise<Student[]> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) return data.users;
    }
  } catch (err) {
    console.warn("[API_BASE/users unreachable, falling back to direct Supabase]:", err);
  }

  try {
    const res = await supaFetch("users?select=*&order=id.desc");
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users) && users.length > 0) {
        return users.map((u: any) => ({
          id: u.id,
          openId: u.openId || `user_${u.id}`,
          name: u.name || "Trader",
          email: u.email,
          phone: u.phone || "",
          role: u.role || "user",
          createdAt: u.createdAt || new Date().toISOString(),
          ordersCount: 0,
          totalSpent: 0,
        }));
      }
    }
  } catch (err) {
    console.warn("[Supabase users fallback error]:", err);
  }
  return [];
}

export async function fetchSupportConversationsApi(): Promise<SupportConversation[]> {
  try {
    const res = await fetch(`${API_BASE}/support/conversations`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        return data.conversations;
      }
    }
  } catch (err) {
    console.warn("[API_BASE/support/conversations unreachable, trying direct Supabase]:", err);
  }

  // Supabase fallback
  try {
    const res = await supaFetch("settings?key=eq.support_conversations_registry&select=value");
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const list = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(list)) {
          // Batch fetch users & messages
          const customerIds = Array.from(new Set(list.map((c: any) => Number(c.customerId)).filter((id: number) => !isNaN(id))));
          const [usersRes, msgsRows] = await Promise.all([
            customerIds.length > 0
              ? supaFetch(`users?id=in.(${customerIds.join(",")})&select=id,name,email,phone`)
              : Promise.resolve({ ok: false, json: () => Promise.resolve([]) } as any),
            Promise.all(
              list.map(async (c: any) => {
                try {
                  const mRes = await supaFetch(`settings?key=eq.support_messages_${c.id}&select=value`);
                  if (mRes.ok) {
                    const mRows = await mRes.json();
                    if (mRows && mRows[0]?.value) {
                      const mVal = mRows[0].value;
                      const parsed = typeof mVal === "string" ? JSON.parse(mVal) : mVal;
                      return { convId: Number(c.id), messages: Array.isArray(parsed) ? parsed : [] };
                    }
                  }
                } catch {}
                return { convId: Number(c.id), messages: [] };
              })
            ),
          ]);

          const usersList = usersRes.ok ? await usersRes.json() : [];
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
    }
  } catch (err) {
    console.warn("[fetchSupportConversationsApi Supabase error]:", err);
  }

  return [];
}

// Backward-compatibility alias
export async function fetchAdminTickets(): Promise<any[]> {
  return fetchSupportConversationsApi();
}


export async function fetchAdminAuditLogs(): Promise<AuditEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) return data.logs;
    }
  } catch (err) {
    console.warn("[API_BASE/audit-logs unreachable, falling back to direct Supabase]:", err);
  }

  try {
    const res = await supaFetch("auditEvents?select=*&order=id.desc&limit=50");
    if (res.ok) {
      const logs = await res.json();
      return Array.isArray(logs) ? logs : [];
    }
  } catch {}
  return [];
}

export async function approveOrderApi(orderId: number) {
  try {
    const res = await fetch(`${API_BASE}/approve-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[approveOrderApi primary failed, trying Supabase direct]:", err);
  }

  // Supabase direct approve
  try {
    const orderRes = await supaFetch(`orders?id=eq.${orderId}&select=*`);
    const orderData = orderRes.ok ? await orderRes.json() : [];
    const order = orderData[0];

    await supaFetch(`orders?id=eq.${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({
        paymentStatus: "approved",
        orderStatus: "approved",
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    // Automatically provision entitlement in Supabase
    if (order && order.customerId) {
      const scope = order.bundleId ? `bundle:${order.bundleId}` : `product:${order.productId}`;
      try {
        await supaFetch("entitlements", {
          method: "POST",
          body: JSON.stringify({
            userId: order.customerId,
            orderId: order.id,
            bundleId: order.bundleId || null,
            productId: order.productId || null,
            scope,
            grantedAt: new Date().toISOString(),
          }),
        });
      } catch (entErr) {
        console.warn("[approveOrderApi entitlement creation error]:", entErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "Failed to approve order");
  }
}

export async function rejectOrderApi(orderId: number, reason: string) {
  try {
    const res = await fetch(`${API_BASE}/reject-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[rejectOrderApi primary failed, trying Supabase direct]:", err);
  }

  // Supabase direct reject
  try {
    await supaFetch(`orders?id=eq.${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({
        paymentStatus: "rejected",
        orderStatus: "rejected",
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      }),
    });
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "Failed to reject order");
  }
}


export async function deleteOrderApi(orderId: number) {
  try {
    const res = await fetch(`${API_BASE}/delete-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[deleteOrderApi primary failed, trying Supabase direct]:", err);
  }

  // Supabase direct delete
  try {
    try {
      await supaFetch(`entitlements?orderId=eq.${orderId}`, {
        method: "DELETE",
      });
    } catch (e) {}

    const res = await supaFetch(`orders?id=eq.${orderId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return { success: true };
    }
    throw new Error("Failed to delete order from Supabase");
  } catch (err: any) {
    throw new Error(err.message || "Failed to delete order");
  }
}

export async function grantAccessApi(userId: number, bundleId?: number, productId?: number) {
  try {
    const res = await fetch(`${API_BASE}/grant-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, bundleId, productId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to grant access");
    return data;
  } catch (err: any) {
    // Direct Supabase entitlement
    try {
      await supaFetch("entitlements", {
        method: "POST",
        body: JSON.stringify({
          userId,
          bundleId: bundleId || null,
          productId: productId || null,
          source: "manual",
          createdAt: new Date().toISOString(),
        }),
      });
      return { success: true };
    } catch {
      throw new Error(err.message || "Failed to grant access");
    }
  }
}

export async function updateRoleApi(userId: number, role: "user" | "support" | "admin") {
  try {
    const res = await fetch(`${API_BASE}/update-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[updateRoleApi primary failed, trying Supabase direct]:", err);
  }

  try {
    await supaFetch(`users?id=eq.${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role, updatedAt: new Date().toISOString() }),
    });
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "Failed to update role");
  }
}

export async function markConversationReadApi(conversationId: number): Promise<{ success: boolean }> {
  const numId = Number(conversationId);
  try {
    const res = await fetch(`${API_BASE}/support/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: numId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[markConversationReadApi primary failed, trying direct Supabase]:", err);
  }

  // Supabase fallback: update support_conversations_registry & support_messages_{id}
  try {
    const now = new Date().toISOString();

    // 1. Mark unread messages in support_messages_{id} as read
    const msgsRes = await supaFetch(`settings?key=eq.support_messages_${numId}&select=value`);
    if (msgsRes.ok) {
      const rows = await msgsRes.json();
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
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
            await supaFetch(`settings?key=eq.support_messages_${numId}`, {
              method: "POST",
              headers: { Prefer: "resolution=merge-duplicates" },
              body: JSON.stringify({
                key: `support_messages_${numId}`,
                value: JSON.stringify(msgs),
                updatedAt: now,
              }),
            });
          }
        }
      }
    }

    // 2. Update conversation registry
    const regRes = await supaFetch("settings?key=eq.support_conversations_registry&select=value");
    if (regRes.ok) {
      const rows = await regRes.json();
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const list = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(list)) {
          const conv = list.find((c: any) => Number(c.id) === numId);
          if (conv) {
            conv.unreadCount = 0;
            await supaFetch("settings?key=eq.support_conversations_registry", {
              method: "POST",
              headers: { Prefer: "resolution=merge-duplicates" },
              body: JSON.stringify({
                key: "support_conversations_registry",
                value: JSON.stringify(list),
                updatedAt: now,
              }),
            });
          }
        }
      }
    }
    return { success: true };
  } catch (err) {
    console.warn("[markConversationReadApi Supabase error]:", err);
    return { success: true };
  }
}

export async function fetchConversationMessagesApi(conversationId: number): Promise<SupportMessage[]> {
  const numId = Number(conversationId);
  try {
    const res = await fetch(`${API_BASE}/support/conversations/${numId}/messages`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        return data.messages;
      }
    }
  } catch (err) {
    console.warn(`[API_BASE/support/conversations/${numId}/messages failed, trying Supabase]:`, err);
  }

  // Supabase fallback
  try {
    const res = await supaFetch(`settings?key=eq.support_messages_${numId}&select=value`);
    if (res.ok) {
      const rows = await res.json();
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
    }
  } catch (err) {
    console.warn("[fetchConversationMessagesApi Supabase error]:", err);
  }

  return [];
}

export async function sendAdminReplyApi(
  conversationId: number,
  message: string,
  customerId?: number
): Promise<{ success: boolean; message?: SupportMessage }> {
  const numConvId = Number(conversationId);
  const trimmed = message.trim();
  try {
    const res = await fetch(`${API_BASE}/support/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: numConvId,
        customerId: customerId ? Number(customerId) : undefined,
        message: trimmed,
        senderId: 1,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.reply) {
        return { success: true, message: data.reply };
      }
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[sendAdminReplyApi primary failed, trying Supabase]:", err);
  }

  // Supabase fallback
  try {
    const now = new Date().toISOString();

    // 1. Fetch existing messages
    const msgsRes = await supaFetch(`settings?key=eq.support_messages_${numConvId}&select=value`);
    let msgs: SupportMessage[] = [];
    if (msgsRes.ok) {
      const rows = await msgsRes.json();
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const parsed = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(parsed)) {
          msgs = parsed;
        }
      }
    }

    let maxId = 0;
    for (const m of msgs) {
      if (Number(m.id) > maxId) maxId = Number(m.id);
    }
    const newMsg: SupportMessage = {
      id: Math.max(maxId + 1, Date.now()),
      conversationId: numConvId,
      senderId: 1, // Admin actor
      senderRole: "admin",
      message: trimmed,
      readAt: null,
      createdAt: now,
    };

    msgs.push(newMsg);
    await supaFetch(`settings?key=eq.support_messages_${numConvId}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: `support_messages_${numConvId}`,
        value: JSON.stringify(msgs),
        updatedAt: now,
      }),
    });

    // 2. Update conversation registry
    const regRes = await supaFetch("settings?key=eq.support_conversations_registry&select=value");
    if (regRes.ok) {
      const rows = await regRes.json();
      if (rows && rows[0]?.value) {
        const rawVal = rows[0].value;
        const list = typeof rawVal === "string" ? JSON.parse(rawVal) : rawVal;
        if (Array.isArray(list)) {
          const conv = list.find(
            (c: any) =>
              Number(c.id) === numConvId ||
              (customerId && Number(c.customerId) === Number(customerId))
          );
          if (conv) {
            conv.lastMessage = newMsg;
            conv.lastMessageAt = now;
            conv.totalMessages = (conv.totalMessages || 0) + 1;
            conv.updatedAt = now;
            await supaFetch("settings?key=eq.support_conversations_registry", {
              method: "POST",
              headers: { Prefer: "resolution=merge-duplicates" },
              body: JSON.stringify({
                key: "support_conversations_registry",
                value: JSON.stringify(list),
                updatedAt: now,
              }),
            });
          }
        }
      }
    }

    return { success: true, message: newMsg };
  } catch (err: any) {
    throw new Error(err.message || "Failed to send admin reply");
  }
}

export async function fetchCustomerContextApi(customerId: number): Promise<CustomerSupportContext | null> {
  try {
    const res = await fetch(`${API_BASE}/support/customer-context/${customerId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.context) {
        return data.context as CustomerSupportContext;
      }
    }
  } catch (err) {
    console.warn(`[API_BASE/support/customer-context/${customerId} failed, trying Supabase]:`, err);
  }

  // Supabase fallback
  try {
    const [userRes, entitlementsRes, ordersRes] = await Promise.all([
      supaFetch(`users?id=eq.${customerId}&select=*`),
      supaFetch(`entitlements?userId=eq.${customerId}&select=*`),
      supaFetch(`orders?customerId=eq.${customerId}&select=*&order=id.desc`),
    ]);

    let customer: any = { id: customerId, name: `Customer #${customerId}`, email: null, phone: null, role: "user", createdAt: null };
    if (userRes.ok) {
      const rows = await userRes.json();
      if (rows && rows.length > 0) customer = rows[0];
    }

    let entitlements: any[] = [];
    if (entitlementsRes.ok) {
      const rows = await entitlementsRes.json();
      if (Array.isArray(rows)) {
        entitlements = rows.map((e: any) => ({
          id: e.id,
          orderId: e.orderId,
          productId: e.productId,
          bundleId: e.bundleId,
          scope: e.scope,
          productTitle: e.scope?.startsWith("bundle:") ? "Full Master Bundle" : "Course / PDF Access",
          grantedAt: e.createdAt || new Date().toISOString(),
        }));
      }
    }

    let orders: any[] = [];
    let totalSpend = 0;
    if (ordersRes.ok) {
      const rows = await ordersRes.json();
      if (Array.isArray(rows)) {
        orders = rows.map((o: any) => {
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
    console.warn("[fetchCustomerContextApi Supabase error]:", err);
    return null;
  }
}

// Backward-compatibility shims
export async function updateTicketStatusApi(_ticketId: number, _status: string) {
  return { success: true };
}

export async function fetchSupportMetricsApi() {
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


export async function fetchAdminEbooks(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/ebooks`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.ebooks)) return data.ebooks;
    }
  } catch (err) {
    console.warn("[API_BASE/ebooks unreachable, falling back to Supabase settings]:", err);
  }

  try {
    const res = await supaFetch("settings?key=eq.free_ebooks&select=value");
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]?.value) {
        return JSON.parse(rows[0].value);
      }
    }
  } catch {}
  return [];
}

export async function createEbookApi(payload: any) {
  let finalPayload = { ...payload };

  // Guard against Base64 bloat: If fileUrl is raw base64, auto-upload to cloud storage
  if (finalPayload.fileUrl && typeof finalPayload.fileUrl === "string" && finalPayload.fileUrl.startsWith("data:")) {
    try {
      const cleanBase64 = finalPayload.fileUrl.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const syntheticFile = new File([blob], finalPayload.fileName || "document.pdf", { type: "application/pdf" });
      finalPayload.fileUrl = await uploadPdfToFreeStorage(syntheticFile);
    } catch (guardErr) {
      console.warn("[Auto-upload PDF Base64 interceptor notice]:", guardErr);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/ebooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ebook) return data.ebook;
    }
  } catch (err) {
    console.warn("[createEbookApi primary failed, saving to Supabase settings]:", err);
  }

  const existingRes = await supaFetch("settings?key=eq.free_ebooks&select=value");
  let existing = [];
  if (existingRes.ok) {
    const rows = await existingRes.json();
    if (rows && rows[0]?.value) existing = JSON.parse(rows[0].value);
  }
  const newEbook = {
    id: Date.now(),
    ...finalPayload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  existing.unshift(newEbook);
  await supaFetch("settings", {
    method: "POST",
    headers: { "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify({ key: "free_ebooks", value: JSON.stringify(existing) }),
  });
  return newEbook;
}

export async function updateEbookApi(id: number, payload: any) {
  let finalPayload = { ...payload };

  // Guard against Base64 bloat: If fileUrl is raw base64, auto-upload to cloud storage
  if (finalPayload.fileUrl && typeof finalPayload.fileUrl === "string" && finalPayload.fileUrl.startsWith("data:")) {
    try {
      const cleanBase64 = finalPayload.fileUrl.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const syntheticFile = new File([blob], finalPayload.fileName || "document.pdf", { type: "application/pdf" });
      finalPayload.fileUrl = await uploadPdfToFreeStorage(syntheticFile);
    } catch (guardErr) {
      console.warn("[Auto-upload PDF Base64 interceptor notice]:", guardErr);
    }
  }

  try {
    const res = await fetch(`${API_BASE}/ebooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ebook) return data.ebook;
    }
  } catch (err) {
    console.warn("[updateEbookApi primary failed, updating Supabase settings]:", err);
  }

  const existingRes = await supaFetch("settings?key=eq.free_ebooks&select=value");
  let existing = [];
  if (existingRes.ok) {
    const rows = await existingRes.json();
    if (rows && rows[0]?.value) existing = JSON.parse(rows[0].value);
  }
  const idx = existing.findIndex((e: any) => e.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...finalPayload, updatedAt: new Date().toISOString() };
    await supaFetch("settings", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ key: "free_ebooks", value: JSON.stringify(existing) }),
    });
    return existing[idx];
  }
  return { id, ...finalPayload };
}

export async function deleteEbookApi(id: number) {
  try {
    const res = await fetch(`${API_BASE}/ebooks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[deleteEbookApi primary failed, updating Supabase settings]:", err);
  }

  const existingRes = await supaFetch("settings?key=eq.free_ebooks&select=value");
  if (existingRes.ok) {
    const rows = await existingRes.json();
    if (rows && rows[0]?.value) {
      const existing = JSON.parse(rows[0].value);
      const filtered = existing.filter((e: any) => e.id !== id);
      await supaFetch("settings", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "free_ebooks", value: JSON.stringify(filtered) }),
      });
    }
  }
  return { success: true };
}


/**
 * Upload a PDF file directly to Free Cloud Storage (Supabase Storage "ebooks" or Free Cloud CDN fallback).
 *
 * This guarantees that heavy PDF Base64 binaries are NEVER stored in PostgreSQL or Supabase database rows.
 * Only the lightweight public HTTPS URL is returned to be stored in the database.
 */
export async function uploadPdfToFreeStorage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = `${Date.now()}_${safeName}`;

  // 1. Try Supabase Storage "ebooks" bucket first (1GB Free Storage)
  try {
    const supaRes = await fetch(`https://pxrcaqmjmsvldhiyuacx.supabase.co/storage/v1/object/ebooks/${uniqueName}`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type || "application/pdf",
      },
      body: file,
    });

    if (supaRes.ok) {
      return `https://pxrcaqmjmsvldhiyuacx.supabase.co/storage/v1/object/public/ebooks/${uniqueName}`;
    }
  } catch (supaErr) {
    console.warn("[Direct Supabase Storage upload error, falling back to Free Cloud CDN]:", supaErr);
  }

  // 2. Try Backend Cloud CDN endpoint (/api/upload/file)
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const apiRoot = rawApiUrl.replace(/\/api\/admin\/?$/, "");
    const res = await fetch(`${apiRoot}/api/upload/file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64,
        filename: safeName,
        contentType: file.type || "application/pdf",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url && typeof data.url === "string" && data.url.startsWith("http")) {
        return data.url;
      }
    }
  } catch (apiErr) {
    console.warn("[Backend upload proxy notice]:", apiErr);
  }

  throw new Error("Unable to upload PDF to free cloud storage. Please check your internet connection or paste an external public link.");
}

export async function uploadImageToImgbb(base64Data: string): Promise<string> {
  const IMGBB_KEY = "83205d3de1723e4976090aad947fc26d";
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
  const fd = new FormData();
  fd.append("key", IMGBB_KEY);
  fd.append("image", cleanBase64);
  fd.append("name", `owner_profile_${Date.now()}`);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: fd,
  });
  const json = await res.json();
  if (json?.success && (json.data?.display_url || json.data?.url)) {
    return json.data.display_url || json.data.url;
  }
  throw new Error(json?.error?.message || "ImgBB upload failed");
}

export async function fetchOwnerProfileApi() {
  try {
    const res = await fetch(`${API_BASE}/owner-profile`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) return data.profile;
    }
  } catch (err) {
    console.warn("[fetchOwnerProfileApi primary failed, fetching from Supabase settings]:", err);
  }

  try {
    const res = await supaFetch("settings?key=eq.owner_profile&select=value");
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]?.value) {
        return JSON.parse(rows[0].value);
      }
    }
  } catch (err) {
    console.warn("[Supabase owner profile fallback error]:", err);
  }
  return null;
}

export async function updateOwnerProfileApi(payload: any) {
  let updatedProfile = { ...payload };

  // Auto-upload Base64 to ImgBB CDN to avoid bloated database storage
  if (payload.photoUrl && payload.photoUrl.startsWith("data:image/")) {
    try {
      const cdnUrl = await uploadImageToImgbb(payload.photoUrl);
      updatedProfile.photoUrl = cdnUrl;
    } catch (uploadErr) {
      console.warn("[ImgBB auto-upload failed, keeping base64]:", uploadErr);
    }
  }

  let savedSuccessfully = false;

  try {
    const res = await fetch(`${API_BASE}/owner-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProfile),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        updatedProfile = data.profile;
        savedSuccessfully = true;
      }
    }
  } catch (err) {
    console.warn("[updateOwnerProfileApi primary failed, syncing directly to Supabase]:", err);
  }

  // Always also write directly to Supabase settings for instant guaranteed consistency
  try {
    const supaRes = await supaFetch("settings?on_conflict=key", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: "owner_profile",
        value: JSON.stringify(updatedProfile),
      }),
    });
    if (supaRes.ok) {
      savedSuccessfully = true;
    } else {
      const errText = await supaRes.text();
      console.warn("[Supabase direct owner_profile upsert failed]:", supaRes.status, errText);
    }
  } catch (err) {
    console.warn("[Supabase direct owner_profile upsert error]:", err);
  }

  if (!savedSuccessfully) {
    throw new Error("Failed to save Owner Profile to both backend API and Supabase database.");
  }

  return updatedProfile;
}

export interface PaymentGatewayConfig {
  enabled: boolean;
  number: string;
  type: "personal" | "merchant" | "agent";
  instructions?: string;
}

export interface PaymentSettingsConfig {
  bkash: PaymentGatewayConfig;
  nagad: PaymentGatewayConfig;
  rocket: PaymentGatewayConfig;
  announcement?: string;
  announcementActive?: boolean;
  studentTelegramUrl?: string;
  studentTelegramDescription?: string;
}

export const defaultPaymentConfig: PaymentSettingsConfig = {
  bkash: {
    enabled: true,
    number: "01961079326",
    type: "personal",
    instructions: "Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন",
  },
  nagad: {
    enabled: true,
    number: "01961079326",
    type: "personal",
    instructions: "Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন",
  },
  rocket: {
    enabled: true,
    number: "01961079326",
    type: "personal",
    instructions: "Send Money করুন এবং ট্রানজেকশন আইডি (TrxID) দিন",
  },
  announcement: "Special Institutional Discount 50% Active on All Packages!",
  announcementActive: true,
  studentTelegramUrl: "https://t.me/cycleofchart",
  studentTelegramDescription: "Official Cycle of Chart VIP Student Telegram Channel & Group",
};

export async function fetchPaymentSettingsApi(): Promise<PaymentSettingsConfig> {
  try {
    const res = await fetch(`${API_BASE}/payment-settings`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.gateways) {
        return {
          bkash: { ...defaultPaymentConfig.bkash, ...data.gateways.bkash },
          nagad: { ...defaultPaymentConfig.nagad, ...data.gateways.nagad },
          rocket: { ...defaultPaymentConfig.rocket, ...data.gateways.rocket },
          announcement: data.announcement || defaultPaymentConfig.announcement,
          announcementActive: data.announcementActive !== false,
        };
      }
    }
  } catch (err) {
    console.warn("[API_BASE/payment-settings unreachable, reading Supabase settings]:", err);
  }

  try {
    const res = await supaFetch("settings?key=eq.payment_gateways_config&select=value");
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]?.value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return {
          bkash: { ...defaultPaymentConfig.bkash, ...parsed.bkash },
          nagad: { ...defaultPaymentConfig.nagad, ...parsed.nagad },
          rocket: { ...defaultPaymentConfig.rocket, ...parsed.rocket },
          announcement: parsed.announcement ?? defaultPaymentConfig.announcement,
          announcementActive: parsed.announcementActive !== false,
        };
      }
    }
  } catch (err) {
    console.warn("[Supabase payment settings fallback error]:", err);
  }

  // Fallback to individual keys if payment_gateways_config does not exist yet
  try {
    const res = await supaFetch("settings?key=in.(bkash,nagad,rocket,announcement,student_telegram_url)&select=key,value");
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const map: Record<string, string> = {};
        rows.forEach((r: any) => { map[r.key] = r.value; });
        return {
          bkash: {
            ...defaultPaymentConfig.bkash,
            number: map.bkash || defaultPaymentConfig.bkash.number,
          },
          nagad: {
            ...defaultPaymentConfig.nagad,
            number: map.nagad || defaultPaymentConfig.nagad.number,
          },
          rocket: {
            ...defaultPaymentConfig.rocket,
            number: map.rocket || defaultPaymentConfig.rocket.number,
          },
          announcement: map.announcement || defaultPaymentConfig.announcement,
          announcementActive: true,
        };
      }
    }
  } catch {}

  return defaultPaymentConfig;
}

export async function updatePaymentSettingsApi(config: PaymentSettingsConfig): Promise<PaymentSettingsConfig> {
  try {
    const res = await fetch(`${API_BASE}/payment-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.gateways) return config;
    }
  } catch (err) {
    console.warn("[updatePaymentSettingsApi primary failed, syncing directly to Supabase]:", err);
  }

  // Direct Supabase upsert of payment_gateways_config
  try {
    await supaFetch("settings?on_conflict=key", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: "payment_gateways_config",
        value: JSON.stringify(config),
      }),
    });

    // Also sync legacy individual keys
    await Promise.allSettled([
      supaFetch("settings?on_conflict=key", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "bkash", value: config.bkash.number }),
      }),
      supaFetch("settings?on_conflict=key", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "nagad", value: config.nagad.number }),
      }),
      supaFetch("settings?on_conflict=key", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "rocket", value: config.rocket.number }),
      }),
      supaFetch("settings?on_conflict=key", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "announcement", value: config.announcement || "" }),
      }),
    ]);
  } catch (err) {
    console.warn("[Supabase direct payment settings upsert error]:", err);
  }

  return config;
}

export const defaultCourseTelegramConfig: CourseTelegramConfig = {
  enabled: true,
  telegramUrl: "",
  titleEn: "COURSE ACCESS IS READY",
  titleBn: "কোর্স অ্যাক্সেস প্রস্তুত",
  messageEn: "Before you begin your course journey, join our official Telegram community for real-time course updates, institutional study materials, session announcements, and dedicated student support.",
  messageBn: "কোর্স শুরু করার আগে আমাদের অফিশিয়াল Telegram কমিউনিটিতে যুক্ত হোন। এখানে কোর্স সংক্রান্ত আপডেট, প্রাতিষ্ঠানিক স্টাডি ম্যাটেরিয়াল, সেশন অ্যানাউন্সমেন্ট এবং ডেডিকেটেড স্টুডেন্ট সাপোর্ট পাবেন।",
  joinButtonTextEn: "JOIN TELEGRAM",
  joinButtonTextBn: "TELEGRAM এ যুক্ত হোন",
  dismissButtonTextEn: "MAYBE LATER",
  dismissButtonTextBn: "পরে যুক্ত হব",
  displayMode: "once",
  popupDelay: 0,
};

export async function fetchCourseTelegramConfigApi(): Promise<CourseTelegramConfig> {
  try {
    const res = await fetch(`${API_BASE}/course-telegram-settings`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        return {
          ...defaultCourseTelegramConfig,
          ...data.config,
        };
      }
    }
  } catch (err) {
    console.warn("[fetchCourseTelegramConfigApi API_BASE failed, reading Supabase settings]:", err);
  }

  try {
    const res = await supaFetch("settings?key=eq.course_telegram_popup_config&select=value");
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]?.value) {
        const parsed = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return {
          ...defaultCourseTelegramConfig,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.warn("[fetchCourseTelegramConfigApi Supabase fallback failed]:", err);
  }

  return defaultCourseTelegramConfig;
}

export async function updateCourseTelegramConfigApi(config: CourseTelegramConfig): Promise<CourseTelegramConfig> {
  let result = { ...config };
  try {
    const res = await fetch(`${API_BASE}/course-telegram-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        result = data.config;
      }
    }
  } catch (err) {
    console.warn("[updateCourseTelegramConfigApi API_BASE failed, writing to Supabase directly]:", err);
  }

  try {
    await supaFetch("settings?on_conflict=key", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: "course_telegram_popup_config",
        value: JSON.stringify(result),
      }),
    });
  } catch (err) {
    console.warn("[updateCourseTelegramConfigApi Supabase direct upsert error]:", err);
  }

  return result;
}
