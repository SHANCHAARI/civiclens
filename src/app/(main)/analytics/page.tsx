"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import MetricCard from "@/components/ui/MetricCard";
import Tabs from "@/components/ui/Tabs";
import {
  TrendingUp,
  BarChart3,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, trendsRes, catsRes, hotRes] = await Promise.all([
          fetch("/api/analytics?type=overview"),
          fetch(`/api/analytics?type=trends&days=${timeRange}`),
          fetch("/api/analytics?type=categories"),
          fetch("/api/analytics?type=hotspots"),
        ]);
        setStats(await statsRes.json());
        setTrends(await trendsRes.json());
        setCategories(await catsRes.json());
        setHotspots(await hotRes.json());
      } catch (e) {
        console.error("Failed to load analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  const maxReported = Math.max(...trends.map((t) => t.reported), 1);

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Analytics" }]}>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 skeleton rounded-2xl" />
            ))}
          </div>
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Analytics" }]}>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Civic Intelligence
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Data-driven insights for better urban governance.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Issues"
            value={stats?.totalIssues || 0}
            icon={<AlertTriangle size={20} />}
          />
          <MetricCard
            title="Resolution Rate"
            value={
              stats?.totalIssues
                ? `${Math.round((stats.resolvedIssues / stats.totalIssues) * 100)}%`
                : "0%"
            }
            icon={<CheckCircle2 size={20} />}
          />
          <MetricCard
            title="Avg Resolution Time"
            value={stats?.avgResolutionDays ? `${stats.avgResolutionDays} days` : "—"}
            icon={<Clock size={20} />}
          />
          <MetricCard
            title="Hotspot Areas"
            value={hotspots.length}
            icon={<MapPin size={20} />}
            subtitle="Areas with 3+ issues"
          />
        </div>

        {/* Time range selector */}
        <Tabs
          tabs={[
            { id: "7", label: "7 Days" },
            { id: "30", label: "30 Days" },
            { id: "90", label: "90 Days" },
          ]}
          activeTab={timeRange}
          onChange={setTimeRange}
          className="w-fit"
        />

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Activity size={18} className="text-[var(--accent)]" />
              Issue Trends
            </h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              Reported vs resolved over the selected period
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.map((trend) => (
                <div key={trend.date} className="flex items-center gap-3">
                  <span className="text-[10px] text-[var(--text-tertiary)] w-16 text-right shrink-0">
                    {new Date(trend.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex-1 flex items-center gap-1">
                    <div
                      className="h-5 rounded-md bg-[var(--accent)]/20 flex items-center min-w-[4px] transition-all duration-500"
                      style={{
                        width: `${(trend.reported / maxReported) * 80 + 2}%`,
                      }}
                    >
                      {trend.reported > 0 && (
                        <span className="text-[9px] text-[var(--accent)] px-1 font-medium">
                          {trend.reported}
                        </span>
                      )}
                    </div>
                    <div
                      className="h-5 rounded-md bg-green-500/20 flex items-center min-w-[4px] transition-all duration-500"
                      style={{
                        width: `${(trend.resolved / maxReported) * 80 + 2}%`,
                      }}
                    >
                      {trend.resolved > 0 && (
                        <span className="text-[9px] text-green-500 px-1 font-medium">
                          {trend.resolved}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[var(--accent)]/20" />
                <span className="text-xs text-[var(--text-tertiary)]">Reported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500/20" />
                <span className="text-xs text-[var(--text-tertiary)]">Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <BarChart3 size={18} className="text-[var(--accent)]" />
                Category Distribution
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                  No data available yet.
                </p>
              ) : (
                (() => {
                  const maxCount = Math.max(...categories.map((c) => c.count), 1);
                  return categories.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-primary)] capitalize">
                          {cat.name}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {cat.count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(cat.count / maxCount) * 100}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ));
                })()
              )}
            </CardContent>
          </Card>

          {/* Hotspots */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <MapPin size={18} className="text-red-400" />
                Issue Hotspots
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                Areas with concentrated issue density
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {hotspots.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                  No hotspots detected yet.
                </p>
              ) : (
                hotspots.slice(0, 8).map((hotspot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          hotspot.avgSeverity === "CRITICAL"
                            ? "bg-red-500/10 text-red-400"
                            : hotspot.avgSeverity === "HIGH"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--text-primary)]">
                          {hotspot.latitude.toFixed(3)}, {hotspot.longitude.toFixed(3)}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          Avg severity: {hotspot.avgSeverity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {hotspot.count}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">issues</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--accent)]" />
              Key Insights
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Report Volume",
                  value: `${stats?.totalIssues || 0} total issues`,
                  detail: "Across all categories and wards",
                  color: "text-[var(--accent)]",
                },
                {
                  title: "Resolution Performance",
                  value: `${stats?.avgResolutionDays || "—"} days average`,
                  detail: "Time from report to resolution",
                  color: stats?.avgResolutionDays < 14 ? "text-green-500" : "text-orange-400",
                },
                {
                  title: "Active Hotspots",
                  value: `${hotspots.length} areas`,
                  detail: "With 3+ concentrated issues",
                  color: hotspots.length > 5 ? "text-red-400" : "text-yellow-400",
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50 space-y-1"
                >
                  <p className="text-xs text-[var(--text-tertiary)]">{insight.title}</p>
                  <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{insight.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
