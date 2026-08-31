import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get("entity") || "all";

  if (entity === "users") {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  }

  if (entity === "departments") {
    const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ departments });
  }

  if (entity === "categories") {
    const categories = await prisma.issueCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ categories });
  }

  // Default: return everything
  const [users, departments, categories, totalIssues] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.issueCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.issue.count(),
  ]);

  return NextResponse.json({ users, departments, categories, stats: { totalUsers: users.length, totalIssues } });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { entityType } = body;

  if (entityType === "department") {
    const dept = await prisma.department.create({
      data: { name: body.name, description: body.description || null, contactEmail: body.contactEmail || null },
    });
    return NextResponse.json(dept, { status: 201 });
  }

  if (entityType === "category") {
    const existingCount = await prisma.issueCategory.count();
    const cat = await prisma.issueCategory.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
        icon: body.icon || "help-circle",
        description: body.description || null,
        sortOrder: existingCount,
      },
    });
    return NextResponse.json(cat, { status: 201 });
  }

  if (entityType === "user") {
    const password = await bcrypt.hash(body.password || "changeme123", 10);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, password, role: body.role || "CITIZEN" },
    });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { entityType, id, ...data } = body;

  if (entityType === "department") {
    const dept = await prisma.department.update({ where: { id }, data: { name: data.name, description: data.description, isActive: data.isActive } });
    return NextResponse.json(dept);
  }

  if (entityType === "category") {
    const cat = await prisma.issueCategory.update({ where: { id }, data: { name: data.name, icon: data.icon, description: data.description, isActive: data.isActive } });
    return NextResponse.json(cat);
  }

  if (entityType === "user") {
    const updateData: any = { name: data.name, role: data.role, isActive: data.isActive };
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  }

  return NextResponse.json({ error: "Unknown entity type" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");
  const id = searchParams.get("id");

  if (!id || !entityType) {
    return NextResponse.json({ error: "Missing id or entityType" }, { status: 400 });
  }

  // Soft-delete users, hard-delete others
  if (entityType === "user") {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  } else if (entityType === "department") {
    await prisma.department.update({ where: { id }, data: { isActive: false } });
  } else if (entityType === "category") {
    await prisma.issueCategory.update({ where: { id }, data: { isActive: false } });
  }

  return NextResponse.json({ success: true });
}
