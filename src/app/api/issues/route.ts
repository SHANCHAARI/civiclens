import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { issueCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const category = searchParams.get("category");
  const wardId = searchParams.get("wardId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const radius = parseFloat(searchParams.get("radius") || "0");

  const where: any = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (category) where.categorySlug = category;
  if (wardId) where.wardId = wardId;

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.issue.count({ where }),
  ]);

  return NextResponse.json({
    issues,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = issueCreateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const data = validation.data;
  const userId = (session.user as any).id;

  const issue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description,
      categorySlug: data.categorySlug,
      severity: data.severity,
      status: "REPORTED",
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || null,
      landmark: data.landmark || null,
      wardId: data.wardId || null,
      authorId: userId,
      departmentId: data.departmentId || null,
      priorityScore: 50,
    },
  });

  // Create initial status history
  await prisma.issueStatusHistory.create({
    data: {
      issueId: issue.id,
      changedById: userId,
      fromStatus: "",
      toStatus: "REPORTED",
      note: "Issue reported",
    },
  });

  return NextResponse.json(issue, { status: 201 });
}
