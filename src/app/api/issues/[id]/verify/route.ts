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
  const { verified, note } = await request.json();

  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Upsert verification
  const verification = await prisma.citizenVerification.upsert({
    where: {
      issueId_userId: { issueId: params.id, userId },
    },
    update: { verified, note },
    create: {
      issueId: params.id,
      userId,
      verified,
      note,
    },
  });

  // If verified (confirmed fixed), and enough verifications, close the issue
  if (verified) {
    const verifCount = await prisma.citizenVerification.count({
      where: { issueId: params.id, verified: true },
    });

    if (verifCount >= 2 && issue.status === "CITIZEN_VERIFICATION") {
      await prisma.issue.update({
        where: { id: params.id },
        data: { status: "CLOSED" },
      });

      await prisma.issueStatusHistory.create({
        data: {
          issueId: params.id,
          changedById: userId,
          fromStatus: "CITIZEN_VERIFICATION",
          toStatus: "CLOSED",
          note: `Issue verified by ${verifCount} citizens`,
        },
      });
    }
  } else {
    // If not verified, reopen the issue
    if (issue.status === "CITIZEN_VERIFICATION") {
      await prisma.issue.update({
        where: { id: params.id },
        data: { status: "REOPENED" },
      });

      await prisma.issueStatusHistory.create({
        data: {
          issueId: params.id,
          changedById: userId,
          fromStatus: "CITIZEN_VERIFICATION",
          toStatus: "REOPENED",
          note: note || "Citizen reported issue not resolved",
        },
      });
    }
  }

  return NextResponse.json({ verification });
}
