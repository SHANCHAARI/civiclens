"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { MapPin, Filter } from "lucide-react";
import { CATEGORY_CONFIG, SEVERITY_CONFIG, timeAgo } from "@/types";

const IssueMap = dynamic(() => import("@/components/map/IssueMap"), { ssr: false });

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function MapPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    category: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (filters.severity) params.set("severity", filters.severity);
        if (filters.status) params.set("status", filters.status);
        if (filters.category) params.set("category", filters.category);
        params.set("limit", "200");

        const res = await fetch(`/api/issues?${params}`);
        const data = await res.json();
        setIssues(data.issues || []);
      } catch (e) {
        console.error("Failed to load issues:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  return (
    <AppLayout breadcrumbs={[{ label: "Civic Map" }]}>
      <div className="h-[calc(100vh-7rem)] flex gap-4">
        {/* Sidebar */}
        <div className="w-80 shrink-0 space-y-4 overflow-y-auto hidden lg:block">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Civic Map</h1>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {issues.length} issues across the city
            </p>
          </div>

          {/* Filters */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Filter size={14} /> Filters
              </h3>
              {(filters.severity || filters.status || filters.category) && (
                <button
                  onClick={() => setFilters({ severity: "", status: "", category: "" })}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-tertiary)]">Severity</label>
              <div className="flex flex-wrap gap-1">
                {["", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilters((f) => ({ ...f, severity: sev }))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      filters.severity === sev
                        ? sev
                          ? `${SEVERITY_CONFIG[sev]?.bgColor || "bg-gray-500/10"}`
                          : "bg-[var(--accent-subtle)] text-[var(--accent)]"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    {sev || "All"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-tertiary)]">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="w-full h-8 px-2 rounded-lg text-xs bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)]"
              >
                <option value="">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-tertiary)]">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                className="w-full h-8 px-2 rounded-lg text-xs bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)]"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_CONFIG).map(([slug, config]) => (
                  <option key={slug} value={slug}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Legend</h3>
            <div className="space-y-2">
              {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs text-[var(--text-secondary)]">{config.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Issues List */}
          <Card>
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Issues</h3>
              {issues.slice(0, 15).map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => router.push(`/issues/${issue.id}`)}
                  className="w-full text-left p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SEVERITY_COLORS[issue.severity] }}
                    />
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {issue.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-4">
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {issue.categorySlug.replace(/-/g, " ")}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">•</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {timeAgo(issue.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--border)] relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-tertiary)]">
              <div className="text-center">
                <MapPin size={32} className="mx-auto text-[var(--text-tertiary)] animate-pulse" />
                <p className="text-sm text-[var(--text-tertiary)] mt-2">Loading map...</p>
              </div>
            </div>
          ) : (
            <IssueMap
              issues={issues}
              onIssueClick={(issue) => router.push(`/issues/${issue.id}`)}
            />
          )}

          {/* Issue count badge */}
          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="glass rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-primary)]">
              <MapPin size={12} className="inline mr-1" />
              {issues.length} issues
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
