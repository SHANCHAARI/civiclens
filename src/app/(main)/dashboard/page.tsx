"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  AlertTriangle, CheckCircle2, MapPin, TrendingUp, ArrowRight,
  Clock, Users, Eye, Trophy, Compass, ArrowUpRight,
} from "lucide-react";
import { timeAgo, SEVERITY_CONFIG } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, i] = await Promise.all([
          fetch("/api/analytics?type=overview"),
          fetch("/api/issues?limit=8"),
        ]);
        setStats(await s.json());
        const data = await i.json();
        setIssues(data.issues || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const userName = ((session?.user as any)?.name || "Citizen").split(" ")[0];

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Discover" }]}>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-48 skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
          </div>
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={[{ label: "Discover" }]}>
      <div className="space-y-8 max-w-[1200px]">
        {/* Welcome */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-1">Overview</p>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Welcome back, {userName}
          </h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Reports", value: stats?.totalIssues || 0, icon: <AlertTriangle size={14} /> },
            { label: "Open Issues", value: stats?.openIssues || 0, icon: <Clock size={14} /> },
            { label: "Resolved", value: stats?.resolvedIssues || 0, icon: <CheckCircle2 size={14} /> },
            { label: "Critical", value: stats?.criticalIssues || 0, icon: <AlertTriangle size={14} />, color: "text-[var(--accent-red)]" },
          ].map((m) => (
            <div key={m.label} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-2">
                {m.icon}
                <span className="text-[10px] uppercase tracking-wider">{m.label}</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${m.color || "text-[var(--text-primary)]"}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { href: "/report", label: "Report Issue", desc: "Capture evidence", icon: <AlertTriangle size={16} />, color: "text-[var(--accent-civic)]" },
            { href: "/map", label: "Explore Map", desc: "See your area", icon: <MapPin size={16} />, color: "text-[var(--accent-blue)]" },
            { href: "/analytics", label: "Insights", desc: "Civic intelligence", icon: <TrendingUp size={16} />, color: "text-[var(--accent-amber)]" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-200 cursor-pointer group flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-[var(--bg-elevated)] ${action.color}`}>{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{action.label}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">{action.desc}</p>
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent issues */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-0.5">Recent Activity</p>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Latest signals</h2>
            </div>
            <Link href="/map" className="text-[11px] text-[var(--accent-civic)] hover:underline">View all →</Link>
          </div>

          <div className="space-y-px rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            {issues.length === 0 ? (
              <div className="p-8 text-center bg-[var(--bg-secondary)]">
                <MapPin size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No signals yet. Be the first to report.</p>
              </div>
            ) : (
              issues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <div
                    className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: SEVERITY_CONFIG[issue.severity]?.color || "var(--text-tertiary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{issue.title}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {issue.categorySlug.replace(/-/g, " ")} · {timeAgo(issue.createdAt)}
                    </p>
                  </div>
                  <Badge variant={issue.severity === "CRITICAL" ? "danger" : issue.severity === "HIGH" ? "warning" : "info"} size="sm">
                    {issue.severity}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-3">Achievements</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { title: "First Report", earned: true },
              { title: "Evidence Collector", earned: (stats?.totalIssues || 0) >= 5 },
              { title: "Community Watcher", earned: false },
              { title: "Civic Champion", earned: (stats?.resolvedIssues || 0) >= 20 },
            ].map((a) => (
              <div
                key={a.title}
                className={`px-3 py-2 rounded-lg text-[11px] font-medium border transition-all ${
                  a.earned
                    ? "border-[var(--accent-amber)]/30 bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]"
                    : "border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-40"
                }`}
              >
                {a.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
