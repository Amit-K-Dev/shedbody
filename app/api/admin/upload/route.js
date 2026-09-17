import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2 } from "@/lib/r2/upload";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const supabase = await createClient();

    // 1. Auth Check: Ensure user is logged in
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // 2. Admin Check: Query public.profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }

    // 3. Parse FormData
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { success: false, error: "Invalid form data." },
        { status: 400 },
      );
    }

    const file = formData.get("file");

    // 4. Validate File
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No valid file uploaded." },
        { status: 400 },
      );
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image uploads are allowed." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image must be under 5 MB." },
        { status: 400 },
      );
    }

    // 5. Upload to R2
    const uploadedUrl = await uploadToR2(file, "blog");
    if (!uploadedUrl) {
      throw new Error("uploadToR2 returned null or undefined.");
    }

    // 6. Return Public URL
    return NextResponse.json(
      { success: true, url: uploadedUrl },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error." },
      { status: 500 },
    );
  }
}
