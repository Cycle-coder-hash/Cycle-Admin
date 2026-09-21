import { Order, Student, SupportTicket, AuditEvent } from "./types";

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

export async function fetchAdminTickets(): Promise<SupportTicket[]> {
  try {
    const res = await fetch(`${API_BASE}/tickets`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) return data.tickets;
    }
  } catch (err) {
    console.warn("[API_BASE/tickets unreachable, falling back to direct Supabase]:", err);
  }

  try {
    const res = await supaFetch("supportTickets?select=*&order=id.desc");
    if (res.ok) {
      const tickets = await res.json();
      return Array.isArray(tickets) ? tickets : [];
    }
  } catch {}
  return [];
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

export async function updateTicketStatusApi(ticketId: number, status: string) {
  try {
    const res = await fetch(`${API_BASE}/update-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    console.warn("[updateTicketStatusApi primary failed, trying Supabase direct]:", err);
  }

  try {
    await supaFetch(`supportTickets?id=eq.${ticketId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
    });
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "Failed to update ticket");
  }
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
  try {
    const res = await fetch(`${API_BASE}/ebooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ebook) return data.ebook;
    }
  } catch (err) {
    console.warn("[createEbookApi primary failed, saving to Supabase settings]:", err);
  }

  const existingRes = await supaFetch("settings?key=eq.free_ebooks&select=value");
  let existing: any[] = [];
  if (existingRes.ok) {
    const rows = await existingRes.json();
    if (rows && rows[0]?.value) existing = JSON.parse(rows[0].value);
  }
  const newEbook = {
    id: Date.now(),
    ...payload,
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
  try {
    const res = await fetch(`${API_BASE}/ebooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.ebook) return data.ebook;
    }
  } catch (err) {
    console.warn("[updateEbookApi primary failed, updating Supabase settings]:", err);
  }

  const existingRes = await supaFetch("settings?key=eq.free_ebooks&select=value");
  let existing: any[] = [];
  if (existingRes.ok) {
    const rows = await existingRes.json();
    if (rows && rows[0]?.value) existing = JSON.parse(rows[0].value);
  }
  const idx = existing.findIndex((e) => e.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...payload, updatedAt: new Date().toISOString() };
    await supaFetch("settings", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ key: "free_ebooks", value: JSON.stringify(existing) }),
    });
    return existing[idx];
  }
  return { id, ...payload };
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
      }
    }
  } catch (err) {
    console.warn("[updateOwnerProfileApi primary failed, syncing directly to Supabase]:", err);
  }

  // Always also write directly to Supabase settings for instant guaranteed consistency
  try {
    await supaFetch("settings", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: "owner_profile",
        value: JSON.stringify(updatedProfile),
      }),
    });
  } catch (err) {
    console.warn("[Supabase direct owner_profile upsert error]:", err);
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
    const res = await supaFetch("settings?key=in.(bkash,nagad,rocket,announcement)&select=key,value");
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
    await supaFetch("settings", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({
        key: "payment_gateways_config",
        value: JSON.stringify(config),
      }),
    });

    // Also sync legacy individual keys
    await Promise.allSettled([
      supaFetch("settings", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "bkash", value: config.bkash.number }),
      }),
      supaFetch("settings", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "nagad", value: config.nagad.number }),
      }),
      supaFetch("settings", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key: "rocket", value: config.rocket.number }),
      }),
      supaFetch("settings", {
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
