import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Check if already supported
  const existing = await prisma.supportingReport.findUnique({
    where: {
      issueId_userId: { issueId: params.id, userId },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Already supporting this issue" }, { status: 409 });
  }

  // Create supporting report
  await prisma.supportingReport.create({
    data: {
      issueId: params.id,
      userId,
      note: (await request.json()).note || null,
    },
  });

  // Increment report count
  const updated = await prisma.issue.update({
    where: { id: params.id },
    data: {
      reportCount: { increment: 1 },
    },
  });

  return NextResponse.json({
    message: "Support added",
    reportCount: updated.reportCount,
  });
}
