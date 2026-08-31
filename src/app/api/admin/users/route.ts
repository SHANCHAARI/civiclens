import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [users, departments, categories, totalIssues] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.issueCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.issue.count(),
  ]);

  return NextResponse.json({
    users,
    departments,
    categories,
    stats: {
      totalUsers: users.length,
      totalIssues,
    },
  });
}
