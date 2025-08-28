import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json({ 
        error: "Database connection failed", 
        details: "Unable to connect to the database. Please try again later.",
        chapters: [] // Return empty array instead of failing
      }, { status: 503 });
    }

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

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json({ 
      error: "Failed to fetch chapters", 
      details: error instanceof Error ? error.message : 'Unknown error',
      chapters: [] // Provide fallback data
    }, { status: 500 });
  } finally {
    // Always disconnect to free up connections
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
}
