import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const subCategory = searchParams.get("subCategory") || undefined;

  const where: any = {};
  if (q) where.name = { contains: q };
  if (category) where.category = category;
  if (subCategory) where.subCategory = subCategory;

  const funds = await prisma.mutualFund.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json(funds);
}
