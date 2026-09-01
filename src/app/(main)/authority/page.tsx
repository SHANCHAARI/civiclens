"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  AlertTriangle, Clock, CheckCircle2, TrendingUp, ArrowRight,
  MapPin, Building2, Users, BarChart3, RefreshCw, Eye, Circle,
  ArrowUpRight, ArrowDownRight, Zap, Activity,
} from "lucide-react";
import { timeAgo, daysSince, SEVERITY_CONFIG, CATEGORY_CONFIG } from "@/types";

export default function AuthorityDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, issuesRes, deptRes, trendsRes] = await Promise.all([
          fetch("/api/analytics?type=overview"),
          fetch("/api/issues?limit=50"),
          fetch("/api/analytics?type=departments"),
          fetch("/api/analytics?type=trends&days=7"),
        ]);
        setStats(await statsRes.json());
        const data = await issuesRes.json();
        setIssues(data.issues || []);
        setDeptStats(await deptRes.json());
        setTrends(await trendsRes.json());
      } catch (e) {
        console.error("Failed to load authority dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingIssues = issues.filter((i) =>
    ["REPORTED", "AI_ANALYZING", "VERIFIED"].includes(i.status)
  );
  const inProgressIssues = issues.filter((i) =>
    ["ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS"].includes(i.status)
  );
  const criticalIssues = issues.filter(
    (i) => i.severity === "CRITICAL" && !["CLOSED", "REJECTED", "MERGED"].includes(i.status)
  );
  const resolvedCount = issues.filter((i) => ["RESOLVED", "CLOSED"].includes(i.status)).length;

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Operations" }]}>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-8 w-48 skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 skeleton rounded-2xl" />
            ))}
          </div>
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Operations" }]}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-amber)] mb-2 font-medium">
              Operations Center
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display leading-tight">
              Real-time issue management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-civic-dim)] text-[var(--accent-civic)] text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-civic)] animate-pulse" />
              Live
            </div>
          </div>
        </div>

        {/* Metrics — Command Center Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {[
            { label: "Open", value: stats?.openIssues || 0, icon: <Clock size={14} />, color: "text-[var(--accent-amber)]" },
            { label: "Critical", value: criticalIssues.length, icon: <Zap size={14} />, color: "text-[var(--accent-red)]" },
            { label: "In Progress", value: inProgressIssues.length, icon: <RefreshCw size={14} />, color: "text-[var(--accent-blue)]" },
            { label: "Pending", value: pendingIssues.length, icon: <AlertTriangle size={14} />, color: "text-[var(--accent-amber)]" },
            { label: "Resolved", value: resolvedCount, icon: <CheckCircle2 size={14} />, color: "text-[var(--accent-civic)]" },
            { label: "Avg Time", value: stats?.avgResolutionDays ? `${stats.avgResolutionDays}d` : "—", icon: <TrendingUp size={14} />, color: "text-[var(--text-secondary)]" },
          ].map((m) => (
            <div
              key={m.label}
              className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
            >
              <div className={`flex items-center gap-1.5 mb-2 ${m.color}`}>
                {m.icon}
                <span className="text-[10px] uppercase tracking-wider font-medium">
                  {m.label}
                </span>
              </div>
              <p className={`text-2xl font-black font-mono ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mb-6 border-b border-[var(--border-subtle)]">
          {[
            { id: "queue", label: "Priority Queue", count: pendingIssues.length },
            { id: "progress", label: "In Progress", count: inProgressIssues.length },
            { id: "departments", label: "Departments" },
            { id: "trends", label: "7-Day Trends" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[var(--accent-civic)] text-[var(--accent-civic)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-[10px] opacity-60">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Priority Queue */}
        {activeTab === "queue" && (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
            {pendingIssues.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 size={32} className="mx-auto text-[var(--accent-civic)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  All clear — no pending issues
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {pendingIssues
                  .sort((a, b) => b.priorityScore - a.priorityScore)
                  .map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      {/* Priority Score */}
                      <div
                        className={`text-lg font-black font-mono w-12 text-center shrink-0 ${
                          issue.priorityScore >= 80
                            ? "text-[var(--accent-red)]"
                            : issue.priorityScore >= 60
                            ? "text-[var(--accent-amber)]"
                            : issue.priorityScore >= 40
                            ? "text-[var(--severity-medium)]"
                            : "text-[var(--accent-civic)]"
                        }`}
                      >
                        {Math.round(issue.priorityScore)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {issue.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[var(--text-tertiary)] capitalize">
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

                      {/* Severity */}
                      <Badge
                        variant={
                          issue.severity === "CRITICAL"
                            ? "danger"
                            : issue.severity === "HIGH"
                            ? "warning"
                            : issue.severity === "MEDIUM"
                            ? "info"
                            : "success"
                        }
                        size="sm"
                      >
                        {issue.severity}
                      </Badge>

                      <ArrowRight
                        size={14}
                        className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0"
                      />
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* In Progress */}
        {activeTab === "progress" && (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
            {inProgressIssues.length === 0 ? (
              <div className="p-12 text-center">
                <Activity size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  No issues currently in progress
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {inProgressIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-elevated)] transition-colors group"
                  >
                    <div className="w-1.5 h-10 rounded-full bg-[var(--accent-blue)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {issue.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--text-tertiary)] capitalize">
                          {issue.status.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">·</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">
                          {issue.departmentName || "Unassigned"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        issue.severity === "CRITICAL"
                          ? "danger"
                          : issue.severity === "HIGH"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {issue.severity}
                    </Badge>
                    <ArrowRight size={14} className="text-[var(--text-tertiary)] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Departments */}
        {activeTab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptStats.length === 0 ? (
              <div className="col-span-2 p-12 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <Building2 size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  No department data available
                </p>
              </div>
            ) : (
              deptStats.map((dept: any) => (
                <div
                  key={dept.name || "Unknown"}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={14} className="text-[var(--accent-civic)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {dept.name || "Unassigned"}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Open</p>
                      <p className="text-lg font-bold font-mono text-[var(--accent-amber)]">
                        {dept.openCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Resolved</p>
                      <p className="text-lg font-bold font-mono text-[var(--accent-civic)]">
                        {dept.resolvedCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Avg Days</p>
                      <p className="text-lg font-bold font-mono text-[var(--text-secondary)]">
                        {dept.avgDays || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 7-Day Trends */}
        {activeTab === "trends" && (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1 font-medium">
                  Last 7 Days
                </p>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Daily Activity
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[var(--accent-civic)]/30" />
                  <span className="text-[10px] text-[var(--text-tertiary)]">Reported</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[var(--accent-civic)]" />
                  <span className="text-[10px] text-[var(--text-tertiary)]">Resolved</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {trends.map((trend) => {
                const maxVal = Math.max(...trends.map((t) => Math.max(t.reported, t.resolved)), 1);
                return (
                  <div key={trend.date} className="flex items-center gap-3">
                    <span className="text-[10px] text-[var(--text-tertiary)] w-14 text-right shrink-0 font-mono">
                      {new Date(trend.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <div
                        className="h-6 rounded-md bg-[var(--accent-civic)]/15 flex items-center min-w-[3px]"
                        style={{ width: `${(trend.reported / maxVal) * 85 + 2}%` }}
                      >
                        {trend.reported > 0 && (
                          <span className="text-[9px] text-[var(--accent-civic)] px-1.5 font-mono">
                            {trend.reported}
                          </span>
                        )}
                      </div>
                      <div
                        className="h-6 rounded-md bg-[var(--accent-civic)] flex items-center min-w-[3px]"
                        style={{ width: `${(trend.resolved / maxVal) * 85 + 2}%` }}
                      >
                        {trend.resolved > 0 && (
                          <span className="text-[9px] text-white px-1.5 font-mono">
                            {trend.resolved}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
