import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

// In-memory rate limit tracker
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // Max 3 requests per minute per IP

// List of common disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "yopmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "dropmail.me",
  "temp-mail.org",
  "throwawaymail.com",
  "sharklasers.com",
  "nada.ltd",
  "dispostable.com",
]);

// Allowed domains list
const ALLOWED_ORIGINS = [
  "https://shedbody.com",
  "https://www.shedbody.com",
  "http://localhost:3000", // For local development
];

// Handle Preflight (OPTIONS) requests for CORS
export async function OPTIONS(req) {
  const origin = req.headers.get("origin");

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    // CORS Origin Security Check
    const origin = req.headers.get("origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json(
        { error: "Forbidden: Unauthorized Origin" },
        { status: 403 },
      );
    }

    // Get user's IP address
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";
    const currentTime = Date.now();

    // Check rate limit for the IP
    if (rateLimitMap.has(ip)) {
      const data = rateLimitMap.get(ip);
      if (currentTime - data.startTime > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, startTime: currentTime });
      } else {
        data.count++;
        if (data.count > MAX_REQUESTS) {
          return NextResponse.json(
            { error: "Too many requests. Please try again in a minute." },
            { status: 429 },
          );
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, startTime: currentTime });
    }

    const supabase = await createClient();
    const body = await req.json();

    const { name, email, inquiryType, message, honeypot, recaptchaToken } =
      body;

    // 1. Basic Spam protection (Honeypot)
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // 2. Google reCAPTCHA v3 Validation
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "Security validation missing. Please refresh and try again." },
        { status: 400 },
      );
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;

    const recaptchaRes = await fetch(recaptchaVerifyUrl, { method: "POST" });
    const recaptchaData = await recaptchaRes.json();

    // Score < 0.5 is usually a bot
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json(
        { error: "Security check failed. Automated bot behavior detected." },
        { status: 403 },
      );
    }

    // Validation
    if (!name || !email || !message || !inquiryType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Spam URL / Link Validation
    const linkRegex = /(http:\/\/|https:\/\/|www\.|<a\s+href)/i;
    if (linkRegex.test(message) || linkRegex.test(name)) {
      return NextResponse.json(
        {
          error: "Links and URLs are not allowed in the form to prevent spam.",
        },
        { status: 400 },
      );
    }

    // Basic HTML Sanitization (XSS Protection)
    const sanitizeHTML = (str) =>
      str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Basic sanitization (Clean data)
    const cleanData = {
      name: sanitizeHTML(name.trim()),
      email: email.trim().toLowerCase(),
      inquiry_type: inquiryType,
      message: sanitizeHTML(message.trim()),
    };

    // 1. Basic Email Regex Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanData.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // 2. Disposable Email Validation (Dynamic API + Static Fallback)
    const emailDomain = cleanData.email.split("@")[1];
    let isDisposable = false;

    try {
      // Using an open, key-less API to check for disposable domains
      const verifyRes = await fetch(
        `https://open.kickbox.com/v1/disposable/${emailDomain}`,
      );
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        isDisposable = verifyData.disposable;
      } else {
        // Fallback to static list if API limit is reached or it fails
        isDisposable = DISPOSABLE_DOMAINS.has(emailDomain);
      }
    } catch (apiError) {
      // Fallback if network issue occurs
      isDisposable = DISPOSABLE_DOMAINS.has(emailDomain);
    }

    if (isDisposable) {
      return NextResponse.json(
        {
          error:
            "Please use a valid personal or business email. Temporary emails are not allowed.",
        },
        { status: 400 },
      );
    }

    // Save to database
    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert([cleanData]);

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Setup SMTP (Zoho)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // 465 = true
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send emails (non-blocking safe approach)
    try {
      // Admin email
      await transporter.sendMail({
        from: `"ShedBody Contact" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `New Inquiry: ${inquiryType}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #10b981; padding: 20px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0;">New Contact Submission</h2>
              </div>
              <div style="padding: 30px;">
                <p style="margin-top: 0; font-size: 16px; color: #374151;">You have received a new inquiry from the ShedBody contact form.</p>
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
                  <p style="margin: 0 0 10px 0; color: #111827;"><strong>Name:</strong> ${cleanData.name}</p>
                  <p style="margin: 0 0 10px 0; color: #111827;"><strong>Email:</strong> <a href="mailto:${cleanData.email}" style="color: #10b981;">${cleanData.email}</a></p>
                  <p style="margin: 0; color: #111827;"><strong>Inquiry Type:</strong> <span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 14px;">${cleanData.inquiry_type}</span></p>
                </div>
                <h3 style="color: #111827; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Message</h3>
                <div style="color: #4b5563; white-space: pre-wrap; background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">${cleanData.message}</div>
              </div>
              <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">This is an automated notification from your ShedBody platform.</p>
              </div>
            </div>
          </div>
        `,
      });

      // Auto-reply to user email
      await transporter.sendMail({
        from: `"ShedBody" <${process.env.SMTP_USER}>`,
        to: cleanData.email,
        subject: "We received your message | ShedBody",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #222222;">
                    <tr>
                      <td style="padding: 30px; text-align: center; border-bottom: 1px solid #222222;">
                        <h2 style="color: #10b981; margin: 0; font-size: 24px; letter-spacing: 1px;">SHEDBODY</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px; line-height: 1.6;">
                        <p style="margin-top: 0; font-size: 16px;">Hi ${cleanData.name},</p>
                        <p style="font-size: 16px;">Thanks for reaching out to <strong>ShedBody</strong>.</p>
                        <p style="font-size: 16px;">We've received your request regarding: <strong style="color: #10b981;">${cleanData.inquiry_type}</strong></p>
                        <p style="font-size: 16px;">Our team is reviewing your message and will get back to you within <strong>24-48 hours</strong>.</p>
                        
                        <div style="margin: 25px 0; padding: 20px; background-color: #1a1a1a; border-radius: 8px; border-left: 4px solid #10b981;">
                          <p style="margin: 0 0 10px 0; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px;">Your Message:</p>
                          <p style="margin: 0; font-size: 15px; color: #d1d5db; white-space: pre-wrap;">${cleanData.message}</p>
                        </div>
                        
                        <p style="font-size: 16px; margin-bottom: 5px;">Stay consistent,</p>
                        <p style="font-size: 16px; margin-top: 0; font-weight: bold; color: #10b981;">The ShedBody Team</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 30px; background-color: #0d0d0d; border-top: 1px solid #222222; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #666666;">
                          If you didn't send this request, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (mailError) {
      // Do not break API if email fails
      console.error("Mail Error:", mailError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
