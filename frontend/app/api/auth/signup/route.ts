import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUpSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

// Rate limiting: 5 signup attempts per IP per hour
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = await limiter.check(5, ip);
    
    if (!success) {
      return NextResponse.json(
        { message: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message);
      return NextResponse.json(
        { message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { fullName, email, password, recaptchaToken } = validationResult.data;

    // Verify reCAPTCHA if configured
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecretKey && recaptchaToken) {
      const recaptchaResponse = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: recaptchaSecretKey,
            response: recaptchaToken,
          }),
        }
      );

      const recaptchaData = await recaptchaResponse.json();
      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return NextResponse.json(
          { message: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "USER",
        emailVerified: null // Will be verified via email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // TODO: Send welcome email with verification link
    // await sendWelcomeEmail(user.email, user.name);

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
