import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { quizId: string } }) {
  return NextResponse.json({ error: "Temporarily disabled due to schema mismatch" }, { status: 503 });
}
