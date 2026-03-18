import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const baseFolder = path.resolve("public/uploads");

// recursive upload
async function uploadFolder(folderPath) {
  const items = fs.readSync(folderPath);

  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadFolder(fullPath);
    } else {
      try {
        // keep folder structure
        const relativePath = path.relative(baseFolder, fullPath);
        const publicId = relativePath.replace(/\.[^/.]+$/, ""); // remove extension

        const result = await cloudinary.upload(fullPath, {
          folder: "shedbody",
          public_id: publicId,
          overwrite: false, // prevents overwrite
        });

        console.log("Uploaded:", result.secure_url);
      } catch (err) {
        console.log("Error:", fullPath, err.message);
      }
    }
  }
}

uploadFolder(baseFolder);
