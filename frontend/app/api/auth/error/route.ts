import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get("error");
    
    return NextResponse.json({
      error: error || "Unknown authentication error",
      timestamp: new Date().toISOString(),
      message: "Authentication failed"
    });
  } catch (error) {
    console.error('Auth error route error:', error);
    return NextResponse.json({
      error: "Internal server error",
      timestamp: new Date().toISOString(),
      message: "Authentication error occurred"
    }, { status: 500 });
  }
}
