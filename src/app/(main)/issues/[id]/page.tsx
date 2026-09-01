"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import {
  MapPin, Clock, Brain, Users, CheckCircle2, XCircle,
  AlertTriangle, ArrowRight, Building2, Calendar, TrendingUp,
  MessageSquare, RefreshCw, Share2, FileText, ChevronLeft,
  Camera, Eye, ArrowUpRight, Circle,
} from "lucide-react";
import {
  timeAgo, formatDate, formatDateTime, daysSince,
  SEVERITY_CONFIG, STATUS_CONFIG, STATUS_FLOW,
} from "@/types";

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

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [supporting, setSupporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (res.ok) setIssue(await res.json());
      } catch (e) {
        console.error("Failed to load issue:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleVerify = async (verified: boolean) => {
    try {
      await fetch(`/api/issues/${params.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified, note: verifyNote }),
      });
      setShowVerifyModal(false);
      setVerifyNote("");
      const res = await fetch(`/api/issues/${params.id}`);
      setIssue(await res.json());
      setToast({
        message: verified ? "Resolution confirmed" : "Issue reopened",
        type: verified ? "success" : "info",
      });
    } catch (e) {
      setToast({ message: "Failed to verify", type: "error" });
    }
  };

  const handleSupport = async () => {
    setSupporting(true);
    try {
      await fetch(`/api/issues/${params.id}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await fetch(`/api/issues/${params.id}`);
      setIssue(await res.json());
      setToast({ message: "Support added", type: "success" });
    } catch (e) {
      setToast({ message: "Failed", type: "error" });
    } finally {
      setSupporting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/issues/${params.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const res = await fetch(`/api/issues/${params.id}`);
      setIssue(await res.json());
      setToast({ message: `Status updated to ${newStatus.replace(/_/g, " ")}`, type: "success" });
    } catch (e) {
      setToast({ message: "Failed to update", type: "error" });
    }
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Issues" }, { label: "Loading..." }]}>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-6 w-32 skeleton" />
          <div className="h-4 w-80 skeleton" />
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout breadcrumbs={[{ label: "Issues" }]}>
        <div className="max-w-5xl mx-auto text-center py-20">
          <AlertTriangle size={40} className="mx-auto text-[var(--text-tertiary)] mb-4" />
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Signal not found
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            This issue may have been removed or the ID is incorrect.
          </p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => router.push("/map")}>
            <ChevronLeft size={14} /> Back to Discover
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusIndex = STATUS_FLOW.indexOf(issue.status);
  const validNextStatuses: Record<string, string[]> = {
    REPORTED: ["AI_ANALYZING", "VERIFIED"],
    VERIFIED: ["ASSIGNED"],
    ASSIGNED: ["ACKNOWLEDGED"],
    ACKNOWLEDGED: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: ["CITIZEN_VERIFICATION", "CLOSED"],
    CITIZEN_VERIFICATION: ["CLOSED", "REOPENED"],
    REOPENED: ["ASSIGNED"],
  };
  const nextStatuses = validNextStatuses[issue.status] || [];

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Discover", href: "/map" },
        { label: issue.title },
      ]}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass-elevated text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "text-[var(--accent-civic)]"
              : toast.type === "error"
              ? "text-[var(--accent-red)]"
              : "text-[var(--accent-blue)]"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors mb-6"
        >
          <ChevronLeft size={12} /> Back to Discover
        </Link>

        {/* HEADER — Spatial Drawer Style */}
        <div className="mb-8">
          {/* Category + Status Row */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{CATEGORY_ICONS[issue.categorySlug] || "📋"}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
              {issue.categoryName}
            </span>
            <span className="text-[var(--text-tertiary)]">·</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {issue.wardName || "City"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight mb-3 font-display">
            {issue.title}
          </h1>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3">
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
              size="md"
              dot
            >
              {issue.severity}
            </Badge>
            <Badge variant="default" size="md">
              {issue.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-[var(--text-tertiary)]">
              Reported {timeAgo(issue.createdAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* PRIORITY SCORE — Large Visual */}
            <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] mb-1">
                    Priority Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-black font-mono ${
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
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">/100</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {issue.priorityScore >= 80
                      ? "Critical — immediate attention required"
                      : issue.priorityScore >= 60
                      ? "High priority — should be addressed soon"
                      : issue.priorityScore >= 40
                      ? "Medium priority — scheduled attention"
                      : "Low priority — monitor and schedule"}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                    <Users size={12} />
                    <span>{issue.reportCount} supporting reports</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                    <Clock size={12} />
                    <span>{daysSince(issue.createdAt)} days open</span>
                  </div>
                </div>
              </div>
              {/* Priority Bar */}
              <div className="mt-4 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${issue.priorityScore}%`,
                    backgroundColor:
                      issue.priorityScore >= 80
                        ? "var(--accent-red)"
                        : issue.priorityScore >= 60
                        ? "var(--accent-amber)"
                        : issue.priorityScore >= 40
                        ? "var(--severity-medium)"
                        : "var(--accent-civic)",
                  }}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                Description
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {issue.description}
              </p>
            </div>

            {/* AI ANALYSIS — Civic Intelligence */}
            {issue.aiConfidence && (
              <div className="space-y-3">
                <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium flex items-center gap-2">
                  <Brain size={12} className="text-[var(--accent-blue)]" />
                  Civic Intelligence
                </h2>
                <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                      <p className="text-[10px] text-[var(--text-tertiary)] mb-1">
                        Classification
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {issue.aiCategory}
                      </p>
                      <p className="text-[10px] text-[var(--accent-civic)]">
                        {Math.round(issue.aiConfidence * 100)}% confidence
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                      <p className="text-[10px] text-[var(--text-tertiary)] mb-1">
                        Severity Assessment
                      </p>
                      <Badge
                        variant={
                          issue.aiSeverity === "CRITICAL"
                            ? "danger"
                            : issue.aiSeverity === "HIGH"
                            ? "warning"
                            : "info"
                        }
                        size="md"
                      >
                        {issue.aiSeverity}
                      </Badge>
                    </div>
                  </div>
                  {issue.aiDescription && (
                    <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                      <p className="text-[10px] text-[var(--text-tertiary)] mb-1">
                        Assessment
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {issue.aiDescription}
                      </p>
                    </div>
                  )}
                  {issue.aiObservations && (
                    <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                      <p className="text-[10px] text-[var(--text-tertiary)] mb-2">
                        Observations
                      </p>
                      <ul className="space-y-1">
                        {JSON.parse(issue.aiObservations).map(
                          (obs: string, i: number) => (
                            <li
                              key={i}
                              className="text-xs text-[var(--text-secondary)] flex items-start gap-2"
                            >
                              <span className="text-[var(--accent-civic)] mt-0.5">·</span>
                              {obs}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {issue.aiReasoning && (
                    <div className="p-3 rounded-xl bg-[var(--accent-blue-dim)] border border-[var(--accent-blue)]/10">
                      <p className="text-[10px] text-[var(--accent-blue)] mb-1">
                        Reasoning
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {issue.aiReasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESOLUTION TIMELINE — Beautiful Vertical */}
            <div className="space-y-3">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium flex items-center gap-2">
                <Clock size={12} className="text-[var(--accent-civic)]" />
                Resolution Timeline
              </h2>
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="relative">
                  {/* Full progress track */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border)]" />
                  {/* Filled progress */}
                  <div
                    className="absolute left-[15px] top-2 w-px bg-[var(--accent-civic)] transition-all duration-700"
                    style={{
                      height: `${Math.max(
                        0,
                        (statusIndex / (STATUS_FLOW.length - 1)) * 100
                      )}%`,
                    }}
                  />

                  <div className="space-y-4">
                    {issue.statusHistory.map((entry: any, i: number) => {
                      const isLatest = i === issue.statusHistory.length - 1;
                      const isPast = i < issue.statusHistory.length - 1;
                      return (
                        <div key={entry.id} className="flex items-start gap-4 relative">
                          {/* Node */}
                          <div className="relative z-10">
                            {isLatest ? (
                              <div className="w-[30px] h-[30px] rounded-full bg-[var(--accent-civic)] flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-white" />
                              </div>
                            ) : (
                              <div className="w-[30px] h-[30px] rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--border)] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 pt-0.5">
                            <p
                              className={`text-sm font-medium ${
                                isLatest
                                  ? "text-[var(--text-primary)]"
                                  : "text-[var(--text-secondary)]"
                              }`}
                            >
                              {entry.toStatus.replace(/_/g, " ")}
                            </p>
                            <p className="text-[11px] text-[var(--text-tertiary)]">
                              {entry.changedByName} · {formatDateTime(entry.createdAt)}
                            </p>
                            {entry.note && (
                              <p className="text-xs text-[var(--text-secondary)] mt-1 italic">
                                "{entry.note}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* COMMUNITY EVIDENCE */}
            <div className="space-y-3">
              <h2 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium flex items-center gap-2">
                <Users size={12} className="text-[var(--accent-amber)]" />
                Community ({issue.reportCount} supporters)
              </h2>

              {/* Verifications */}
              {issue.verifications.length > 0 && (
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
                  {issue.verifications.map((v: any) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-elevated)]"
                    >
                      {v.verified ? (
                        <CheckCircle2 size={14} className="text-[var(--accent-civic)] shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-[var(--accent-red)] shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {v.userName}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {" "}
                          {v.verified ? "confirmed fixed" : "reported still exists"}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {timeAgo(v.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Comments / Additional Evidence */}
              {issue.comments && issue.comments.length > 0 && (
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                    Comments
                  </p>
                  {issue.comments.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--text-primary)]">
                          {c.userName}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Support Button */}
              {userRole === "CITIZEN" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSupport}
                  loading={supporting}
                >
                  <Users size={13} /> Support This Issue
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT — Sidebar Intelligence */}
          <div className="space-y-6">
            {/* LOCATION */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium flex items-center gap-2">
                <MapPin size={12} className="text-[var(--accent-civic)]" />
                Location
              </h3>
              <div className="h-36 rounded-xl overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={20} className="mx-auto text-[var(--accent-civic)] mb-1" />
                  <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
                    {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              {issue.address && (
                <p className="text-xs text-[var(--text-secondary)]">{issue.address}</p>
              )}
              {issue.landmark && (
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  Near: {issue.landmark}
                </p>
              )}
              {issue.wardName && (
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  Ward: {issue.wardName}
                </p>
              )}
            </div>

            {/* DETAILS */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
                Details
              </h3>
              {[
                { label: "Department", value: issue.departmentName || "Unassigned", icon: <Building2 size={11} /> },
                { label: "Reported", value: formatDate(issue.createdAt), icon: <Calendar size={11} /> },
                { label: "Last Update", value: timeAgo(issue.updatedAt), icon: <RefreshCw size={11} /> },
                { label: "Days Open", value: daysSince(issue.createdAt).toString(), icon: <Clock size={11} /> },
                { label: "Category", value: issue.categoryName, icon: <AlertTriangle size={11} /> },
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

            {/* ACTIONS */}
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium mb-2">
                Actions
              </h3>

              {/* Authority status changes */}
              {(userRole === "AUTHORITY" || userRole === "ADMIN") &&
                nextStatuses.map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleStatusChange(nextStatus)}
                  >
                    {nextStatus === "CITIZEN_VERIFICATION"
                      ? "Request Verification"
                      : `Mark as ${nextStatus.replace(/_/g, " ")}`}
                    <ArrowRight size={13} />
                  </Button>
                ))}

              {/* Citizen verification */}
              {userRole === "CITIZEN" &&
                issue.status === "CITIZEN_VERIFICATION" && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleVerify(true)}
                    >
                      <CheckCircle2 size={13} /> Yes — Fixed
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowVerifyModal(true)}
                    >
                      <XCircle size={13} /> No — Still Exists
                    </Button>
                  </>
                )}

              <Link href={`/map?issue=${issue.id}`}>
                <Button variant="ghost" size="sm" className="w-full">
                  <MapPin size={13} /> View on Map
                </Button>
              </Link>

              <Button variant="ghost" size="sm" className="w-full">
                <Share2 size={13} /> Share Issue
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                <FileText size={13} /> Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Verify Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Report Issue Not Fixed"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Please describe why you believe the issue is not resolved.
          </p>
          <Textarea
            placeholder="Describe what you still see..."
            value={verifyNote}
            onChange={(e) => setVerifyNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowVerifyModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleVerify(false)}>
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
