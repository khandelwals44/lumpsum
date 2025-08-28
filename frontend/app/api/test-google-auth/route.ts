import { NextRequest, NextResponse } from "next/server";
import { getRequiredEnvVars } from "@/src/env.server";

export async function GET(request: NextRequest) {
  try {
    const envVars = getRequiredEnvVars();
    
    return NextResponse.json({
      status: "success",
      googleOAuth: {
        hasClientId: !!envVars.GOOGLE_CLIENT_ID,
        hasClientSecret: !!envVars.GOOGLE_CLIENT_SECRET,
        clientIdLength: envVars.GOOGLE_CLIENT_ID?.length || 0,
        clientSecretLength: envVars.GOOGLE_CLIENT_SECRET?.length || 0,
        clientIdPrefix: envVars.GOOGLE_CLIENT_ID?.substring(0, 10) + '...' || 'not set',
      },
      nextAuth: {
        hasSecret: !!envVars.NEXTAUTH_SECRET,
        secretLength: envVars.NEXTAUTH_SECRET?.length || 0,
      },
      database: {
        hasUrl: !!envVars.DATABASE_URL,
        urlLength: envVars.DATABASE_URL?.length || 0,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL,
        vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
      }
    });
  } catch (error) {
    console.error('Test Google Auth error:', error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      missingVars: error instanceof Error && error.message.includes('Missing required environment variables') 
        ? error.message 
        : 'Unknown'
    }, { status: 500 });
  }
}
