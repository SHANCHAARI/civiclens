// Issue types
export type IssueStatus =
  | "REPORTED"
  | "AI_ANALYZING"
  | "VERIFIED"
  | "DUPLICATE_REVIEW"
  | "ASSIGNED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CITIZEN_VERIFICATION"
  | "CLOSED"
  | "REJECTED"
  | "MERGED"
  | "REOPENED";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type UserRole = "CITIZEN" | "AUTHORITY" | "ADMIN";

export interface IssueWithDetails {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  severity: Severity;
  status: IssueStatus;
  priorityScore: number;
  reportCount: number;
  latitude: number;
  longitude: number;
  address: string | null;
  landmark: string | null;
  wardName: string | null;
  departmentName: string | null;
  authorName: string;
  authorId: string;
  aiConfidence: number | null;
  aiDescription: string | null;
  aiObservations: string | null;
  aiReasoning: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  evidence: Evidence[];
  statusHistory: StatusChange[];
  comments: CommentData[];
  verifications: VerificationData[];
}

export interface Evidence {
  id: string;
  fileUrl: string;
  fileName: string | null;
  fileType: string;
  isResolution: boolean;
  caption: string | null;
  createdAt: string;
}

export interface StatusChange {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedByName: string;
  note: string | null;
  createdAt: string;
}

export interface CommentData {
  id: string;
  body: string;
  userName: string;
  createdAt: string;
}

export interface VerificationData {
  id: string;
  verified: boolean;
  userName: string;
  note: string | null;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  avgResolutionDays: number | null;
  resolvedThisMonth: number;
}

export interface TrendData {
  date: string;
  reported: number;
  resolved: number;
}

export interface CategoryDistribution {
  name: string;
  count: number;
  color: string;
}

export interface HotspotData {
  latitude: number;
  longitude: number;
  count: number;
  avgSeverity: string;
}

// Notification types
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  issueId: string | null;
  createdAt: string;
}

// Category config
export const CATEGORY_CONFIG: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  pothole: { name: "Pothole", icon: "circle-alert", color: "#f97316" },
  "road-damage": { name: "Road Damage", icon: "construction", color: "#f97316" },
  "broken-streetlight": { name: "Broken Streetlight", icon: "lamp", color: "#eab308" },
  "garbage-waste": { name: "Garbage / Waste", icon: "trash-2", color: "#22c55e" },
  "water-leakage": { name: "Water Leakage", icon: "droplets", color: "#3b82f6" },
  "drainage-problem": { name: "Drainage Problem", icon: "waves", color: "#06b6d4" },
  "damaged-sidewalk": { name: "Damaged Sidewalk", icon: "footprints", color: "#8b5cf6" },
  "fallen-tree": { name: "Fallen Tree", icon: "tree-pine", color: "#16a34a" },
  "traffic-signal-issue": { name: "Traffic Signal Issue", icon: "traffic-cone", color: "#ef4444" },
  "illegal-dumping": { name: "Illegal Dumping", icon: "package-x", color: "#a855f7" },
  "public-infrastructure-damage": {
    name: "Public Infrastructure Damage",
    icon: "building-2",
    color: "#ec4899",
  },
  other: { name: "Other", icon: "help-circle", color: "#6b7280" },
};

export const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  LOW: { label: "Low", color: "#22c55e", bgColor: "bg-green-500/10 text-green-500" },
  MEDIUM: {
    label: "Medium",
    color: "#eab308",
    bgColor: "bg-yellow-500/10 text-yellow-500",
  },
  HIGH: {
    label: "High",
    color: "#f97316",
    bgColor: "bg-orange-500/10 text-orange-500",
  },
  CRITICAL: {
    label: "Critical",
    color: "#ef4444",
    bgColor: "bg-red-500/10 text-red-500",
  },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  REPORTED: {
    label: "Reported",
    color: "#338bff",
    bgColor: "bg-blue-500/10 text-blue-400",
  },
  AI_ANALYZING: {
    label: "AI Analyzing",
    color: "#8b5cf6",
    bgColor: "bg-purple-500/10 text-purple-400",
  },
  VERIFIED: {
    label: "Verified",
    color: "#06b6d4",
    bgColor: "bg-cyan-500/10 text-cyan-400",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "#f97316",
    bgColor: "bg-orange-500/10 text-orange-400",
  },
  ACKNOWLEDGED: {
    label: "Acknowledged",
    color: "#eab308",
    bgColor: "bg-yellow-500/10 text-yellow-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#22c55e",
    bgColor: "bg-green-500/10 text-green-400",
  },
  RESOLVED: {
    label: "Resolved",
    color: "#10b981",
    bgColor: "bg-emerald-500/10 text-emerald-400",
  },
  CLOSED: {
    label: "Closed",
    color: "#6b7280",
    bgColor: "bg-gray-500/10 text-gray-400",
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444",
    bgColor: "bg-red-500/10 text-red-400",
  },
  REOPENED: {
    label: "Reopened",
    color: "#f97316",
    bgColor: "bg-orange-500/10 text-orange-400",
  },
};

// Re-export utilities from lib/utils for convenience
export { timeAgo, formatDate, formatDateTime, daysSince, priorityColor, priorityLabel, canTransition, truncate } from "@/lib/utils";
export { STATUS_FLOW, VALID_TRANSITIONS } from "@/lib/utils";
