"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  MapPin, Filter, Search, ChevronRight, ArrowUpRight, X,
  AlertTriangle, Clock, CheckCircle2, Users, Building2,
  TrendingUp, Eye, Compass, Layers, XCircle,
} from "lucide-react";
import { CATEGORY_CONFIG, SEVERITY_CONFIG, timeAgo } from "@/types";

const IssueMap = dynamic(() => import("@/components/map/IssueMap"), { ssr: false });

const CATEGORY_ICONS: Record<string, string> = {
  pothole: "🛣",
  "road-damage": "🛣",
  "broken-streetlight": "💡",
  "garbage-waste": "🗑",
  "water-leakage": "💧",
  "drainage-problem": "💧",
  "damaged-sidewalk": "🚶",
  "fallen-tree": "🌳",
  "traffic-signal-issue": "🚦",
  "illegal-dumping": "🗑",
  "public-infrastructure-damage": "🏗",
  other: "📋",
};

export default function DiscoverPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      issue.categorySlug.replace(/-/g, " ").includes(q) ||
      (issue.address && issue.address.toLowerCase().includes(q)) ||
      (issue.landmark && issue.landmark.toLowerCase().includes(q))
    );
  });

  const handleIssueClick = useCallback((issue: any) => {
    setSelectedIssue(issue);
  }, []);

  const categoryCounts = issues.reduce((acc: Record<string, number>, issue) => {
    acc[issue.categorySlug] = (acc[issue.categorySlug] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = issues.reduce((acc: Record<string, number>, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {});

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const highCount = issues.filter((i) => i.severity === "HIGH").length;

  return (
    <AppLayout breadcrumbs={[{ label: "Discover" }]}>
      <div className="h-[calc(100vh-5rem)] flex gap-0 -m-4 md:-m-6 overflow-hidden">
        {/* LEFT PANEL — Issue Discovery */}
        <div className="w-[300px] shrink-0 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-deep)] overflow-hidden hidden lg:flex">
          {/* Search */}
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-civic)]/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                Categories
              </span>
              <button
                onClick={() => setFilters((f) => ({ ...f, category: "" }))}
                className="text-[10px] text-[var(--accent-civic)] hover:underline"
              >
                All
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(CATEGORY_CONFIG)
                .filter(([slug]) => categoryCounts[slug])
                .sort((a, b) => (categoryCounts[b[0]] || 0) - (categoryCounts[a[0]] || 0))
                .map(([slug, config]) => (
                  <button
                    key={slug}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        category: f.category === slug ? "" : slug,
                      }))
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      filters.category === slug
                        ? "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)] border border-[var(--accent-civic)]/20"
                        : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border border-transparent"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[slug] || "📋"}</span>
                    <span>{config.name}</span>
                    <span className="opacity-50">{categoryCounts[slug]}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Severity / Status Quick Filters */}
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1 flex-wrap">
              {["", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilters((f) => ({ ...f, severity: sev }))}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                    filters.severity === sev
                      ? sev
                        ? `${SEVERITY_CONFIG[sev]?.bgColor}`
                        : "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {sev || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Issue List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 skeleton rounded-lg" />
                ))}
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <Compass size={28} className="text-[var(--text-tertiary)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  No signals here yet
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Be the first to report what you see
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push("/report")}
                >
                  Report an issue
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {filteredIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => handleIssueClick(issue)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedIssue?.id === issue.id
                        ? "bg-[var(--accent-civic-dim)]"
                        : "hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-1.5 h-8 rounded-full mt-0.5 shrink-0"
                        style={{
                          backgroundColor:
                            SEVERITY_CONFIG[issue.severity]?.color || "var(--text-tertiary)",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] truncate leading-tight">
                          {issue.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {CATEGORY_ICONS[issue.categorySlug] || "📋"}{" "}
                            {issue.categorySlug.replace(/-/g, " ")}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">·</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {timeAgo(issue.createdAt)}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">·</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {issue.reportCount} reports
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={12}
                        className="text-[var(--text-tertiary)] mt-1 shrink-0"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Stats Bar */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-deep)]">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
              <span>{filteredIssues.length} issues</span>
              <div className="flex items-center gap-3">
                {criticalCount > 0 && (
                  <span className="text-[var(--accent-red)]">
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="text-[var(--accent-amber)]">
                    {highCount} high
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER — Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-deep)]">
              <div className="text-center">
                <MapPin
                  size={28}
                  className="mx-auto text-[var(--text-tertiary)] animate-pulse"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  Loading map...
                </p>
              </div>
            </div>
          ) : (
            <IssueMap
              issues={filteredIssues}
              onIssueClick={handleIssueClick}
            />
          )}

          {/* Map Controls Overlay — top right */}
          <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`glass-elevated rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-all ${
                showFilters
                  ? "text-[var(--accent-civic)] border-[var(--accent-civic)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Layers size={13} />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>

          {/* Issue Count Badge — bottom left */}
          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="glass-elevated rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-civic)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {filteredIssues.length} signals
              </span>
            </div>
          </div>

          {/* Severity Legend — bottom right */}
          <div className="absolute bottom-4 right-4 z-[1000] hidden md:block">
            <div className="glass-elevated rounded-xl px-3 py-2">
              <div className="flex items-center gap-3">
                {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {config.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showFilters && (
            <div className="absolute top-16 left-4 right-4 z-[1000] lg:hidden">
              <div className="glass-elevated rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Filters
                  </span>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-[var(--text-tertiary)]"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {["", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setFilters((f) => ({ ...f, severity: sev }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        filters.severity === sev
                          ? sev
                            ? `${SEVERITY_CONFIG[sev]?.bgColor}`
                            : "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                      }`}
                    >
                      {sev || "All Severity"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Contextual Intelligence */}
        <div className="w-[280px] shrink-0 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-deep)] overflow-hidden hidden xl:flex">
          {selectedIssue ? (
            <>
              {/* Selected Issue Detail */}
              <div className="p-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                    Issue Detail
                  </span>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      selectedIssue.severity === "CRITICAL"
                        ? "danger"
                        : selectedIssue.severity === "HIGH"
                        ? "warning"
                        : selectedIssue.severity === "MEDIUM"
                        ? "info"
                        : "success"
                    }
                    size="sm"
                    dot
                  >
                    {selectedIssue.severity}
                  </Badge>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {selectedIssue.status.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 leading-tight">
                  {selectedIssue.title}
                </h3>

                <p className="text-xs text-[var(--text-tertiary)]">
                  {selectedIssue.categorySlug.replace(/-/g, " ")}
                </p>
              </div>

              {/* Intelligence Summary */}
              <div className="p-4 space-y-3 border-b border-[var(--border-subtle)]">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      Reports
                    </p>
                    <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                      {selectedIssue.reportCount}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)]">Priority</p>
                    <p
                      className={`text-lg font-bold font-mono ${
                        selectedIssue.priorityScore >= 80
                          ? "text-[var(--accent-red)]"
                          : selectedIssue.priorityScore >= 60
                          ? "text-[var(--accent-amber)]"
                          : "text-[var(--accent-civic)]"
                      }`}
                    >
                      {Math.round(selectedIssue.priorityScore)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      label: "First reported",
                      value: timeAgo(selectedIssue.createdAt),
                      icon: <Clock size={11} />,
                    },
                    {
                      label: "Reported by",
                      value: selectedIssue.authorName || "Citizen",
                      icon: <Users size={11} />,
                    },
                    {
                      label: "Ward",
                      value: selectedIssue.wardName || "Unknown",
                      icon: <MapPin size={11} />,
                    },
                    {
                      label: "Department",
                      value: selectedIssue.departmentName || "Unassigned",
                      icon: <Building2 size={11} />,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                        {item.icon}
                        {item.label}
                      </div>
                      <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Timeline Mini */}
              <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium mb-3">
                  Timeline
                </p>
                <div className="relative pl-4">
                  <div className="absolute left-[5px] top-0 bottom-0 w-px bg-[var(--border)]" />
                  {(selectedIssue.statusHistory || []).slice(-5).map((entry: any, i: number) => (
                    <div key={entry.id || i} className="relative mb-3">
                      <div
                        className={`absolute -left-4 top-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                          i === (selectedIssue.statusHistory || []).length - 1
                            ? "bg-[var(--accent-civic)] border-[var(--accent-civic)]"
                            : "bg-[var(--bg-deep)] border-[var(--border)]"
                        }`}
                      />
                      <div>
                        <p className="text-[11px] font-medium text-[var(--text-primary)] leading-tight">
                          {entry.toStatus.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          {timeAgo(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-[var(--border-subtle)]">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/issues/${selectedIssue.id}`)}
                >
                  <Eye size={13} /> View Full Issue
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Empty State — No issue selected */}
              <div className="p-4 border-b border-[var(--border-subtle)]">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                  Intelligence
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                  <Compass size={20} className="text-[var(--text-tertiary)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Select an issue
                </p>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  Click on any issue in the map or list to see its intelligence summary
                </p>
              </div>

              {/* City Overview Stats */}
              <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                  City Overview
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)]">Total</p>
                    <p className="text-lg font-bold font-mono text-[var(--text-primary)]">
                      {issues.length}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)]">Open</p>
                    <p className="text-lg font-bold font-mono text-[var(--accent-amber)]">
                      {
                        issues.filter(
                          (i) => !["CLOSED", "RESOLVED", "REJECTED", "MERGED"].includes(i.status)
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)]">Critical</p>
                    <p className="text-lg font-bold font-mono text-[var(--accent-red)]">
                      {criticalCount}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)]">Resolved</p>
                    <p className="text-lg font-bold font-mono text-[var(--accent-civic)]">
                      {issues.filter((i) => ["CLOSED", "RESOLVED"].includes(i.status)).length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
