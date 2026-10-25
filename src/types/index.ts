export type MilestoneStatus = "pending" | "accepted" | "rejected";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
}

export interface Challenge {
  id: string;
  title: string;
  brief: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface GenerateRequest {
  title: string;
  brief: string;
}

export interface GenerateResponse {
  milestones: Array<{ title: string; description: string }>;
}

export interface SaveRequest {
  challengeTitle: string;
  challengeBrief: string;
  milestones: Milestone[];
}

export interface SaveResponse {
  success: boolean;
  challenge: Challenge;
}
