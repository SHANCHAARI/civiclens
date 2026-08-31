import { prisma } from "./db";

interface PriorityFactors {
  severityScore: number;       // 0-25
  citizenImpactScore: number;  // 0-20
  durationScore: number;       // 0-15
  locationScore: number;       // 0-15
  reportFrequencyScore: number; // 0-15
  confidenceScore: number;     // 0-10
}

export interface PriorityResult {
  score: number;
  factors: PriorityFactors;
  reasons: string[];
}

const SEVERITY_WEIGHTS: Record<string, number> = {
  LOW: 5,
  MEDIUM: 12,
  HIGH: 20,
  CRITICAL: 25,
};

const CATEGORY_RISK: Record<string, number> = {
  "fallen-tree": 0.9,
  "traffic-signal-issue": 0.85,
  "pothole": 0.7,
  "water-leakage": 0.7,
  "road-damage": 0.6,
  "garbage-waste": 0.55,
  "illegal-dumping": 0.5,
  "broken-streetlight": 0.5,
  "drainage-problem": 0.45,
  "damaged-sidewalk": 0.35,
};

export function calculatePriority(issue: {
  severity: string;
  categorySlug: string;
  createdAt: Date;
  latitude: number;
  longitude: number;
  reportCount: number;
  aiConfidence: number | null;
}): PriorityResult {
  const reasons: string[] = [];

  // 1. Severity Score (0-25)
  const severityScore = SEVERITY_WEIGHTS[issue.severity] || 10;
  if (severityScore >= 20) reasons.push(`Severity: ${issue.severity}`);
  if (severityScore >= 15) reasons.push(`High severity level`);

  // 2. Citizen Impact Score (0-20)
  const categoryRisk = CATEGORY_RISK[issue.categorySlug] || 0.5;
  let citizenImpactScore = Math.round(categoryRisk * 20);

  // Bonus for categories near schools, hospitals (simulated with coordinate ranges)
  const isHighImpactArea = (issue.latitude % 1 > 0.3 && issue.latitude % 1 < 0.7);
  if (isHighImpactArea) {
    citizenImpactScore = Math.min(20, citizenImpactScore + 5);
    reasons.push("Near high-impact area");
  }

  // 3. Duration Score (0-15) — older issues get higher priority
  const daysOpen = Math.max(0, (Date.now() - issue.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  let durationScore = Math.min(15, Math.round(daysOpen * 1.5));
  if (daysOpen > 7) {
    reasons.push(`Open for ${Math.round(daysOpen)} days`);
    durationScore = Math.min(15, durationScore + 3);
  }
  if (daysOpen > 30) reasons.push("Long-standing issue");

  // 4. Location Importance Score (0-15)
  let locationScore = 7; // base
  if (isHighImpactArea) {
    locationScore += 4;
  }
  // Urban density factor (simulated)
  const densityFactor = Math.abs(Math.sin(issue.latitude * 0.01 + issue.longitude * 0.01));
  locationScore = Math.min(15, locationScore + Math.round(densityFactor * 4));
  if (locationScore >= 12) reasons.push("Strategic location");

  // 5. Report Frequency Score (0-15)
  let reportFrequencyScore = Math.min(15, Math.round(issue.reportCount * 0.8));
  if (issue.reportCount >= 5) {
    reasons.push(`${issue.reportCount} supporting reports`);
    reportFrequencyScore = Math.min(15, reportFrequencyScore + 2);
  }
  if (issue.reportCount >= 10) reasons.push("Multiple citizens affected");

  // 6. Confidence Score (0-10)
  const confidenceScore = issue.aiConfidence
    ? Math.round(issue.aiConfidence * 10)
    : 5;

  // Calculate total
  const score = Math.min(
    100,
    severityScore +
      citizenImpactScore +
      durationScore +
      locationScore +
      reportFrequencyScore +
      confidenceScore
  );

  // Additional reasons
  if (score >= 80) reasons.unshift("Critical priority");
  else if (score >= 60) reasons.unshift("High priority");
  else if (score >= 40) reasons.unshift("Medium priority");
  else reasons.unshift("Low priority");

  return {
    score,
    factors: {
      severityScore,
      citizenImpactScore,
      durationScore,
      locationScore,
      reportFrequencyScore,
      confidenceScore,
    },
    reasons,
  };
}
