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

export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string | Date;
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
