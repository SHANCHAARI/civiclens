"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import {
  TrendingUp, BarChart3, MapPin, AlertTriangle, Clock,
  CheckCircle2, Activity, ArrowUpRight, ArrowDownRight, Eye,
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
      <AppLayout breadcrumbs={[{ label: "Civic Pulse" }]}>
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="h-8 w-48 skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 skeleton rounded-2xl" />
            ))}
          </div>
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const resolutionRate = stats?.totalIssues
    ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100)
    : 0;
  const openIssues = stats?.openIssues || 0;

  return (
    <AppLayout breadcrumbs={[{ label: "Civic Pulse" }]}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-civic)] mb-2 font-medium">
            Civic Intelligence
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display leading-tight">
            What is changing around your city?
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg">
            Real-time civic intelligence — every signal, every trend, every hotspot, in one view.
          </p>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-1 mb-10">
          {[
            { id: "7", label: "7 Days" },
            { id: "30", label: "30 Days" },
            { id: "90", label: "90 Days" },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                timeRange === range.id
                  ? "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Hero Metrics — Large, Generous */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              <Activity size={12} />
              Active Issues
            </div>
            <p className="text-4xl font-black font-mono text-[var(--text-primary)] mb-1">
              {openIssues}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              across {categories.length} categories
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              <CheckCircle2 size={12} />
              Resolution Rate
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black font-mono text-[var(--accent-civic)]">
                {resolutionRate}%
              </p>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {stats?.resolvedIssues || 0} resolved of {stats?.totalIssues || 0}
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              <Clock size={12} />
              Avg Resolution
            </div>
            <p className="text-4xl font-black font-mono text-[var(--text-primary)] mb-1">
              {stats?.avgResolutionDays || "—"}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">days average</p>
          </div>
        </div>

        {/* Trends — Full Width Visualization */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1 font-medium">
                Trend Analysis
              </p>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Reported vs Resolved
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

          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="space-y-2">
              {trends.map((trend) => (
                <div key={trend.date} className="flex items-center gap-3">
                  <span className="text-[10px] text-[var(--text-tertiary)] w-14 text-right shrink-0 font-mono">
                    {new Date(trend.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex-1 flex items-center gap-1.5">
                    <div
                      className="h-6 rounded-md bg-[var(--accent-civic)]/15 flex items-center min-w-[3px] transition-all duration-500"
                      style={{
                        width: `${(trend.reported / maxReported) * 85 + 2}%`,
                      }}
                    >
                      {trend.reported > 0 && (
                        <span className="text-[9px] text-[var(--accent-civic)] px-1.5 font-mono font-medium">
                          {trend.reported}
                        </span>
                      )}
                    </div>
                    <div
                      className="h-6 rounded-md bg-[var(--accent-civic)] flex items-center min-w-[3px] transition-all duration-500"
                      style={{
                        width: `${(trend.resolved / maxReported) * 85 + 2}%`,
                      }}
                    >
                      {trend.resolved > 0 && (
                        <span className="text-[9px] text-white px-1.5 font-mono font-medium">
                          {trend.resolved}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Distribution + Hotspots — Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Categories */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1 font-medium">
              Distribution
            </p>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              By Category
            </h2>

            <div className="space-y-4">
              {categories.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                  No data available yet.
                </p>
              ) : (
                (() => {
                  const maxCount = Math.max(...categories.map((c) => c.count), 1);
                  return categories.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-primary)] capitalize">
                          {cat.name}
                        </span>
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">
                          {cat.count}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
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
            </div>
          </div>

          {/* Hotspots */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1 font-medium">
              Geographic Intelligence
            </p>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              Issue Hotspots
            </h2>

            <div className="space-y-3">
              {hotspots.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                  No hotspots detected yet.
                </p>
              ) : (
                hotspots.slice(0, 8).map((hotspot, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          hotspot.avgSeverity === "CRITICAL"
                            ? "bg-[var(--accent-red-dim)] text-[var(--accent-red)]"
                            : hotspot.avgSeverity === "HIGH"
                            ? "bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]"
                            : "bg-[var(--accent-civic-dim)] text-[var(--accent-civic)]"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--text-primary)] font-mono">
                          {hotspot.latitude.toFixed(3)}, {hotspot.longitude.toFixed(3)}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          Avg severity: {hotspot.avgSeverity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-[var(--text-primary)]">
                        {hotspot.count}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">issues</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1 font-medium">
            Key Insights
          </p>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">
            What the data is telling us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Report Volume",
                value: `${stats?.totalIssues || 0}`,
                unit: "total issues",
                detail: "Across all categories and wards",
                icon: <BarChart3 size={14} />,
                color: "text-[var(--accent-civic)]",
              },
              {
                title: "Resolution Performance",
                value: `${stats?.avgResolutionDays || "—"}d`,
                unit: "average",
                detail: "Time from report to resolution",
                icon: <Clock size={14} />,
                color:
                  stats?.avgResolutionDays < 14
                    ? "text-[var(--accent-civic)]"
                    : "text-[var(--accent-amber)]",
              },
              {
                title: "Active Hotspots",
                value: `${hotspots.length}`,
                unit: "areas",
                detail: "With concentrated issue density",
                icon: <MapPin size={14} />,
                color:
                  hotspots.length > 5
                    ? "text-[var(--accent-red)]"
                    : "text-[var(--accent-amber)]",
              },
            ].map((insight) => (
              <div
                key={insight.title}
                className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
              >
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-3">
                  {insight.icon}
                  <span className="text-[10px] uppercase tracking-wider">
                    {insight.title}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-3xl font-black font-mono ${insight.color}`}>
                    {insight.value}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">{insight.unit}</span>
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)]">{insight.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
