import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function daysSince(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function priorityColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-yellow-400";
  return "text-green-400";
}

export function priorityLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// Valid status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  REPORTED: ["AI_ANALYZING", "VERIFIED", "REJECTED"],
  AI_ANALYZING: ["VERIFIED", "DUPLICATE_REVIEW", "REJECTED"],
  VERIFIED: ["DUPLICATE_REVIEW", "ASSIGNED"],
  DUPLICATE_REVIEW: ["ASSIGNED", "MERGED"],
  ASSIGNED: ["ACKNOWLEDGED"],
  ACKNOWLEDGED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CITIZEN_VERIFICATION", "CLOSED"],
  CITIZEN_VERIFICATION: ["CLOSED", "REOPENED"],
  REOPENED: ["ASSIGNED"],
  CLOSED: [],
  REJECTED: [],
  MERGED: [],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export const STATUS_FLOW = [
  "REPORTED",
  "AI_ANALYZING",
  "VERIFIED",
  "ASSIGNED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CITIZEN_VERIFICATION",
  "CLOSED",
];
