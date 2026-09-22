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
  userId?: number | null;
  ticketCode?: string;
  userName?: string;
  userEmail?: string;
  category?: string;
  priority?: "low" | "medium" | "high" | "urgent" | string;
  subject: string;
  message: string;
  status: "open" | "pending" | "in_progress" | "waiting_customer" | "waiting_user" | "solved" | "resolved" | "closed" | string;
  attachmentUrl?: string | null;
  assignedStaff?: string | null;
  firstResponseAt?: string | Date | null;
  lastReplyAt?: string | Date | null;
  solvedAt?: string | Date | null;
  closedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface SupportTicketReply {
  id: number;
  ticketId: number;
  senderRole: "user" | "support" | "admin";
  senderName: string;
  senderEmail?: string;
  message: string;
  attachmentUrl?: string | null;
  createdAt: string | Date;
}

export interface TicketInternalNote {
  id: number;
  ticketId: number;
  authorId?: number | null;
  authorName: string;
  authorEmail?: string | null;
  authorRole?: string;
  content: string;
  createdAt: string | Date;
}

export interface SupportMetrics {
  total: number;
  open: number;
  pending: number;
  inProgress: number;
  waitingCustomer: number;
  solved: number;
  closed: number;
  priorities: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  avgResponseMinutes: number;
  avgResolutionHours: number;
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
