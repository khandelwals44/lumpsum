import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashed,
        role: "USER"
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
