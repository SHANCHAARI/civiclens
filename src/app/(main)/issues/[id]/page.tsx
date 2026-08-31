"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import {
  MapPin,
  Clock,
  Brain,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  FileText,
  Share2,
} from "lucide-react";
import {
  timeAgo,
  formatDate,
  formatDateTime,
  daysSince,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
  CATEGORY_CONFIG,
  STATUS_FLOW,
} from "@/types";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [supporting, setSupporting] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/issues/${params.id}`);
        if (res.ok) {
          setIssue(await res.json());
        }
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
      // Reload issue
      const res = await fetch(`/api/issues/${params.id}`);
      setIssue(await res.json());
      setToast({
        message: verified ? "Resolution confirmed!" : "Issue reopened",
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
      setToast({ message: "Support added!", type: "success" });
    } catch (e) {
      setToast({ message: "Failed to add support", type: "error" });
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
    } catch (e: any) {
      const data = await e.message;
      setToast({ message: `Failed: ${data}`, type: "error" });
    }
  };

  if (loading) {
    return (
      <AppLayout breadcrumbs={[{ label: "Issues" }, { label: "Loading..." }]}>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-64 skeleton" />
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout breadcrumbs={[{ label: "Issues" }]}>
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertTriangle size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Issue Not Found
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            This issue may have been removed or the ID is incorrect.
          </p>
        </div>
      </AppLayout>
    );
  }

  const statusIndex = STATUS_FLOW.indexOf(issue.status);

  // Valid next statuses
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
        { label: "Issues", href: "/map" },
        { label: issue.title },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl glass border ${
              toast.type === "success"
                ? "border-green-500/30 text-green-500"
                : "border-red-500/30 text-red-500"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
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
              <Badge variant="info" size="md">
                {issue.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {issue.title}
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              {issue.categoryName} • Reported {timeAgo(issue.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 size={14} /> Share
            </Button>
            <Button variant="ghost" size="sm">
              <FileText size={14} /> Report
            </Button>
          </div>
        </div>

        {/* Priority Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`text-3xl font-black ${
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
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">PRIORITY SCORE</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {issue.priorityScore >= 80
                    ? "Critical Priority"
                    : issue.priorityScore >= 60
                    ? "High Priority"
                    : issue.priorityScore >= 40
                    ? "Medium Priority"
                    : "Low Priority"}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-[var(--text-tertiary)]">
              <p>{issue.reportCount} supporting reports</p>
              <p>{daysSince(issue.createdAt)} days open</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[var(--text-primary)]">Description</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {issue.description}
                </p>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {issue.aiConfidence && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Brain size={16} className="text-[var(--accent)]" />
                    AI Analysis
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                      <p className="text-xs text-[var(--text-tertiary)]">Category</p>
                      <p className="font-medium text-[var(--text-primary)]">
                        {issue.aiCategory}
                      </p>
                      <p className="text-xs text-[var(--accent)]">
                        {Math.round(issue.aiConfidence * 100)}% confidence
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                      <p className="text-xs text-[var(--text-tertiary)]">Severity</p>
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
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Description</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {issue.aiDescription}
                      </p>
                    </div>
                  )}
                  {issue.aiObservations && (
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Observations</p>
                      <ul className="space-y-1">
                        {JSON.parse(issue.aiObservations).map((obs: string, i: number) => (
                          <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[var(--accent)]">•</span>
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {issue.aiReasoning && (
                    <div className="p-3 rounded-xl bg-[var(--accent-subtle)]">
                      <p className="text-xs text-[var(--accent)] mb-1">Reasoning</p>
                      <p className="text-xs text-[var(--text-secondary)]">{issue.aiReasoning}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Clock size={16} className="text-[var(--accent)]" />
                  Timeline
                </h3>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress bar */}
                  <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />
                  <div
                    className="absolute left-[11px] top-0 w-0.5 bg-[var(--accent)] transition-all duration-500"
                    style={{
                      height: `${Math.max(0, (statusIndex / (STATUS_FLOW.length - 1)) * 100)}%`,
                    }}
                  />

                  <div className="space-y-4">
                    {issue.statusHistory.map((entry: any, i: number) => {
                      const isLatest = i === issue.statusHistory.length - 1;
                      return (
                        <div key={entry.id} className="flex items-start gap-3 relative">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                              isLatest
                                ? "bg-[var(--accent)] text-white"
                                : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                            }`}
                          >
                            {isLatest ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {entry.toStatus.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                              {entry.changedByName} • {formatDateTime(entry.createdAt)}
                            </p>
                            {entry.note && (
                              <p className="text-xs text-[var(--text-secondary)] mt-1">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Users size={16} className="text-[var(--accent)]" />
                  Community ({issue.reportCount} supporters)
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSupport}
                  loading={supporting}
                >
                  <Users size={14} /> Support This Issue
                </Button>

                {/* Verifications */}
                {issue.verifications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--text-tertiary)]">Verifications</p>
                    {issue.verifications.map((v: any) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-tertiary)]/50"
                      >
                        {v.verified ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        <span className="text-sm text-[var(--text-secondary)]">
                          {v.userName} {v.verified ? "confirmed fixed" : "reported still exists"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--accent)]" />
                  Location
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-40 rounded-xl overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={20} className="mx-auto text-[var(--accent)]" />
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                      {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                {issue.address && (
                  <p className="text-sm text-[var(--text-secondary)]">{issue.address}</p>
                )}
                {issue.landmark && (
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Near: {issue.landmark}
                  </p>
                )}
                {issue.wardName && (
                  <p className="text-xs text-[var(--text-tertiary)]">Ward: {issue.wardName}</p>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[var(--text-primary)]">Details</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Department", value: issue.departmentName || "Unassigned", icon: <Building2 size={14} /> },
                  { label: "Reported", value: formatDate(issue.createdAt), icon: <Calendar size={14} /> },
                  { label: "Last Updated", value: timeAgo(issue.updatedAt), icon: <RefreshCw size={14} /> },
                  { label: "Days Open", value: daysSince(issue.createdAt).toString(), icon: <Clock size={14} /> },
                  { label: "Category", value: issue.categoryName, icon: <AlertTriangle size={14} /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                      {item.icon}
                      {item.label}
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-[var(--text-primary)]">Actions</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Status change buttons for authority/admin */}
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
                        ? "Request Citizen Verification"
                        : `Mark as ${nextStatus.replace(/_/g, " ")}`}
                      <ArrowRight size={14} />
                    </Button>
                  ))}

                {/* Citizen verification for citizens */}
                {userRole === "CITIZEN" &&
                  issue.status === "CITIZEN_VERIFICATION" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleVerify(true)}
                      >
                        <CheckCircle2 size={14} /> Yes — Fixed
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowVerifyModal(true)}
                      >
                        <XCircle size={14} /> No — Still Exists
                      </Button>
                    </>
                  )}

                {/* Support button for citizens */}
                {userRole === "CITIZEN" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleSupport}
                  >
                    <Users size={14} /> Support This Issue
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Map Link */}
            <Link href={`/map?issue=${issue.id}`}>
              <Button variant="outline" className="w-full">
                <MapPin size={14} /> View on Map
              </Button>
            </Link>
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
      </div>
    </AppLayout>
  );
}
