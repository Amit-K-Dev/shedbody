import { uploadToR2 } from "@/lib/r2/upload";

export async function uploadImage(file, folder = "blog") {
  if (!file) return null;

  try {
    return await uploadToR2(file, folder);
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}
