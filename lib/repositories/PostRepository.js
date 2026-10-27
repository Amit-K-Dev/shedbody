import { BaseRepository } from "./BaseRepository.js";
import crypto from "crypto";

/**
 * D1 Repository for Posts domain.
 */
export class PostRepository extends BaseRepository {
  constructor(adapter) {
    super(adapter, "posts");
  }

  /**
   * Fetches published posts for API or RSS.
   */
  async getPublishedPosts(limit = 100) {
    const sql = `
      SELECT id, title, slug, category, excerpt, keywords, status, published_at, updated_at, views, seo_desc, featured_image
      FROM posts
      WHERE status IN ('published', 'Published', 'publish') 
         OR status IS NULL
      AND title IS NOT NULL
      AND slug IS NOT NULL
      AND category IS NOT NULL
      AND published_at IS NOT NULL
      ORDER BY published_at DESC
      LIMIT ?
    `;
    const data = await this.adapter.query(sql, [limit]);
    return data || [];
  }

  /**
   * Fetches published posts for sitemap generation.
   */
  async getPublishedPostsForSitemap() {
    const sql = `
      SELECT slug, category, published_at, updated_at, status
      FROM posts
      WHERE status IN ('published', 'Published', 'publish') 
         OR status IS NULL
      AND slug IS NOT NULL
      AND category IS NOT NULL
      AND published_at IS NOT NULL
    `;
    const data = await this.adapter.query(sql);
    return data || [];
  }

  /**
   * Fetches published posts for image sitemap.
   */
  async getPublishedPostsForImageSitemap() {
    const sql = `
      SELECT slug, title, seo_title, category, featured_image, content, status
      FROM posts
      WHERE status IN ('published', 'Published', 'publish')
    `;
    const data = await this.adapter.query(sql);
    return data || [];
  }

  /**
   * Fetches published posts for news sitemap.
   */
  async getRecentPublishedPostsForNewsSitemap(twoDaysAgoStr) {
    const sql = `
      SELECT slug, category, title, published_at
      FROM posts
      WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
        AND slug IS NOT NULL
        AND category IS NOT NULL
        AND title IS NOT NULL
        AND published_at IS NOT NULL
        AND published_at >= ?
      ORDER BY published_at DESC
    `;
    const data = await this.adapter.query(sql, [twoDaysAgoStr]);
    return data || [];
  }

  /**
   * Records a post view.
   */
  async recordPostView(postId, userHash, viewedAtStr) {
    const oneDayAgo = new Date(new Date(viewedAtStr).getTime() - 24 * 60 * 60 * 1000).toISOString();
    
    const recentView = await this.adapter.query(`
      SELECT id FROM post_views 
      WHERE post_id = ? AND user_hash = ? AND viewed_at >= ?
    `, [postId, userHash, oneDayAgo]);
    
    if (recentView && recentView.length > 0) {
      const post = await this.adapter.query(`SELECT views FROM posts WHERE id = ?`, [postId]);
      return { success: true, counted: false, fallback: false, views: post?.[0]?.views || 0 };
    }

    await this.adapter.execute(`
      INSERT INTO post_views (post_id, user_hash, viewed_at)
      VALUES (?, ?, ?)
    `, [postId, userHash, viewedAtStr]);

    await this.adapter.execute(`
      UPDATE posts SET views = views + 1 WHERE id = ?
    `, [postId]);

    const post = await this.adapter.query(`SELECT views FROM posts WHERE id = ?`, [postId]);
    return { success: true, counted: true, fallback: false, views: post?.[0]?.views || 0 };
  }

  async getPost(slug, category = null) {
    let sql = `SELECT id, title, slug, content, featured_image, processed_content, excerpt, category, published_at, views, updated_at, seo_title, seo_desc, keywords 
               FROM posts 
               WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
               AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL
               AND slug LIKE ?`;
    const params = [slug.trim()];
    if (category) {
      sql += ` AND category LIKE ?`;
      params.push(category.trim());
    }
    sql += ` LIMIT 1`;
    return await this.adapter.queryOne(sql, params);
  }

  async getRedirectUrl(oldUrl) {
    const sql = `SELECT new_url FROM redirects WHERE old_url = ? LIMIT 1`;
    const result = await this.adapter.queryOne(sql, [oldUrl]);
    return result?.new_url || null;
  }

  async getRelatedPosts(category, slug) {
    const sql = `SELECT id, title, slug, category, featured_image, excerpt, content 
                 FROM posts 
                 WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
                 AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL
                 AND category = ? AND slug != ? 
                 ORDER BY published_at DESC LIMIT 3`;
    return await this.adapter.query(sql, [category, slug]);
  }

  async getCategories() {
    const sql = `SELECT DISTINCT category FROM posts WHERE status = 'published' AND category IS NOT NULL`;
    const data = await this.adapter.query(sql);
    const unique = (data || []).map(row => row.category).filter(Boolean);
    return ["all", ...unique];
  }

  async getTrendingPosts(limit = 6) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const sql = `SELECT id, title, slug, excerpt, content, featured_image, category, views, updated_at, published_at, seo_title, seo_desc, keywords 
                 FROM posts 
                 WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
                 AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL
                 AND updated_at >= ? 
                 ORDER BY views DESC LIMIT ?`;
    let data = await this.adapter.query(sql, [sevenDaysAgo, limit]);
    
    if (!data || data.length === 0) {
      const fallbackSql = `SELECT id, title, slug, excerpt, content, featured_image, category, views, updated_at, published_at, seo_title, seo_desc, keywords 
                           FROM posts 
                           WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
                           AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL
                           ORDER BY views DESC LIMIT ?`;
      data = await this.adapter.query(fallbackSql, [limit]);
    }
    return data || [];
  }

  async getPopularPosts(limit = 6) {
    const sql = `SELECT id, title, slug, excerpt, content, featured_image, category, views, updated_at, published_at, seo_title, seo_desc, keywords 
                 FROM posts 
                 WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
                 AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL
                 ORDER BY views DESC LIMIT ?`;
    return await this.adapter.query(sql, [limit]) || [];
  }

  async getAllPosts(category, page = 1, limit = 9, sort = "latest", search = "") {
    const offset = (page - 1) * limit;
    let sql = `SELECT id, title, slug, featured_image, excerpt, content, published_at, category, views, updated_at, seo_title, seo_desc, keywords 
               FROM posts 
               WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
               AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL`;
    
    let countSql = `SELECT COUNT(*) as total FROM posts 
                    WHERE (status IN ('published', 'Published', 'publish') OR status IS NULL)
                    AND title IS NOT NULL AND slug IS NOT NULL AND category IS NOT NULL AND published_at IS NOT NULL`;
    
    const params = [];
    if (search && search.trim() !== "") {
      sql += ` AND title LIKE ?`;
      countSql += ` AND title LIKE ?`;
      params.push(`%${search}%`);
    }
    if (category && category !== "all") {
      sql += ` AND category = ?`;
      countSql += ` AND category = ?`;
      params.push(category);
    }
    
    if (sort === "popular") {
      sql += ` ORDER BY views DESC`;
    } else if (sort === "oldest") {
      sql += ` ORDER BY published_at ASC`;
    } else {
      sql += ` ORDER BY published_at DESC`;
    }
    
    sql += ` LIMIT ? OFFSET ?`;
    const dataParams = [...params, limit, offset];
    
    const [data, countResult] = await Promise.all([
      this.adapter.query(sql, dataParams),
      this.adapter.queryOne(countSql, params)
    ]);
    
    return { posts: data || [], total: countResult?.total || 0 };
  }

  async getAdminStats() {
    const sql = `SELECT COUNT(id) as total_posts, SUM(views) as total_views FROM posts`;
    const result = await this.adapter.queryOne(sql);
    const totalPosts = result?.total_posts || 0;
    const totalViews = result?.total_views || 0;
    const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
    return { totalPosts, totalViews, avgViews };
  }

  async getAdminRecentPosts(limit = 5) {
    const sql = `SELECT id, title, views, category, status, published_at, updated_at 
                 FROM posts ORDER BY updated_at DESC LIMIT ?`;
    return await this.adapter.query(sql, [limit]) || [];
  }

  async getAdminTopPosts(limit = 5) {
    const sql = `SELECT id, title, slug, views, category, published_at 
                 FROM posts WHERE status = 'published' ORDER BY views DESC LIMIT ?`;
    return await this.adapter.query(sql, [limit]) || [];
  }

  /**
   * Deletes a post permanently.
   * Note: This does not use BaseRepository's delete method because posts don't have a user_id.
   * @param {string} postId 
   */
  async deletePost(postId) {
    const sql = `DELETE FROM posts WHERE id = ?`;
    await this.adapter.execute(sql, [postId]);
    return true;
  }

  async getExpertPosts(categories, limit = 6) {
    if (!categories || categories.length === 0) return [];
    const placeholders = categories.map(() => '?').join(',');
    const sql = `SELECT id, title, slug, category, excerpt, published_at, views, featured_image 
                 FROM posts 
                 WHERE category IN (${placeholders})
                 AND title IS NOT NULL 
                 AND slug IS NOT NULL 
                 AND published_at IS NOT NULL
                 ORDER BY published_at DESC LIMIT ?`;
    return await this.adapter.query(sql, [...categories, limit]) || [];
  }

  /**
   * Finds a post by its exact slug.
   */
  async getPostBySlug(slug) {
    const sql = `SELECT * FROM posts WHERE slug = ? LIMIT 1`;
    return await this.adapter.queryOne(sql, [slug]);
  }

  /**
   * Inserts or updates a post.
   */
  async upsertPost(postData) {
    const id = postData.id || crypto.randomUUID();
    const now = new Date().toISOString();
    
    const existing = await this.adapter.queryOne(`SELECT id FROM posts WHERE id = ?`, [id]);
    
    if (existing) {
      await this.adapter.execute(`
        UPDATE posts SET
          title = ?,
          slug = ?,
          excerpt = ?,
          content = ?,
          category = ?,
          status = ?,
          featured_image = ?,
          seo_title = ?,
          seo_desc = ?,
          keywords = ?,
          author_id = ?,
          updated_at = ?
        WHERE id = ?
      `, [
        postData.title,
        postData.slug,
        postData.excerpt || null,
        postData.content,
        postData.category,
        postData.status || 'draft',
        postData.featured_image || null,
        postData.seo_title || null,
        postData.seo_desc || null,
        postData.keywords || null,
        postData.author_id || null,
        now,
        id
      ]);
      return id;
    } else {
      await this.adapter.execute(`
        INSERT INTO posts (
          id, title, slug, excerpt, content, category, status,
          featured_image, seo_title, seo_desc, keywords, author_id,
          published_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        postData.title,
        postData.slug,
        postData.excerpt || null,
        postData.content,
        postData.category,
        postData.status || 'draft',
        postData.featured_image || null,
        postData.seo_title || null,
        postData.seo_desc || null,
        postData.keywords || null,
        postData.author_id || null,
        postData.published_at || now,
        now
      ]);
      return id;
    }
  }

  /**
   * Records article feedback from a user
   * @param {number} postId 
   * @param {string} userHash 
   * @param {string} vote 'yes' or 'no'
   * @param {string|null} reason 
   * @param {string|null} note 
   */
  async recordArticleFeedback(postId, userHash, vote, reason = null, note = null) {
    if (!postId || !userHash || !vote) {
      throw new Error("Missing required feedback parameters");
    }

    // Insert or update feedback
    await this.adapter.execute(
      `INSERT INTO article_feedback (post_id, user_hash, vote, reason, note)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (post_id, user_hash) DO UPDATE SET 
         vote = excluded.vote,
         reason = excluded.reason,
         note = excluded.note`,
      [postId, userHash, vote, reason, note]
    );

    // Get aggregated counts
    const counts = await this.adapter.query(
      `SELECT 
         SUM(CASE WHEN vote = 'yes' THEN 1 ELSE 0 END) as yes_count,
         SUM(CASE WHEN vote = 'no' THEN 1 ELSE 0 END) as no_count
       FROM article_feedback 
       WHERE post_id = ?`,
      [postId]
    );
    
    const row = counts?.[0] || { yes_count: 0, no_count: 0 };

    return {
      yes_count: row.yes_count || 0,
      no_count: row.no_count || 0,
      user_vote: vote
    };
  }
}
