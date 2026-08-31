import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canTransition } from "@/lib/utils";
import { calculatePriority } from "@/lib/priority";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status, note, departmentId, assigneeId } = await request.json();
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Validate state transition
  if (!canTransition(issue.status, status)) {
    return NextResponse.json(
      {
        error: `Cannot transition from ${issue.status} to ${status}`,
        validTransitions: ["REPORTED", "AI_ANALYZING", "VERIFIED", "ASSIGNED"],
      },
      { status: 400 }
    );
  }

  // Build update data
  const updateData: any = { status };

  if (status === "ASSIGNED" && departmentId) {
    updateData.departmentId = departmentId;
  }
  if (assigneeId) {
    updateData.assigneeId = assigneeId;
  }

  // Recalculate priority when status changes
  const updatedIssue = await prisma.issue.update({
    where: { id: params.id },
    data: updateData,
  });

  // Record status history
  await prisma.issueStatusHistory.create({
    data: {
      issueId: params.id,
      changedById: userId,
      fromStatus: issue.status,
      toStatus: status,
      note: note || null,
    },
  });

  // Create notifications for the issue author
  if (issue.authorId !== userId) {
    const statusMessages: Record<string, string> = {
      VERIFIED: "Your report has been verified by AI analysis.",
      ASSIGNED: `Your report has been assigned to a department.`,
      ACKNOWLEDGED: "Your report has been acknowledged.",
      IN_PROGRESS: "Work has begun on resolving your report.",
      RESOLVED: "Your reported issue has been marked as resolved.",
      CLOSED: "Your report has been closed.",
      REJECTED: "Your report has been rejected.",
      REOPENED: "Your report has been reopened.",
    };

    await prisma.notification.create({
      data: {
        userId: issue.authorId,
        type: `STATUS_${status}`,
        title: `Issue ${status.replace(/_/g, " ").toLowerCase()}`,
        body: statusMessages[status] || `Status changed to ${status}`,
        issueId: params.id,
      },
    });
  }

  return NextResponse.json({
    issue: updatedIssue,
    message: `Status changed from ${issue.status} to ${status}`,
  });
}
