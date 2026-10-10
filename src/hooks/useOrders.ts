import { useState, useEffect, useCallback, useMemo } from "react";
import { Order } from "../lib/types";
import { services } from "../services";

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  pendingCount: number;
  approvedCount: number;
  reload: () => Promise<void>;
  approveOrder: (orderId: number) => Promise<boolean>;
  rejectOrder: (orderId: number, reason: string) => Promise<boolean>;
  deleteOrder: (orderId: number) => Promise<boolean>;
  actionMessage: string | null;
  clearActionMessage: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.orders.fetchOrders();
      setOrders(data);
    } catch (err: any) {
      console.warn("[useOrders load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const approveOrder = useCallback(
    async (orderId: number) => {
      try {
        await services.orders.approveOrder(orderId);
        setActionMessage(`Order #${orderId} approved and entitlement granted in DB.`);
        setTimeout(() => setActionMessage(null), 4000);
        await reload();
        return true;
      } catch (err: any) {
        alert("Failed to approve order: " + err.message);
        return false;
      }
    },
    [reload]
  );

  const rejectOrder = useCallback(
    async (orderId: number, reason: string) => {
      try {
        await services.orders.rejectOrder(orderId, reason);
        setActionMessage(`Order #${orderId} rejected.`);
        setTimeout(() => setActionMessage(null), 4000);
        await reload();
        return true;
      } catch (err: any) {
        alert("Failed to reject order: " + err.message);
        return false;
      }
    },
    [reload]
  );

  const deleteOrder = useCallback(async (orderId: number) => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${orderId} from the database?`)) {
      return false;
    }
    try {
      await services.orders.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o: Order) => o.id !== orderId));
      alert(`Order #${orderId} has been successfully deleted from the database.`);
      return true;
    } catch (err: any) {
      alert(`Failed to delete order: ${err.message}`);
      return false;
    }
  }, []);

  const pendingCount = useMemo(
    () => orders.filter((o: Order) => o.orderStatus === "pending").length,
    [orders]
  );

  const approvedCount = useMemo(
    () => orders.filter((o: Order) => o.orderStatus === "approved").length,
    [orders]
  );

  return {
    orders,
    loading,
    pendingCount,
    approvedCount,
    reload,
    approveOrder,
    rejectOrder,
    deleteOrder,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
  };
}
