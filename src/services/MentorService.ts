import { HttpClient } from "../core/http/HttpClient";
import { APP_CONFIG } from "../core/config/env";

export interface ActiveMentorInfo {
  isAssigned: boolean;
  mentorId: number | null;
  name: string | null;
  avatar: string | null;
  bio?: string | null;
  isEligible: boolean;
  appointedAt?: string | null;
}

export interface MentorUserDirectoryItem {
  id: number;
  name: string;
  email: string | null;
  avatar: string | null;
  accountStatus: string;
  plan: "free" | "pro" | "premium";
  isPaidActive: boolean;
  isEligible: boolean;
  isCurrentMentor: boolean;
  createdAt: string | null;
}

export interface ListMentorUsersResponse {
  success: boolean;
  users: MentorUserDirectoryItem[];
  total: number;
  currentMentorId: number | null;
}

export class MentorService extends HttpClient {
  constructor(apiBase: string = APP_CONFIG.API_BASE) {
    super(apiBase);
  }

  public async getActiveMentor(): Promise<ActiveMentorInfo> {
    const res = await this.get<{ success: boolean; activeMentor: ActiveMentorInfo }>("/mentor/status");
    return res.activeMentor;
  }

  public async listUsers(
    query = "",
    onlyPremium = true,
    page = 1,
    pageSize = 50
  ): Promise<{ users: MentorUserDirectoryItem[]; total: number; currentMentorId: number | null }> {
    const params = new URLSearchParams({
      query,
      onlyPremium: String(onlyPremium),
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await this.get<ListMentorUsersResponse>(`/mentor/users?${params.toString()}`);
    return {
      users: res.users || [],
      total: res.total || 0,
      currentMentorId: res.currentMentorId || null,
    };
  }

  public async appointMentor(userId: number): Promise<ActiveMentorInfo> {
    const res = await this.post<{ success: boolean; activeMentor: ActiveMentorInfo }>("/mentor/appoint", {
      userId,
    });
    return res.activeMentor;
  }

  public async removeMentor(): Promise<void> {
    await this.post<{ success: boolean; message: string }>("/mentor/remove", {});
  }
}

export const defaultMentorService = new MentorService();
