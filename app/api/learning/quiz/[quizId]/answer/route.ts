import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { quizId: string } }) {
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
    const { answer } = body;

    const quiz = await prisma.chapterQuiz.findUnique({
      where: { id: params.quizId }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const isCorrect = answer === quiz.correctAnswer;

    const userAnswer = await prisma.userQuizAnswer.upsert({
      where: {
        userId_quizId: {
          userId: user.id,
          quizId: params.quizId
        }
      },
      update: { answer, isCorrect },
      create: {
        userId: user.id,
        quizId: params.quizId,
        answer,
        isCorrect
      }
    });

    return NextResponse.json({
      isCorrect,
      explanation: quiz.explanation,
      correctAnswer: quiz.correctAnswer
    });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
