/**
 * Central Service Registry (OOP & Dependency Injection root)
 */

export * from "./OrderService";
export * from "./UserService";
export * from "./SupportService";
export * from "./EbookService";
export * from "./OwnerProfileService";
export * from "./SettingsService";
export * from "./CourseService";
export * from "./CommunityService";
export * from "./SocialProofService";
export * from "./MentorService";
export * from "./AiReportService";

import { defaultOrderService } from "./OrderService";
import { defaultUserService } from "./UserService";
import { defaultSupportService } from "./SupportService";
import { defaultEbookService } from "./EbookService";
import { defaultOwnerProfileService } from "./OwnerProfileService";
import { defaultSettingsService } from "./SettingsService";
import { CourseService } from "./CourseService";
import { defaultCommunityService } from "./CommunityService";
import { defaultSocialProofService } from "./SocialProofService";
import { defaultMentorService } from "./MentorService";
import { defaultAiReportService } from "./AiReportService";

export const defaultCourseService = new CourseService();

export const services = {
  orders: defaultOrderService,
  users: defaultUserService,
  support: defaultSupportService,
  ebooks: defaultEbookService,
  ownerProfile: defaultOwnerProfileService,
  settings: defaultSettingsService,
  courses: defaultCourseService,
  community: defaultCommunityService,
  socialProof: defaultSocialProofService,
  mentor: defaultMentorService,
  aiReport: defaultAiReportService,
} as const;
