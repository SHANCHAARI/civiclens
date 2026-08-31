import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { calculatePriority } from "@/lib/priority";
import { checkDuplicates } from "@/lib/duplicate";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issue = await prisma.issue.findUnique({
    where: { id: params.id },
  });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Update status to AI_ANALYZING
  await prisma.issue.update({
    where: { id: params.id },
    data: { status: "AI_ANALYZING" },
  });

  // Get evidence for analysis
  const evidence = await prisma.issueEvidence.findFirst({
    where: { issueId: params.id },
    orderBy: { createdAt: "asc" },
  });

  let analysis;
  try {
    const provider = getAIProvider();
    analysis = await provider.analyzeImage(
      evidence?.fileUrl || "placeholder.jpg"
    );
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Fallback - don't let AI failure block the process
    analysis = null;
  }

  if (analysis) {
    // Update issue with AI analysis
    await prisma.issue.update({
      where: { id: params.id },
      data: {
        status: "VERIFIED",
        aiConfidence: analysis.categoryConfidence,
        aiCategory: analysis.category,
        aiSeverity: analysis.severity,
        aiDescription: analysis.description,
        aiObservations: JSON.stringify(analysis.observations),
        aiReasoning: analysis.reasoning,
        aiSuggestedDept: analysis.suggestedDepartment,
        aiAnalyzedAt: new Date(),
        severity: analysis.severity,
        categorySlug: analysis.category.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    // Record status change
    await prisma.issueStatusHistory.create({
      data: {
        issueId: params.id,
        changedById: (session.user as any).id,
        fromStatus: "AI_ANALYZING",
        toStatus: "VERIFIED",
        note: `AI analysis completed. Category: ${analysis.category} (${Math.round(analysis.categoryConfidence * 100)}% confidence)`,
      },
    });

    // Check for duplicates
    const duplicates = await checkDuplicates({
      latitude: issue.latitude,
      longitude: issue.longitude,
      categorySlug: issue.categorySlug,
    });

    // Calculate priority
    const priority = calculatePriority({
      severity: analysis.severity,
      categorySlug: issue.categorySlug,
      createdAt: issue.createdAt,
      latitude: issue.latitude,
      longitude: issue.longitude,
      reportCount: issue.reportCount,
      aiConfidence: analysis.categoryConfidence,
    });

    await prisma.issue.update({
      where: { id: params.id },
      data: { priorityScore: priority.score },
    });

    return NextResponse.json({
      analysis,
      duplicates,
      priority,
      issueId: params.id,
    });
  }

  return NextResponse.json({
    analysis: null,
    message: "AI analysis unavailable. You can continue manually.",
  });
}
