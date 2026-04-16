"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function logout() {
  const supabase = await createClient();
  const headerList = await headers();
  const pathname = headerList.get("referer") || "/";

  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Logout failed:", err);
  }

  revalidatePath("/", "layout");

  const isPrivatePage =
    pathname.includes("/dashboard") ||
    pathname.includes("/profile") ||
    pathname.includes("/plans") ||
    pathname.includes("/start");

  if (isPrivatePage) {
    redirect("/login");
  } else {
    redirect(pathname);
  }
}
