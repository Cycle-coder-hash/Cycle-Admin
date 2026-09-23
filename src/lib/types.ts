export interface Order {
  id: number;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bundleId?: number | null;
  productId?: number | null;
  amount: string;
  currency: string;
  paymentMethod: "bkash" | "nagad" | "rocket";
  transactionId: string;
  paymentStatus: "pending" | "approved" | "rejected";
  orderStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  createdAt: string | Date;
}

export interface Student {
  id: number;
  openId: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "support" | "admin";
  ordersCount?: number;
  totalSpent?: number;
  createdAt: string | Date;
}

export interface SupportMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: "customer" | "admin" | "support" | "user";
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export interface SupportConversation {
  id: number;
  customerId: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  customer?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    createdAt: string | null;
  };
  lastMessage?: SupportMessage | null;
  unreadCount: number;
  totalMessages: number;
}

export interface CustomerSupportContext {
  customer: {
    id: number;
    openId?: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    createdAt: string | null;
  };
  entitlements: Array<{
    id: number;
    orderId?: number;
    productId?: number;
    bundleId?: number;
    scope: string;
    productTitle?: string;
    grantedAt: string;
  }>;
  orders: Array<{
    id: number;
    amount: string;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    bundleId?: number | null;
    productId?: number | null;
    selectedPdfIds?: number[];
    createdAt: string;
  }>;
  stats: {
    totalSpend: number;
    totalOrders: number;
    activeEntitlementsCount: number;
  };
}

export interface AuditEvent {
  id: number;
  actorId: number;
  action: string;
  entity: string;
  entityId: number;
  metadata?: any;
  createdAt: string | Date;
}

export interface CourseTelegramConfig {
  enabled: boolean;
  telegramUrl: string;
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  joinButtonTextEn: string;
  joinButtonTextBn: string;
  dismissButtonTextEn: string;
  dismissButtonTextBn: string;
  displayMode: "once" | "until_joined";
  popupDelay?: number;
}
