import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authServer";

export async function GET() {
  try {
    const user = await requireUser();
    const goals = await prisma.investmentGoal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(goals);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const created = await prisma.investmentGoal.create({ data: { userId: user.id, ...body } });
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { id, ...rest } = body;
    const updated = await prisma.investmentGoal.update({ where: { id }, data: rest });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { id } = await req.json();
    await prisma.investmentGoal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
