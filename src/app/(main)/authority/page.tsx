"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MetricCard from "@/components/ui/MetricCard";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  MapPin,
  Building2,
  Users,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  timeAgo,
  daysSince,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  CATEGORY_CONFIG,
} from "@/types";

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

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Authority Dashboard" }]}>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 skeleton" />
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
    <AppLayout breadcrumbs={[{ label: "Authority Dashboard" }]}>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Operations Center
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Real-time issue management and department oversight.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Open Issues"
            value={stats?.openIssues || 0}
            icon={<Clock size={20} />}
            subtitle="Awaiting action"
          />
          <MetricCard
            title="Critical Issues"
            value={criticalIssues.length}
            icon={<AlertTriangle size={20} />}
            subtitle="Immediate attention needed"
            trend="down"
            trendValue="-2 from last week"
          />
          <MetricCard
            title="In Progress"
            value={inProgressIssues.length}
            icon={<RefreshCw size={20} />}
            subtitle="Being worked on"
          />
          <MetricCard
            title="Avg Resolution"
            value={stats?.avgResolutionDays ? `${stats.avgResolutionDays}d` : "—"}
            icon={<TrendingUp size={20} />}
            subtitle="Average days to resolve"
            trend={stats?.avgResolutionDays < 14 ? "up" : "down"}
            trendValue="target: 14 days"
          />
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: "queue", label: "Priority Queue", count: pendingIssues.length },
            { id: "progress", label: "In Progress", count: inProgressIssues.length },
            { id: "departments", label: "Departments" },
            { id: "trends", label: "Trends" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Priority Queue */}
        {activeTab === "queue" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Priority Queue
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Issues sorted by priority score — highest first
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {pendingIssues.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-green-500 mb-3" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      No pending issues. All caught up!
                    </p>
                  </div>
                ) : (
                  pendingIssues
                    .sort((a, b) => b.priorityScore - a.priorityScore)
                    .map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <div
                          className={`text-lg font-bold w-12 text-center ${
                            issue.priorityScore >= 80
                              ? "text-red-400"
                              : issue.priorityScore >= 60
                              ? "text-orange-400"
                              : issue.priorityScore >= 40
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {Math.round(issue.priorityScore)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {issue.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {issue.categorySlug.replace(/-/g, " ")}
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)]">•</span>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {timeAgo(issue.createdAt)}
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)]">•</span>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {issue.reportCount} reports
                            </span>
                          </div>
                        </div>
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
                        <ArrowRight size={14} className="text-[var(--text-tertiary)]" />
                      </Link>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress */}
        {activeTab === "progress" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                In Progress
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {inProgressIssues.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[var(--text-secondary)]">
                      No issues in progress.
                    </p>
                  </div>
                ) : (
                  inProgressIssues.map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            SEVERITY_CONFIG[issue.severity]?.color || "#6b7280",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {issue.title}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {issue.status.replace(/_/g, " ")} • {daysSince(issue.createdAt)}d
                          open
                        </p>
                      </div>
                      <Badge variant="warning" size="sm">
                        {issue.status.replace(/_/g, " ")}
                      </Badge>
                      <ArrowRight size={14} className="text-[var(--text-tertiary)]" />
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Departments */}
        {activeTab === "departments" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Department Performance
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {deptStats.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                  No department data available.
                </p>
              ) : (
                deptStats.map((dept: any) => (
                  <div
                    key={dept.name}
                    className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-[var(--accent)]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {dept.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        <span>{dept.open} open</span>
                        <span>{dept.resolved} resolved</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            dept.total > 0
                              ? (dept.resolved / dept.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {dept.total > 0
                        ? `${Math.round((dept.resolved / dept.total) * 100)}% resolution rate`
                        : "No data"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Trends */}
        {activeTab === "trends" && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                7-Day Trend
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trends.map((trend: any) => (
                  <div
                    key={trend.date}
                    className="flex items-center gap-4 py-2"
                  >
                    <span className="text-xs text-[var(--text-tertiary)] w-20">
                      {new Date(trend.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div
                        className="h-4 rounded bg-blue-500/20 flex items-center"
                        style={{
                          width: `${Math.max(4, trend.reported * 20)}%`,
                        }}
                      >
                        <span className="text-[10px] text-blue-400 px-1">
                          {trend.reported}
                        </span>
                      </div>
                      <div
                        className="h-4 rounded bg-green-500/20 flex items-center"
                        style={{
                          width: `${Math.max(4, trend.resolved * 20)}%`,
                        }}
                      >
                        <span className="text-[10px] text-green-400 px-1">
                          {trend.resolved}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500/20" />
                  <span className="text-xs text-[var(--text-tertiary)]">Reported</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500/20" />
                  <span className="text-xs text-[var(--text-tertiary)]">Resolved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
