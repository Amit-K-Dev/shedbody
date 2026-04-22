import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `post-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("blog-images").getPublicUrl(filePath);

  return publicUrl;
}
