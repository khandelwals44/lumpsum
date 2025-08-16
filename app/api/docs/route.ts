import { NextResponse } from "next/server";
import swagger from "@/docs/swagger.json";

export async function GET() {
  return NextResponse.json(swagger);
}
