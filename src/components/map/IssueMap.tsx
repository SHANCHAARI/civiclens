"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/types";

function createDivIcon(color: string, size = 24) {
  if (typeof window === "undefined") return undefined;
  // @ts-ignore
  const L = window.L || require("leaflet");
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50% 50% 50% 0;
      background: ${color};
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "><div style="
      width: ${size - 8}px;
      height: ${size - 8}px;
      margin: 3px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
    "></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

interface IssueMapProps {
  issues: any[];
  onIssueClick?: (issue: any) => void;
}

export default function IssueMap({ issues, onIssueClick }: IssueMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)] rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-[var(--text-tertiary)]">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[17.385, 78.4867]}
      zoom={12}
      className="w-full h-full rounded-2xl"
      style={{ background: "var(--bg-tertiary)", zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map((issue) => {
        const icon = createDivIcon(SEVERITY_COLORS[issue.severity] || "#6b7280");
        if (!icon) return null;
        return (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onIssueClick?.(issue),
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    issue.severity === "CRITICAL" ? "bg-red-100 text-red-700" :
                    issue.severity === "HIGH" ? "bg-orange-100 text-orange-700" :
                    issue.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {issue.severity}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {issue.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {issue.title}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {issue.categorySlug?.replace(/-/g, " ")} • {issue.reportCount}{" "}
                  reports • {timeAgo(issue.createdAt)}
                </p>
                <a
                  href={`/issues/${issue.id}`}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  View Issue →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
