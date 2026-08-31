// Geospatial utility functions

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
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

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function getBounds(
  center: GeoPoint,
  radiusKm: number
): GeoBounds {
  const latRad = (center.latitude * Math.PI) / 180;
  const dLat = (radiusKm / 111.32);
  const dLon = radiusKm / (111.32 * Math.cos(latRad));

  return {
    north: center.latitude + dLat,
    south: center.latitude - dLat,
    east: center.longitude + dLon,
    west: center.longitude - dLon,
  };
}

// Default center: Hyderabad, India
export const DEFAULT_CENTER: GeoPoint = {
  latitude: 17.385,
  longitude: 78.4867,
};

export const DEFAULT_ZOOM = 12;

// Severity colors for map markers
export const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  REPORTED: "#338bff",
  AI_ANALYZING: "#8b5cf6",
  VERIFIED: "#06b6d4",
  ASSIGNED: "#f97316",
  ACKNOWLEDGED: "#eab308",
  IN_PROGRESS: "#22c55e",
  RESOLVED: "#10b981",
  CLOSED: "#6b7280",
  REJECTED: "#ef4444",
  REOPENED: "#f97316",
};

// Ward boundaries (simplified for Hyderabad)
export const WARDS = [
  { id: "ward-1", name: "Ward 1 - Abids", latitude: 17.395, longitude: 78.475 },
  { id: "ward-2", name: "Ward 2 - Secunderabad", latitude: 17.439, longitude: 78.498 },
  { id: "ward-3", name: "Ward 3 - Ameerpet", latitude: 17.413, longitude: 78.448 },
  { id: "ward-4", name: "Ward 4 - Jubilee Hills", latitude: 17.415, longitude: 78.434 },
  { id: "ward-5", name: "Ward 5 - Madhapur", latitude: 17.448, longitude: 78.391 },
  { id: "ward-6", name: "Ward 6 - Kukatpally", latitude: 17.484, longitude: 78.408 },
  { id: "ward-7", name: "Ward 7 - Dilsukhnagar", latitude: 17.368, longitude: 78.525 },
  { id: "ward-8", name: "Ward 8 - LB Nagar", latitude: 17.342, longitude: 78.551 },
  { id: "ward-9", name: "Ward 9 - Miyapur", latitude: 17.496, longitude: 78.357 },
  { id: "ward-10", name: "Ward 10 - Chandanagar", latitude: 17.509, longitude: 78.323 },
];
