import fs from "fs";
import path from "path";
import mime from "mime-types";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: ".env.local" });

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const baseFolder = path.resolve("public/uploads");

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });

  return results;
}

async function uploadFile(filePath) {
  const relativePath = path.relative(baseFolder, filePath).replace(/\\/g, "/");
  const fileBuffer = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: relativePath,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  console.log("✅", relativePath);
}

async function uploadAll() {
  const files = getAllFiles(baseFolder);
  console.log(`Total files: ${files.length}`);

  for (const file of files) {
    try {
      await uploadFile(file);
    } catch (err) {
      console.error("❌", file, err.message);
    }
  }

  console.log("Done");
}

uploadAll();
