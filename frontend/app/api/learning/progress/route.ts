import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const progress = await prisma.userLearningProgress.findMany({
      where: { userId: user.id },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            category: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { chapterId, progress, completed, timeSpent } = body;

    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });
    }

    const updated = await prisma.userLearningProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId
        }
      },
      update: {
        progress,
        completed,
        timeSpent,
        lastAccessed: new Date()
      },
      create: {
        userId: user.id,
        chapterId,
        progress,
        completed,
        timeSpent
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
