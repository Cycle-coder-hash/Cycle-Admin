import { useState, useEffect, useCallback, useMemo } from "react";
import { SupportConversation } from "../lib/types";
import { services } from "../services";

export interface UseSupportReturn {
  conversations: SupportConversation[];
  unreadMessagesCount: number;
  loading: boolean;
  reload: () => Promise<void>;
}

export function useSupportConversations(): UseSupportReturn {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.support.fetchConversations();
      setConversations(data);
    } catch (err: any) {
      console.warn("[useSupportConversations load error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const unreadMessagesCount = useMemo(
    () =>
      conversations.reduce(
        (acc: number, c: SupportConversation) => acc + (c.unreadCount || 0),
        0
      ),
    [conversations]
  );

  return {
    conversations,
    unreadMessagesCount,
    loading,
    reload,
  };
}
