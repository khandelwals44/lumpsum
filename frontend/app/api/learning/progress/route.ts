import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const progress = await prisma.userLearningProgress.findMany({
      where: {
        userId: user.id
      },
      select: {
        chapterId: true,
        completed: true,
        timeSpent: true,
        lastAccessed: true
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { chapterId, completed, timeSpent } = body;

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const progress = await prisma.userLearningProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: chapterId
        }
      },
      update: {
        completed: completed ?? undefined,
        timeSpent: timeSpent ?? undefined,
        lastAccessed: new Date()
      },
      create: {
        userId: user.id,
        chapterId: chapterId,
        completed: completed ?? false,
        timeSpent: timeSpent ?? 0,
        lastAccessed: new Date()
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
