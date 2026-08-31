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

  const issue = await prisma.issue.findUnique({ where: { id: params.id } });
  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const { body } = await request.json();
  if (!body || body.trim().length === 0) {
    return NextResponse.json({ error: "Comment body required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      issueId: params.id,
      userId: (session.user as any).id,
      body: body.trim(),
    },
  });

  // Notify the issue author
  if (issue.authorId !== (session.user as any).id) {
    await prisma.notification.create({
      data: {
        userId: issue.authorId,
        type: "NEW_COMMENT",
        title: "New comment on your issue",
        body: `${(session.user as any).name || "Someone"} commented on "${issue.title}"`,
        issueId: params.id,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const comments = await prisma.comment.findMany({
    where: { issueId: params.id },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with user names
  const enriched = await Promise.all(
    comments.map(async (c) => {
      const user = await prisma.user.findUnique({
        where: { id: c.userId },
        select: { name: true },
      });
      return { ...c, userName: user?.name || "Unknown" };
    })
  );

  return NextResponse.json(enriched);
}
