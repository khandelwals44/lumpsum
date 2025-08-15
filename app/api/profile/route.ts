import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authServer";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    return NextResponse.json(profile ?? null);
  } catch (e: any) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const updated = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: body,
      create: {
        userId: user.id,
        age: 25,
        gender: "other",
        income: 0,
        expenses: 0,
        currentInvestments: 0,
        location: "",
        riskAppetite: "moderate",
        currentPortfolioValue: 0,
        monthlySIPCapacity: 0,
        ...body
      }
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
