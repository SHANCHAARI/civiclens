import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Get related data
  const [evidence, statusHistory, comments, verifications, supportingReports] =
    await Promise.all([
      prisma.issueEvidence.findMany({
        where: { issueId: params.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.issueStatusHistory.findMany({
        where: { issueId: params.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.comment.findMany({
        where: { issueId: params.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.citizenVerification.findMany({
        where: { issueId: params.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportingReport.findMany({
        where: { issueId: params.id },
      }),
    ]);

  // Get author and department names
  const [author, department, ward] = await Promise.all([
    prisma.user.findUnique({
      where: { id: issue.authorId },
      select: { name: true },
    }),
    issue.departmentId
      ? prisma.department.findUnique({
          where: { id: issue.departmentId },
          select: { name: true },
        })
      : null,
    issue.wardId
      ? prisma.ward.findUnique({
          where: { id: issue.wardId },
          select: { name: true },
        })
      : null,
  ]);

  // Get category name
  const category = await prisma.issueCategory.findUnique({
    where: { slug: issue.categorySlug },
    select: { name: true, icon: true },
  });

  // Get status history with user names
  const historyWithNames = await Promise.all(
    statusHistory.map(async (h) => {
      const user = await prisma.user.findUnique({
        where: { id: h.changedById },
        select: { name: true },
      });
      return { ...h, changedByName: user?.name || "System" };
    })
  );

  // Get comment user names
  const commentsWithNames = await Promise.all(
    comments.map(async (c) => {
      const user = await prisma.user.findUnique({
        where: { id: c.userId },
        select: { name: true },
      });
      return { ...c, userName: user?.name || "Unknown" };
    })
  );

  // Get verification user names
  const verifWithNames = await Promise.all(
    verifications.map(async (v) => {
      const user = await prisma.user.findUnique({
        where: { id: v.userId },
        select: { name: true },
      });
      return { ...v, userName: user?.name || "Unknown" };
    })
  );

  return NextResponse.json({
    ...issue,
    categoryName: category?.name || issue.categorySlug,
    categoryIcon: category?.icon || "help-circle",
    authorName: author?.name || "Unknown",
    departmentName: department?.name || null,
    wardName: ward?.name || null,
    evidence,
    statusHistory: historyWithNames,
    comments: commentsWithNames,
    verifications: verifWithNames,
    reportCount: issue.reportCount + supportingReports.length,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const issue = await prisma.issue.findUnique({ where: { id: params.id } });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const updated = await prisma.issue.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}
