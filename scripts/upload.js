import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const baseFolder = path.resolve("public/uploads");

// get all files
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });

  return results;
}

// parallel upload
async function uploadAll() {
  const files = getAllFiles(baseFolder);
  console.log(`Total files: ${files.length}`);

  const limit = 10; // 🔥 speed control

  for (let i = 0; i < files.length; i += limit) {
    const batch = files.slice(i, i + limit);

    await Promise.all(
      batch.map(async (filePath) => {
        try {
          const relativePath = path.relative(baseFolder, filePath);
          const publicId = relativePath
            .replace(/\.[^/.]+$/, "")
            .replace(/\\/g, "/"); // 🔥 fix for Windows paths

          const result = await cloudinary.uploader.upload(filePath, {
            folder: "shedbody",
            public_id: publicId,
            overwrite: false,
          });

          console.log("✅", result.secure_url);
        } catch (err) {
          console.error("❌", filePath, err.message);
        }
      }),
    );
  }
}

uploadAll();
