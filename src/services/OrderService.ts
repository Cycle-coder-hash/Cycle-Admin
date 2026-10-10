import { HttpClient } from "../core/http/HttpClient";
import { defaultSupabaseAdapter, SupabaseAdapter } from "../core/http/SupabaseAdapter";
import { Order } from "../lib/types";
import { APP_CONFIG } from "../core/config/env";

export interface AdminStats {
  totalRevenue: number;
  pendingOrders: number;
  totalStudents: number;
  activeNow: number;
}

export interface IOrderService {
  fetchStats(): Promise<AdminStats>;
  fetchOrders(): Promise<Order[]>;
  approveOrder(orderId: number): Promise<{ success: boolean }>;
  rejectOrder(orderId: number, reason: string): Promise<{ success: boolean }>;
  deleteOrder(orderId: number): Promise<{ success: boolean }>;
}

export class OrderService extends HttpClient implements IOrderService {
  constructor(
    apiBase: string = APP_CONFIG.API_BASE,
    private readonly supabase: SupabaseAdapter = defaultSupabaseAdapter
  ) {
    super(apiBase);
  }

  public async fetchStats(): Promise<AdminStats> {
    try {
      const data = await this.get<{ success?: boolean; stats?: AdminStats }>("/stats");
      if (data?.success && data.stats) return data.stats;
    } catch (err) {
      console.warn("[API_BASE/stats unreachable, falling back to direct Supabase]:", err);
    }

    // Direct Supabase fallback
    try {
      const [orders, users] = await Promise.all([
        this.supabase.fetchRaw<any[]>("orders", "select=*"),
        this.supabase.fetchRaw<any[]>("users", "select=*"),
      ]);

      const safeOrders = Array.isArray(orders) ? orders : [];
      const safeUsers = Array.isArray(users) ? users : [];

      const totalRevenue = safeOrders
        .filter((o) => o.paymentStatus === "approved")
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      const pendingOrders = safeOrders.filter((o) => o.paymentStatus === "pending").length;
      const totalStudents = safeUsers.length;

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

  public async fetchOrders(): Promise<Order[]> {
    try {
      const data = await this.get<{ success?: boolean; orders?: Order[] }>("/orders");
      if (data?.success && Array.isArray(data.orders)) return data.orders;
    } catch (err) {
      console.warn("[API_BASE/orders unreachable, falling back to direct Supabase]:", err);
    }

    try {
      const [orders, users] = await Promise.all([
        this.supabase.fetchRaw<any[]>("orders", "select=*&order=id.desc"),
        this.supabase.fetchRaw<any[]>("users", "select=id,name,email,phone"),
      ]);

      const safeUsers = Array.isArray(users) ? users : [];
      const userMap = new Map(safeUsers.map((u: any) => [u.id, u]));

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
      return [];
    } catch (err) {
      console.warn("[Supabase orders fallback error]:", err);
      return [];
    }
  }

  public async approveOrder(orderId: number): Promise<{ success: boolean }> {
    try {
      const data = await this.post<{ success?: boolean }>("/approve-order", { orderId });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[approveOrder primary failed, trying Supabase direct]:", err);
    }

    try {
      const orderData = await this.supabase.fetchRaw<any[]>("orders", `id=eq.${orderId}&select=*`);
      const order = Array.isArray(orderData) ? orderData[0] : null;

      await this.supabase.put(`orders?id=eq.${orderId}`, {
        paymentStatus: "approved",
        orderStatus: "approved",
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (order && order.customerId) {
        const scope = order.bundleId ? `bundle:${order.bundleId}` : `product:${order.productId}`;
        try {
          await this.supabase.post("entitlements", {
            userId: order.customerId,
            orderId: order.id,
            bundleId: order.bundleId || null,
            productId: order.productId || null,
            scope,
            grantedAt: new Date().toISOString(),
          });
        } catch (entErr) {
          console.warn("[approveOrder entitlement creation error]:", entErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to approve order");
    }
  }

  public async rejectOrder(orderId: number, reason: string): Promise<{ success: boolean }> {
    try {
      const data = await this.post<{ success?: boolean }>("/reject-order", { orderId, reason });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[rejectOrder primary failed, trying Supabase direct]:", err);
    }

    try {
      await this.supabase.put(`orders?id=eq.${orderId}`, {
        paymentStatus: "rejected",
        orderStatus: "rejected",
        rejectionReason: reason,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to reject order");
    }
  }

  public async deleteOrder(orderId: number): Promise<{ success: boolean }> {
    try {
      const data = await this.post<{ success?: boolean }>("/delete-order", { orderId });
      if (data?.success) return { success: true };
    } catch (err) {
      console.warn("[deleteOrder primary failed, trying Supabase direct]:", err);
    }

    try {
      await this.supabase.delete(`orders?id=eq.${orderId}`);
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete order");
    }
  }
}

export const defaultOrderService = new OrderService();
