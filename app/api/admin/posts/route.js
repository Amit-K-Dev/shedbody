import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser.js";

export async function GET(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
      const { PostRepository } = await import("@/lib/repositories/PostRepository.js");
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const postRepo = new PostRepository(adapter);
      const profileRepo = new ProfileRepository(adapter);

      const publicProfile = await profileRepo.getPublicProfile(user.id);
      if (publicProfile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      if (id) {
        const data = await postRepo.adapter.queryOne(`SELECT * FROM posts WHERE id = ? LIMIT 1`, [id]);
        if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true, data }, { status: 200 });
      } else {
        const data = await postRepo.adapter.query(
          `SELECT id, title, category, status, published_at, updated_at FROM posts ORDER BY updated_at DESC LIMIT 100`
        );
        return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
      }
    } catch (d1Error) {
      console.warn("D1 Fetch Error (Admin Posts) fallback to Supabase:", d1Error?.message || d1Error);
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      // Fallback Supabase Role Check
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Fallback to Supabase
      if (id) {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) {
          console.error("API Fetch Error (Admin Posts):", error);
          return NextResponse.json({ success: false, error: "Failed to fetch post" }, { status: 500 });
        }
        return NextResponse.json({ success: true, data }, { status: 200 });
      } else {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, category, status, published_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(100);

        if (error) {
          console.error("API Fetch Error (Admin Posts):", error);
          return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: data || [] }, { status: 200 });
      }
    }
  } catch (err) {
    console.error("API Route Crash:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postData = await request.json();

    try {
      const { PostRepository } = await import("@/lib/repositories/PostRepository.js");
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const postRepo = new PostRepository(adapter);
      const profileRepo = new ProfileRepository(adapter);

      const publicProfile = await profileRepo.getPublicProfile(user.id);
      if (publicProfile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Slug collision check
      const existing = await postRepo.getPostBySlug(postData.slug);
      if (existing) {
        return NextResponse.json({ success: false, error: "Slug already exists." }, { status: 409 });
      }
      
      postData.author_id = user.id; // Force author
      const newPostId = await postRepo.upsertPost(postData);
      return NextResponse.json({ success: true, id: newPostId }, { status: 201 });
    } catch (d1Error) {
      console.warn("D1 Insert Error (Admin Posts) fallback to Supabase:", d1Error?.message || d1Error);
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      // Fallback Supabase Role Check
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Fallback to Supabase
      // Slug check
      const { data: existingSlug } = await supabase.from("posts").select("id").eq("slug", postData.slug).maybeSingle();
      if (existingSlug) {
        return NextResponse.json({ success: false, error: "Slug already exists." }, { status: 409 });
      }

      const { data, error } = await supabase.from("posts").insert([{ ...postData, author_id: user.id }]).select();
      if (error) {
        console.error("API Insert Error (Admin Posts):", error);
        return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data[0].id }, { status: 201 });
    }
  } catch (err) {
    console.error("API Route Crash (POST):", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const postData = await request.json();
    const id = postData.id;
    if (!id) return NextResponse.json({ error: "Missing post ID" }, { status: 400 });

    try {
      const { PostRepository } = await import("@/lib/repositories/PostRepository.js");
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const postRepo = new PostRepository(adapter);
      const profileRepo = new ProfileRepository(adapter);

      const publicProfile = await profileRepo.getPublicProfile(user.id);
      if (publicProfile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Slug collision check
      const existing = await postRepo.getPostBySlug(postData.slug);
      if (existing && existing.id !== id) {
        return NextResponse.json({ success: false, error: "Slug already exists." }, { status: 409 });
      }
      
      postData.author_id = user.id; // Force author
      const newPostId = await postRepo.upsertPost(postData);
      return NextResponse.json({ success: true, id: newPostId }, { status: 200 });
    } catch (d1Error) {
      console.warn("D1 Update Error (Admin Posts) fallback to Supabase:", d1Error?.message || d1Error);
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      // Fallback Supabase Role Check
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Fallback to Supabase
      // Slug check
      const { data: existingSlug } = await supabase.from("posts").select("id").eq("slug", postData.slug).maybeSingle();
      if (existingSlug && existingSlug.id !== id) {
        return NextResponse.json({ success: false, error: "Slug already exists." }, { status: 409 });
      }

      const { data, error } = await supabase.from("posts").update({ ...postData, author_id: user.id }).eq("id", id).select();
      if (error) {
        console.error("API Update Error (Admin Posts):", error);
        return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: data[0].id }, { status: 200 });
    }
  } catch (err) {
    console.error("API Route Crash (PUT):", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    try {
      const { PostRepository } = await import("@/lib/repositories/PostRepository.js");
      const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
      const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
      const adapter = new D1Adapter();
      adapter._checkDb();
      const postRepo = new PostRepository(adapter);
      const profileRepo = new ProfileRepository(adapter);

      const publicProfile = await profileRepo.getPublicProfile(user.id);
      if (publicProfile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      await postRepo.deletePost(id);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (d1Error) {
      console.warn("D1 Delete Error (Admin Posts) fallback to Supabase:", d1Error?.message || d1Error);
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      // Fallback Supabase Role Check
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      // Fallback to Supabase
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) {
        console.error("API Delete Error (Admin Posts):", error);
        return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (err) {
    console.error("API Route Crash:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
