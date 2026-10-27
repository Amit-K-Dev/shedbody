# CF-6 R2 Storage Security Model

## 1. Overview
As part of the migration away from Supabase (which provides Row Level Security directly within its storage layer), all Cloudflare R2 storage interactions must now enforce tenant isolation at the application layer.

## 2. Abstraction Strategy
Direct usage of `@aws-sdk/client-s3` exposes raw keys and buckets to the application code, which risks directory traversal and unauthorized cross-tenant data access.

To mitigate this, all R2 operations are wrapped in domain-specific repositories:
- `StorageRepository` (Private/Tenant-Isolated)
- `PublicStorageRepository` (Publicly Readable, Admin-Writable)

## 3. Tenant Isolation Pattern

### Private Objects
In `StorageRepository`, the `userId` is injected at instantiation. All file paths are strictly prefixed to enforce isolation:

```javascript
_buildKey(folder, fileName) {
  if (folder.includes("..") || fileName.includes("..") || folder.startsWith("/") || fileName.startsWith("/")) {
    throw new Error("Invalid path segments in storage key");
  }
  return `users/${this.userId}/${folder}/${fileName}`;
}
```

**Security Guarantees:**
1. A user can only upload to `users/{userId}/*`.
2. A user can only delete or retrieve metadata for objects within `users/{userId}/*`.
3. Malicious paths (e.g. `../other-user/file.jpg`) are actively blocked before reaching the R2 API.

### Public Objects (e.g. Blog Assets, Global UI Graphics)
In `PublicStorageRepository`, objects are isolated to the `public/` prefix.

**Security Guarantees:**
1. Uploads to the public namespace are strictly reserved for users with an `admin` role. The repository requires an `isAdmin` boolean flag on initialization.
2. Deletions from the public namespace require `admin` privileges.

## 4. Better Auth Integration
To use the `StorageRepository`, the endpoint or action must first validate the user's session using Better Auth:

```javascript
// Example Next.js Route Handler / API
const session = await auth.api.getSession({ headers: req.headers });
if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
}

// Instantiate storage with the authenticated user ID
const storage = new StorageRepository(session.user.id);
await storage.upload(file, "profile-pictures");
```

## 5. R2 Bucket Configuration Requirements
1. **Public Read Access**: R2 buckets can be configured to allow public reads for certain prefixes, or objects can be fetched via signed URLs. For ShedBody, public image assets (like blog images) must be accessible via `NEXT_PUBLIC_R2_URL`.
2. **CORS**: Must be configured on the R2 bucket to allow `GET` from the application's origin domains if fetching directly via JS, though Next.js image optimization or standard HTTP GETs will proxy this transparently in most cases.

## 6. Migration Constraints
- No production files from Supabase Storage have been moved yet.
- The repository logic handles new uploads locally/staging.
- Final cutover of binary assets (ETL) will occur in Phase CF-11 (Data Migration).
