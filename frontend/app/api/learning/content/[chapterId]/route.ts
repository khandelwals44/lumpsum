import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { chapterId: string } }) {
  try {
    const chapter = await prisma.learningChapter.findUnique({
      where: { id: params.chapterId },
      include: {
        quizzes: {
          select: {
            id: true,
            question: true,
            options: true,
            correctAnswer: true,
            explanation: true
          }
        }
      }
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error fetching chapter content:", error);
    return NextResponse.json({ error: "Failed to fetch chapter content" }, { status: 500 });
  }
}
