import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// We construct the S3 client lazily or immediately
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL;

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export class StorageRepository {
  constructor(userId) {
    if (!userId || typeof userId !== "string") {
      throw new Error("StorageRepository requires a valid userId");
    }
    this.userId = userId;
  }

  /**
   * Generates a safe, isolated key for the user.
   */
  _buildKey(folder, fileName) {
    // Basic validation to prevent directory traversal
    if (folder.includes("..") || fileName.includes("..") || folder.startsWith("/") || fileName.startsWith("/")) {
      throw new Error("Invalid path segments in storage key");
    }
    return `users/${this.userId}/${folder}/${fileName}`;
  }

  /**
   * Uploads a file to the user's isolated namespace.
   * @param {File|Blob} file 
   * @param {string} folder 
   */
  async upload(file, folder = "uploads") {
    if (!file) throw new Error("File is required");

    const ext = file.name ? file.name.split(".").pop()?.toLowerCase() : "bin";
    const cleanName = file.name ? slugify(file.name) : "upload";
    const fileName = `${cleanName}-${Date.now()}.${ext}`;
    const key = this._buildKey(folder, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        Metadata: {
          ownerId: this.userId
        }
      }),
    );

    return {
      key,
      url: `${PUBLIC_URL}/${key}`,
    };
  }

  /**
   * Deletes an object if it belongs to the user.
   */
  async delete(key) {
    // Prevent cross-user deletion by ensuring the key starts with the user's namespace
    if (!key.startsWith(`users/${this.userId}/`)) {
      throw new Error("Unauthorized to delete this object or malformed key");
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    
    return true;
  }

  /**
   * Retrieves object metadata, verifying ownership.
   */
  async getMetadata(key) {
    if (!key.startsWith(`users/${this.userId}/`)) {
      throw new Error("Unauthorized to read this object or malformed key");
    }

    try {
      const response = await s3.send(
        new HeadObjectCommand({
          Bucket: BUCKET,
          Key: key,
        })
      );
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata
      };
    } catch (e) {
      if (e.name === "NotFound") return null;
      throw e;
    }
  }
}

export class PublicStorageRepository {
  // Read-only for non-admins, but we can allow admin uploads
  constructor(isAdmin = false) {
    this.isAdmin = isAdmin;
  }

  _buildKey(folder, fileName) {
    if (folder.includes("..") || fileName.includes("..")) {
      throw new Error("Invalid path segments in storage key");
    }
    return `public/${folder}/${fileName}`;
  }

  async upload(file, folder = "uploads") {
    if (!this.isAdmin) throw new Error("Only admins can upload public assets directly");
    if (!file) throw new Error("File is required");

    const ext = file.name ? file.name.split(".").pop()?.toLowerCase() : "bin";
    const cleanName = file.name ? slugify(file.name) : "upload";
    const fileName = `${cleanName}-${Date.now()}.${ext}`;
    const key = this._buildKey(folder, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return {
      key,
      url: `${PUBLIC_URL}/${key}`,
    };
  }

  async delete(key) {
    if (!this.isAdmin) throw new Error("Only admins can delete public assets");
    if (!key.startsWith(`public/`)) {
      throw new Error("Invalid public key");
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    return true;
  }
}
