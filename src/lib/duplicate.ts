import { prisma } from "./db";

interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarIssues: Array<{
    id: string;
    title: string;
    categorySlug: string;
    severity: string;
    status: string;
    distance: number;
    similarity: number;
    reportCount: number;
    createdAt: Date;
  }>;
  totalNearby: number;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function checkDuplicates(params: {
  latitude: number;
  longitude: number;
  categorySlug: string;
  radiusMeters?: number;
  daysBack?: number;
}): Promise<DuplicateCheckResult> {
  const {
    latitude,
    longitude,
    categorySlug,
    radiusMeters = 200,
    daysBack = 30,
  } = params;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Get recent issues in the area
  const nearbyIssues = await prisma.issue.findMany({
    where: {
      createdAt: { gte: cutoffDate },
      isDuplicate: false,
      status: { notIn: ["REJECTED", "MERGED"] },
    },
    select: {
      id: true,
      title: true,
      categorySlug: true,
      severity: true,
      status: true,
      latitude: true,
      longitude: true,
      reportCount: true,
      createdAt: true,
    },
  });

  const similarIssues: DuplicateCheckResult["similarIssues"] = [];

  for (const issue of nearbyIssues) {
    const distance = haversineDistance(
      latitude,
      longitude,
      issue.latitude,
      issue.longitude
    );

    if (distance > radiusMeters) continue;

    // Calculate similarity score
    let similarity = 0;

    // Category match (0.0 - 0.4)
    if (issue.categorySlug === categorySlug) {
      similarity += 0.4;
    }

    // Proximity (0.0 - 0.4)
    const proximityScore = 1 - distance / radiusMeters;
    similarity += proximityScore * 0.4;

    // Recency (0.0 - 0.2)
    const ageHours =
      (Date.now() - issue.createdAt.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageHours / (daysBack * 24));
    similarity += recencyScore * 0.2;

    if (similarity >= 0.3) {
      similarIssues.push({
        id: issue.id,
        title: issue.title,
        categorySlug: issue.categorySlug,
        severity: issue.severity,
        status: issue.status,
        distance: Math.round(distance),
        similarity: Math.round(similarity * 100) / 100,
        reportCount: issue.reportCount,
        createdAt: issue.createdAt,
      });
    }
  }

  // Sort by similarity
  similarIssues.sort((a, b) => b.similarity - a.similarity);

  return {
    isDuplicate: similarIssues.length > 0,
    similarIssues: similarIssues.slice(0, 10),
    totalNearby: similarIssues.length,
  };
}
