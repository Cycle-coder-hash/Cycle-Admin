/**
 * Cycle-Admin API Facade (Backward-Compatibility & Delegation Layer)
 *
 * NOTE: All direct procedural logic has been refactored into OOP domain service classes:
 * - OrderService (orders, approvals, revenue KPIs)
 * - UserService (students, roles, entitlement overrides, status)
 * - SupportService (real-time chat, customer 360 context)
 * - EbookService (CMS library, cloud uploads)
 * - OwnerProfileService (founder CMS profile)
 * - SettingsService (gateways, telegram popup, leaderboard matrix, audit logs)
 *
 * This file maintains 100% backward compatibility for all existing UI pages.
 */

import {
  services,
  defaultPaymentConfig,
  defaultCourseTelegramConfig,
  defaultLeaderboardWeights,
  PaymentGatewayConfig,
  PaymentSettingsConfig,
  LeaderboardWeightsConfig,
  UserManagementFilters,
  UpdateUserAccessPayload,
} from "../services";

import {
  Order,
  Student,
  SupportConversation,
  SupportMessage,
  CustomerSupportContext,
  AuditEvent,
  CourseTelegramConfig,
  CourseId,
  CourseClass,
  CourseAlbumMeta,
} from "./types";

// Re-export shared types & configs
export type {
  CourseTelegramConfig,
  CourseId,
  CourseClass,
  CourseAlbumMeta,
  SupportConversation,
  SupportMessage,
  CustomerSupportContext,
  PaymentGatewayConfig,
  PaymentSettingsConfig,
  LeaderboardWeightsConfig,
  UserManagementFilters,
  UpdateUserAccessPayload,
};

export {
  defaultPaymentConfig,
  defaultCourseTelegramConfig,
  defaultLeaderboardWeights,
};

// ============================================================================
// 1. ORDER & KPI STATS (Delegated to OrderService)
// ============================================================================
export const fetchAdminStats = () => services.orders.fetchStats();
export const fetchAdminOrders = () => services.orders.fetchOrders();
export const approveOrderApi = (orderId: number) => services.orders.approveOrder(orderId);
export const rejectOrderApi = (orderId: number, reason: string) => services.orders.rejectOrder(orderId, reason);
export const deleteOrderApi = (orderId: number) => services.orders.deleteOrder(orderId);

// ============================================================================
// 2. USER & STUDENT MANAGEMENT (Delegated to UserService)
// ============================================================================
export const fetchAdminUsers = () => services.users.fetchUsers();
export const grantAccessApi = (userId: number, bundleId?: number, productId?: number) =>
  services.users.grantAccess(userId, bundleId, productId);
export const updateRoleApi = (userId: number, role: "user" | "support" | "admin") =>
  services.users.updateRole(userId, role);
export const fetchUserManagementListApi = (filters?: UserManagementFilters) =>
  services.users.fetchUserManagementList(filters);
export const fetchUserManagementDetailsApi = (userId: number) =>
  services.users.fetchUserManagementDetails(userId);
export const updateUserManagementAccessApi = (payload: UpdateUserAccessPayload) =>
  services.users.updateUserManagementAccess(payload);
export const clearUserManagementOverrideApi = (
  userId: number,
  accessType: "course" | "pro" | "premium"
) => services.users.clearUserManagementOverride(userId, accessType);
export const setUserManagementAccountStatusApi = (
  userId: number,
  status: "active" | "suspended" | "banned"
) => services.users.setUserManagementAccountStatus(userId, status);

// ============================================================================
// 3. SUPPORT DESK & MESSAGING (Delegated to SupportService)
// ============================================================================
export const fetchSupportConversationsApi = () => services.support.fetchConversations();
export const fetchAdminTickets = () => services.support.fetchTickets();
export const markConversationReadApi = (conversationId: number) =>
  services.support.markConversationRead(conversationId);
export const fetchConversationMessagesApi = (conversationId: number) =>
  services.support.fetchConversationMessages(conversationId);
export const sendAdminReplyApi = (conversationId: number, message: string, customerId?: number) =>
  services.support.sendReply(conversationId, message, customerId);
export const deleteSupportMessageApi = (conversationId: number, messageId: number) =>
  services.support.deleteMessage(conversationId, messageId);
export const deleteSupportConversationApi = (conversationId: number) =>
  services.support.deleteConversation(conversationId);
export const fetchCustomerContextApi = (customerId: number) =>
  services.support.fetchCustomerContext(customerId);
export const updateTicketStatusApi = (ticketId: number, status: string) =>
  services.support.updateTicketStatus(ticketId, status);
export const fetchSupportMetricsApi = () => services.support.fetchMetrics();

// ============================================================================
// 4. EBOOKS CMS & STORAGE (Delegated to EbookService)
// ============================================================================
export const fetchAdminEbooks = () => services.ebooks.fetchEbooks();
export const createEbookApi = (payload: any) => services.ebooks.createEbook(payload);
export const updateEbookApi = (id: number, payload: any) => services.ebooks.updateEbook(id, payload);
export const deleteEbookApi = (id: number) => services.ebooks.deleteEbook(id);
export const uploadPdfToFreeStorage = (file: File) => services.ebooks.uploadPdf(file);
export const uploadImageToImgbb = (base64Data: string) => services.ebooks.uploadImage(base64Data);

// ============================================================================
// 5. OWNER PROFILE CMS (Delegated to OwnerProfileService)
// ============================================================================
export const fetchOwnerProfileApi = () => services.ownerProfile.fetchProfile();
export const updateOwnerProfileApi = (payload: any) => services.ownerProfile.updateProfile(payload);

// ============================================================================
// 6. PLATFORM SETTINGS & AUDIT LOGS (Delegated to SettingsService)
// ============================================================================
export const fetchAdminAuditLogs = () => services.settings.fetchAuditLogs();
export const fetchPaymentSettingsApi = () => services.settings.fetchPaymentSettings();
export const updatePaymentSettingsApi = (config: PaymentSettingsConfig) =>
  services.settings.updatePaymentSettings(config);
export const fetchCourseTelegramConfigApi = () => services.settings.fetchCourseTelegramConfig();
export const updateCourseTelegramConfigApi = (config: CourseTelegramConfig) =>
  services.settings.updateCourseTelegramConfig(config);
export const fetchLeaderboardWeightsApi = () => services.settings.fetchLeaderboardWeights();
export const updateLeaderboardWeightsApi = (weights: LeaderboardWeightsConfig) =>
  services.settings.updateLeaderboardWeights(weights);
export const recalculateLeaderboardApi = () => services.settings.recalculateLeaderboard();

// 7. LIBRARY & COURSE ALBUMS (Delegated to CourseService)
// ============================================================================
export const fetchCourseAlbumMetaApi = (courseId: CourseId) => services.courses.fetchCourseAlbumMeta(courseId);
export const updateCourseAlbumMetaApi = (courseId: CourseId, payload: Partial<CourseAlbumMeta>) =>
  services.courses.updateCourseAlbumMeta(courseId, payload);
export const fetchCourseClassesApi = (courseId: CourseId) => services.courses.fetchCourseClasses(courseId);
export const createCourseClassApi = (
  courseId: CourseId,
  payload: {
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order?: number;
    isPublished?: boolean;
    resourceLink?: string;
  }
) => services.courses.createCourseClass(courseId, payload);
export const updateCourseClassApi = (
  courseId: CourseId,
  classId: string,
  payload: Partial<CourseClass>
) => services.courses.updateCourseClass(courseId, classId, payload);
export const deleteCourseClassApi = (courseId: CourseId, classId: string) =>
  services.courses.deleteCourseClass(courseId, classId);
export const reorderCourseClassesApi = (courseId: CourseId, orderedClassIds: string[]) =>
  services.courses.reorderCourseClasses(courseId, orderedClassIds);
export const reorderEbooksApi = (orderedIds: number[]) => services.courses.reorderEbooks(orderedIds);

// ============================================================================
// 8. COMMUNITY MODERATION (Delegated to CommunityService)
// ============================================================================
export const fetchCommunityPostsApi = (limit?: number, cursor?: number) =>
  services.community.fetchPosts(limit, cursor);
export const deleteCommunityPostApi = (postId: number) =>
  services.community.deletePost(postId);
export const deleteCommunityCommentApi = (commentId: number) =>
  services.community.deleteComment(commentId);
export const togglePinCommunityPostApi = (postId: number, isPinned: boolean) =>
  services.community.togglePin(postId, isPinned);

