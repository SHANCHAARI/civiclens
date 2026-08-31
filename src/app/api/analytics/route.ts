import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";

  switch (type) {
    case "overview": {
      const [
        totalIssues,
        openIssues,
        resolvedIssues,
        criticalIssues,
        issuesThisMonth,
      ] = await Promise.all([
        prisma.issue.count(),
        prisma.issue.count({
          where: {
            status: {
              in: [
                "REPORTED",
                "AI_ANALYZING",
                "VERIFIED",
                "ASSIGNED",
                "ACKNOWLEDGED",
                "IN_PROGRESS",
                "REOPENED",
              ],
            },
          },
        }),
        prisma.issue.count({
          where: { status: { in: ["RESOLVED", "CLOSED"] } },
        }),
        prisma.issue.count({
          where: {
            severity: "CRITICAL",
            status: { notIn: ["CLOSED", "REJECTED", "MERGED"] },
          },
        }),
        prisma.issue.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(1)),
            },
          },
        }),
      ]);

      // Calculate average resolution time
      const resolvedIssuesList = await prisma.issueStatusHistory.findMany({
        where: { toStatus: "RESOLVED" },
        select: { issueId: true, createdAt: true },
      });

      let avgResolutionDays = null;
      if (resolvedIssuesList.length > 0) {
        let totalDays = 0;
        for (const ri of resolvedIssuesList) {
          const createdIssue = await prisma.issue.findUnique({
            where: { id: ri.issueId },
            select: { createdAt: true },
          });
          if (createdIssue) {
            totalDays +=
              (ri.createdAt.getTime() - createdIssue.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
          }
        }
        avgResolutionDays = Math.round(totalDays / resolvedIssuesList.length * 10) / 10;
      }

      return NextResponse.json({
        totalIssues,
        openIssues,
        resolvedIssues,
        criticalIssues,
        resolvedThisMonth: issuesThisMonth,
        avgResolutionDays,
      });
    }

    case "trends": {
      const days = parseInt(searchParams.get("days") || "30");
      const trends = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const [reported, resolved] = await Promise.all([
          prisma.issue.count({
            where: {
              createdAt: { gte: startOfDay, lte: endOfDay },
            },
          }),
          prisma.issueStatusHistory.count({
            where: {
              toStatus: "RESOLVED",
              createdAt: { gte: startOfDay, lte: endOfDay },
            },
          }),
        ]);

        trends.push({
          date: startOfDay.toISOString().split("T")[0],
          reported,
          resolved,
        });
      }

      return NextResponse.json(trends);
    }

    case "categories": {
      const issues = await prisma.issue.groupBy({
        by: ["categorySlug"],
        _count: true,
        orderBy: { _count: { categorySlug: "desc" } },
      });

      const COLORS = [
        "#f97316", "#f97316", "#eab308", "#22c55e",
        "#3b82f6", "#06b6d4", "#8b5cf6", "#16a34a",
        "#ef4444", "#a855f7", "#ec4899", "#6b7280",
      ];

      return NextResponse.json(
        issues.map((i, idx) => ({
          name: i.categorySlug.replace(/-/g, " "),
          count: i._count,
          color: COLORS[idx % COLORS.length],
        }))
      );
    }

    case "departments": {
      const departments = await prisma.department.findMany({
        where: { isActive: true },
      });

      const deptStats = await Promise.all(
        departments.map(async (dept) => {
          const [open, resolved] = await Promise.all([
            prisma.issue.count({
              where: {
                departmentId: dept.id,
                status: {
                  notIn: ["CLOSED", "REJECTED", "MERGED"],
                },
              },
            }),
            prisma.issue.count({
              where: {
                departmentId: dept.id,
                status: { in: ["RESOLVED", "CLOSED"] },
              },
            }),
          ]);

          return {
            name: dept.name,
            open,
            resolved,
            total: open + resolved,
          };
        })
      );

      return NextResponse.json(deptStats);
    }

    case "hotspots": {
      // Find areas with high issue density using grid-based clustering
      const issues = await prisma.issue.findMany({
        where: {
          status: { notIn: ["CLOSED", "REJECTED", "MERGED"] },
        },
        select: {
          latitude: true,
          longitude: true,
          severity: true,
        },
      });

      // Simple grid-based clustering (0.01 degree ≈ 1km)
      const gridSize = 0.01;
      const grid: Record<string, { lat: number; lng: number; count: number; severitySum: number }> = {};

      issues.forEach((issue) => {
        const gridLat = Math.round(issue.latitude / gridSize) * gridSize;
        const gridLng = Math.round(issue.longitude / gridSize) * gridSize;
        const key = `${gridLat.toFixed(3)}_${gridLng.toFixed(3)}`;

        if (!grid[key]) {
          grid[key] = { lat: gridLat, lng: gridLng, count: 0, severitySum: 0 };
        }
        grid[key].count++;

        const sevMap: Record<string, number> = {
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
          CRITICAL: 4,
        };
        grid[key].severitySum += sevMap[issue.severity] || 2;
      });

      const hotspots = Object.values(grid)
        .filter((g) => g.count >= 3)
        .map((g) => ({
          latitude: g.lat,
          longitude: g.lng,
          count: g.count,
          avgSeverity:
            g.severitySum / g.count >= 3.5
              ? "CRITICAL"
              : g.severitySum / g.count >= 2.5
              ? "HIGH"
              : g.severitySum / g.count >= 1.5
              ? "MEDIUM"
              : "LOW",
        }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json(hotspots);
    }

    default:
      return NextResponse.json({ error: "Unknown analytics type" }, { status: 400 });
  }
}
