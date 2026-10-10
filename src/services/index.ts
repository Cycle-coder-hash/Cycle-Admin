/**
 * Central Service Registry (OOP & Dependency Injection root)
 */

export * from "./OrderService";
export * from "./UserService";
export * from "./SupportService";
export * from "./EbookService";
export * from "./OwnerProfileService";
export * from "./SettingsService";

import { defaultOrderService } from "./OrderService";
import { defaultUserService } from "./UserService";
import { defaultSupportService } from "./SupportService";
import { defaultEbookService } from "./EbookService";
import { defaultOwnerProfileService } from "./OwnerProfileService";
import { defaultSettingsService } from "./SettingsService";

export const services = {
  orders: defaultOrderService,
  users: defaultUserService,
  support: defaultSupportService,
  ebooks: defaultEbookService,
  ownerProfile: defaultOwnerProfileService,
  settings: defaultSettingsService,
} as const;
