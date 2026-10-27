import { HttpClient } from "../core/http/HttpClient";
import { APP_CONFIG } from "../core/config/env";

export interface AiConfigPublicStatus {
  hasKey: boolean;
  keySource: "admin" | "env" | "none";
  status: string;
  primaryModelId: string;
  fallbackModelId: string;
  lastSavedAt: string | null;
  isValid: boolean;
}

export interface AiBudgetStatus {
  monthlyBudgetUsd: number;
  dailyBudgetUsd: number;
  monthlySpendUsd: number;
  dailySpendUsd: number;
  monthlyUtilizationPercent: number;
  dailyUtilizationPercent: number;
  activeReservationsCount: number;
  activeReservedAmountUsd: number;
  isThresholdAlert: boolean;
  isHardLimitReached: boolean;
  canAcceptJobs: boolean;
  costTrackingAvailable: boolean;
}

export interface AiReportIssueItem {
  id: string;
  userId: number;
  reportId: string;
  affectedSection: string;
  userDescription: string;
  status: "Pending Review" | "Under Investigation" | "Approved" | "Rejected";
  resolutionNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface TestAiConnectionResult {
  success: boolean;
  model: string;
  latencyMs: number;
  message?: string;
  error?: string;
}

export class AiReportService extends HttpClient {
  constructor(apiBase: string = APP_CONFIG.API_BASE) {
    super(apiBase);
  }

  public async getConfig(): Promise<AiConfigPublicStatus> {
    const res = await this.get<{ success: boolean; config: AiConfigPublicStatus }>("/ai-report/config");
    return res.config;
  }

  public async saveConfig(data: {
    openRouterApiKey?: string;
    primaryModelId: string;
    fallbackModelId: string;
  }): Promise<AiConfigPublicStatus> {
    const res = await this.post<{ success: boolean; config: AiConfigPublicStatus }>("/ai-report/config", data);
    return res.config;
  }

  public async removeKey(): Promise<AiConfigPublicStatus> {
    const res = await this.post<{ success: boolean; config: AiConfigPublicStatus }>("/ai-report/remove-key", {});
    return res.config;
  }

  public async testConnection(data: {
    modelId: string;
    apiKey?: string;
  }): Promise<TestAiConnectionResult> {
    const res = await this.post<{ success: boolean; result: TestAiConnectionResult }>("/ai-report/test", data);
    return res.result;
  }

  public async getBudget(): Promise<AiBudgetStatus> {
    const res = await this.get<{ success: boolean; status: AiBudgetStatus }>("/ai-report/budget");
    return res.status;
  }

  public async getIssues(status?: string): Promise<AiReportIssueItem[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const res = await this.get<{ success: boolean; issues: AiReportIssueItem[] }>(`/ai-report/issues${query}`);
    return res.issues || [];
  }

  public async reviewIssue(data: {
    issueId: string;
    decision: "Approved" | "Rejected";
    reason: string;
    overlayCorrection?: any;
  }): Promise<any> {
    const res = await this.post<{ success: boolean; issue: any }>("/ai-report/review-issue", data);
    return res.issue;
  }
}

export const defaultAiReportService = new AiReportService();
