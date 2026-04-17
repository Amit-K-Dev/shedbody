import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { name, email, inquiryType, message, honeypot } = body;

    // Spam protection
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validation
    if (!name || !email || !message || !inquiryType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Basic sanitization (Clean data)
    const cleanData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      inquiry_type: inquiryType,
      message: message.trim(),
    };

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
          <h2>New Contact Submission</h2>
          <p><strong>Name:</strong> ${cleanData.name}</p>
          <p><strong>Email:</strong> ${cleanData.email}</p>
          <p><strong>Type:</strong> ${cleanData.inquiry_type}</p>
          <p><strong>Message:</strong></p>
          <p>${cleanData.message}</p>
        `,
      });

      // Auto-reply to user
      await transporter.sendMail({
        from: `"ShedBody" <${process.env.SMTP_USER}>`,
        to: cleanData.email,
        subject: "We received your message | ShedBody",
        html: `
          <p>Hi ${cleanData.name},</p>
          <p>Thanks for reaching out to <strong>ShedBody</strong>.</p>
          <p>We've received your message regarding <strong>${cleanData.inquiry_type}</strong>.</p>
          <p>Our team will get back to you within 24-48 hours.</p>
          <br/>
          <p>Stay consistent,</p>
          <p><strong>ShedBody Team</strong></p>
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
