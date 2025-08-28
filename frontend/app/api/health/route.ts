import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test database connection
    let dbConnected = false;
    let chaptersCount = 0;
    let dbError = null;
    
    try {
      const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
      dbConnected = true;
      
      // Test learning chapters count
      chaptersCount = await prisma.learningChapter.count();
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown database error';
      console.warn("Database connection failed during health check:", error);
      dbConnected = false;
    }
    
    // Check environment variables (without exposing secrets)
    const envCheck = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRecaptchaSecret: !!process.env.RECAPTCHA_SECRET_KEY,
      hasRecaptchaSiteKey: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: dbConnected ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbConnected,
        chaptersCount,
        error: dbError
      },
      environment: envCheck,
      deployment: {
        platform: "vercel",
        region: process.env.VERCEL_REGION || "unknown",
        functionRegion: process.env.VERCEL_FUNCTION_REGION || "unknown"
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error instanceof Error ? error.stack : undefined : undefined
    }, { status: 500 });
  }
}
