import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables without exposing sensitive data
    const envCheck = {
      // Database
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'not set',
      
      // NextAuth
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      
      // Google OAuth
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...' || 'not set',
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      
      // reCAPTCHA
      hasRecaptchaSecret: !!process.env.RECAPTCHA_SECRET_KEY,
      hasRecaptchaSiteKey: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      
      // Vercel
      vercelUrl: process.env.VERCEL_URL || 'not set',
      vercelBranchUrl: process.env.VERCEL_BRANCH_URL || 'not set',
      nodeEnv: process.env.NODE_ENV || 'not set',
      
      // Request info
      requestUrl: request.url,
      userAgent: request.headers.get('user-agent') || 'not set',
    };

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      recommendations: {
        database: envCheck.hasDatabaseUrl ? "✅ Database URL is set" : "❌ DATABASE_URL is missing",
        nextAuth: envCheck.hasNextAuthSecret && envCheck.hasNextAuthUrl ? "✅ NextAuth is configured" : "❌ NextAuth configuration incomplete",
        googleOAuth: envCheck.hasGoogleClientId && envCheck.hasGoogleClientSecret ? "✅ Google OAuth is configured" : "❌ Google OAuth configuration incomplete",
        vercel: envCheck.vercelUrl !== 'not set' ? "✅ Vercel environment detected" : "❌ Vercel environment not detected"
      }
    });
  } catch (error) {
    console.error('Debug env error:', error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
