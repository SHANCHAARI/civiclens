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

  const body = await request.json();
  const { fileUrl, fileName, fileType, caption, isResolution } = body;

  if (!fileUrl) {
    return NextResponse.json({ error: "File URL required" }, { status: 400 });
  }

  const evidence = await prisma.issueEvidence.create({
    data: {
      issueId: params.id,
      uploaderId: (session.user as any).id,
      fileUrl,
      fileName: fileName || null,
      fileType: fileType || "IMAGE",
      caption: caption || null,
      isResolution: isResolution || false,
    },
  });

  return NextResponse.json(evidence, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const evidence = await prisma.issueEvidence.findMany({
    where: { issueId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(evidence);
}
