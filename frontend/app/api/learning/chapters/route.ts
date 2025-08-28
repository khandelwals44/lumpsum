import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const category = searchParams.get("category");

    const where: any = { isActive: true };
    if (level) where.level = level;
    if (category) where.category = category;

    const chapters = await prisma.learningChapter.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        level: true,
        category: true,
        order: true,
        estimatedTime: true
      }
    });

    console.log(`Found ${chapters.length} chapters`);
    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json({ error: "Failed to fetch chapters", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
