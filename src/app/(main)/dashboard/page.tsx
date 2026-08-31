"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import MetricCard from "@/components/ui/MetricCard";
import Button from "@/components/ui/Button";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  TrendingUp,
  ArrowRight,
  Clock,
  Users,
  Eye,
  Trophy,
} from "lucide-react";
import { timeAgo, truncate, SEVERITY_CONFIG, STATUS_CONFIG } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, issuesRes] = await Promise.all([
          fetch("/api/analytics?type=overview"),
          fetch("/api/issues?limit=10"),
        ]);
        setStats(await statsRes.json());
        const data = await issuesRes.json();
        setIssues(data.issues || []);
      } catch (e) {
        console.error("Failed to load dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userName = (session?.user as any)?.name || "Citizen";
  const firstName = userName.split(" ")[0];

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Dashboard" }]}>
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
    <AppLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6 max-w-7xl">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your city, one signal at a time.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Reports"
            value={stats?.totalIssues || 0}
            icon={<AlertTriangle size={20} />}
            subtitle="All time"
          />
          <MetricCard
            title="Open Issues"
            value={stats?.openIssues || 0}
            icon={<Clock size={20} />}
            subtitle="Awaiting resolution"
            trend="up"
            trendValue="+3 this week"
          />
          <MetricCard
            title="Resolved"
            value={stats?.resolvedIssues || 0}
            icon={<CheckCircle2 size={20} />}
            subtitle="Issues fixed"
            trend="up"
            trendValue={`avg ${stats?.avgResolutionDays || "—"} days`}
          />
          <MetricCard
            title="Critical"
            value={stats?.criticalIssues || 0}
            icon={<AlertTriangle size={20} />}
            subtitle="Need immediate attention"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/report">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Report Issue</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Capture and submit evidence</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-[var(--text-tertiary)]" />
              </div>
            </Card>
          </Link>
          <Link href="/map">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Explore Map</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">See issues in your area</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-[var(--text-tertiary)]" />
              </div>
            </Card>
          </Link>
          <Link href="/analytics">
            <Card hover className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Analytics</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Civic intelligence insights</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-[var(--text-tertiary)]" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Issues</h2>
            <Link href="/map">
              <Button variant="ghost" size="sm">
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {issues.length === 0 ? (
                <div className="p-8 text-center">
                  <MapPin size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    No civic issues reported yet. Be the first!
                  </p>
                </div>
              ) : (
                issues.map((issue) => (
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
                        {issue.categorySlug.replace(/-/g, " ")} • {timeAgo(issue.createdAt)}
                      </p>
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
                    <Badge
                      variant={
                        ["RESOLVED", "CLOSED"].includes(issue.status)
                          ? "success"
                          : ["IN_PROGRESS", "ASSIGNED"].includes(issue.status)
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {issue.status.replace(/_/g, " ")}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              Civic Achievements
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  title: "First Report",
                  desc: "Submitted your first issue",
                  icon: <AlertTriangle size={16} />,
                  earned: true,
                },
                {
                  title: "Evidence Collector",
                  desc: "Uploaded 5+ evidence photos",
                  icon: <Eye size={16} />,
                  earned: stats?.totalIssues >= 5,
                },
                {
                  title: "Community Watcher",
                  desc: "Supported 10+ issues",
                  icon: <Users size={16} />,
                  earned: false,
                },
                {
                  title: "Civic Champion",
                  desc: "20+ resolved reports",
                  icon: <Trophy size={16} />,
                  earned: stats?.resolvedIssues >= 20,
                },
              ].map((achievement, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border transition-all ${
                    achievement.earned
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-[var(--border)] opacity-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      achievement.earned
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">
                    {achievement.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {achievement.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
