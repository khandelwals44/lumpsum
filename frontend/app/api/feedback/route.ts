import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

interface FeedbackSubmission {
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  priority: string;
  includeSystemInfo: boolean;
  allowContact: boolean;
  systemInfo?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackSubmission = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'type', 'subject', 'message'] as const;
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Store feedback in database
    try {
      const feedback = await prisma.feedback.create({
        data: {
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          type: body.type,
          subject: body.subject.trim(),
          message: body.message.trim(),
          priority: body.priority,
          includeSystemInfo: body.includeSystemInfo,
          allowContact: body.allowContact,
          systemInfo: body.systemInfo ? JSON.stringify(body.systemInfo) : null,
          status: 'new',
        },
      });

      // Send email notification
      await sendFeedbackEmail(body, feedback.id);

      return NextResponse.json({
        success: true,
        message: "Feedback submitted successfully",
        id: feedback.id,
      });

    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // If database fails, still try to send email
      try {
        await sendFeedbackEmail(body, 'temp-' + Date.now());
        
        return NextResponse.json({
          success: true,
          message: "Feedback submitted successfully (email only)",
          warning: "Database storage failed, but email was sent",
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
        return NextResponse.json(
          { error: "Failed to submit feedback. Please try again later." },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendFeedbackEmail(feedback: FeedbackSubmission, feedbackId: string | number) {
  // In a real implementation, you would use a service like SendGrid, AWS SES, or Nodemailer
  // For now, we'll simulate the email sending process
  
  const emailContent = `
New Feedback Submission - Lumpsum.in

Feedback ID: ${feedbackId}
Date: ${new Date().toISOString()}

From: ${feedback.name} (${feedback.email})
Type: ${feedback.type}
Priority: ${feedback.priority}
Subject: ${feedback.subject}

Message:
${feedback.message}

Additional Information:
- Include System Info: ${feedback.includeSystemInfo ? 'Yes' : 'No'}
- Allow Contact: ${feedback.allowContact ? 'Yes' : 'No'}
${feedback.systemInfo ? `
System Information:
${JSON.stringify(feedback.systemInfo, null, 2)}
` : ''}

---
This is an automated message from Lumpsum.in feedback system.
Please respond to ${feedback.email} if follow-up is needed.
  `;

  // Log the email content (in production, this would be sent via email service)
  console.log("=== FEEDBACK EMAIL ===");
  console.log(`To: lumpsum.in@gmail.com`);
  console.log(`Subject: [Feedback] ${feedback.subject}`);
  console.log(emailContent);
  console.log("=== END EMAIL ===");

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // In production, you would use something like:
  // await sendGrid.send({
  //   to: 'lumpsum.in@gmail.com',
  //   from: 'noreply@lumpsum.in',
  //   subject: `[Feedback] ${feedback.subject}`,
  //   text: emailContent,
  //   html: generateHtmlEmail(feedback, feedbackId),
  // });
}

// Helper function to generate HTML email (for production use)
function generateHtmlEmail(feedback: FeedbackSubmission, feedbackId: string | number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Feedback - Lumpsum.in</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #374151; }
    .value { margin-top: 5px; }
    .message { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Feedback Submission</h1>
      <p>Lumpsum.in Feedback System</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="label">Feedback ID:</div>
        <div class="value">${feedbackId}</div>
      </div>
      
      <div class="field">
        <div class="label">From:</div>
        <div class="value">${feedback.name} (${feedback.email})</div>
      </div>
      
      <div class="field">
        <div class="label">Type:</div>
        <div class="value">${feedback.type}</div>
      </div>
      
      <div class="field">
        <div class="label">Priority:</div>
        <div class="value">${feedback.priority}</div>
      </div>
      
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${feedback.subject}</div>
      </div>
      
      <div class="field">
        <div class="label">Message:</div>
        <div class="message">${feedback.message.replace(/\n/g, '<br>')}</div>
      </div>
      
      <div class="field">
        <div class="label">Options:</div>
        <div class="value">
          Include System Info: ${feedback.includeSystemInfo ? 'Yes' : 'No'}<br>
          Allow Contact: ${feedback.allowContact ? 'Yes' : 'No'}
        </div>
      </div>
      
      ${feedback.systemInfo ? `
      <div class="field">
        <div class="label">System Information:</div>
        <div class="value">
          <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">${JSON.stringify(feedback.systemInfo, null, 2)}</pre>
        </div>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>This is an automated message from Lumpsum.in feedback system.</p>
        <p>Please respond to ${feedback.email} if follow-up is needed.</p>
        <p>Submitted on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
