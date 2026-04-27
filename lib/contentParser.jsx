// Clean WordPress Content
import {
  R2_PUBLIC_URL,
  getOptimizedImageUrl,
  normalizeImageUrl,
} from "@/lib/utils/imageUrl";

export function cleanWordPressContent(html) {
  if (!html) return "";

  let cleaned = html;

  // Remove WordPress Gutenberg block comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Move legacy Cloudinary image URLs to the R2 public bucket.
  cleaned = cleaned.replace(
    /https?:\/\/?res\.cloudinary\.co(?:m)?/gi,
    R2_PUBLIC_URL,
  );

  // Remove Ad Inserter shortcodes
  cleaned = cleaned.replace(/\[adinserter\s+[^\]]+\]/g, "");

  // Remove Empty Figures
  cleaned = cleaned.replace(/<figure[^>]*>\s*<\/figure>/g, "");

  // Remove figures that only contain captions
  cleaned = cleaned.replace(
    /<figure[^>]*>\s*<figcaption[^>]*>.*?<\/figcaption>\s*<\/figure>/gs,
    "",
  );

  // Instagram Embeds
  cleaned = cleaned.replace(
    /(?<!["'=])https?:\/\/www\.instagram\.com\/p\/([A-Za-z0-9_-]+)\/?/g,
    (match, id) => {
      return `
      <div class="my-6 flex justify-center">
        <iframe 
          src="https://www.instagram.com/p/${id}/embed" 
          width="540" 
          height="620" 
          loading="lazy" 
          frameborder="0" 
          class="rounded-lg" 
          ></iframe>
      </div>
      `;
    },
  );

  // Facebook Embeds
  cleaned = cleaned.replace(
    /(?<!["'=])https?:\/\/www\.facebook\.com\/[^\\s"]+/g,
    (url) => {
      return `
      <div class="my-8 flex justify-center">
        <iframe 
          src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&width=500" 
          width="500" 
          height="680" 
          style="border:none;overflow:hidden" 
          scrolling="no" 
          frameborder="0" 
          loading="lazy" 
          ></iframe>
      </div>
      `;
    },
  );

  // Pinterest Embeds
  cleaned = cleaned.replace(
    /(?<!["'=])https?:\/\/.pinterest\.com\/pin\/(\d+)\//g,
    (match, id) => {
      return `
      <div class="my-8 flex justify-center">
        <iframe 
          src="https://assets.pinterest.com/ext/embed.html?id=${id}" 
          width="345" 
          height="550" 
          frameborder="0" 
          loading="lazy" 
          ></iframe>
      </div>
      `;
    },
  );

  // Remove extra empty paragraphs safely
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");

  return cleaned;
}

// Inject Inline Related Articles
export function injectInlineRelated(html, posts) {
  if (!html || !posts || posts.length === 0) return html;

  // UI Block (Theme update to emerald)
  const relatedHTML = `
  <div class="my-10 border border-zinc-800 rounded-lg p-6 bg-zinc-900/40">
    <p class="font-semibold mb-4 text-white">
      You may also like
    </p>
    <ul class="space-y-2">
      ${posts
        .map(
          (post) => `
        <li>
          <a href="/${post.category}/${post.slug}" class="text-emerald-400 hover:text-emerald-300 transition">
            ${post.title}
          </a>
        </li>
        `,
        )
        .join("")}
    </ul>
  </div>
  `;

  let h2Count = 0;
  return html.replace(/<\/h2>/gi, (match) => {
    h2Count++;
    if (h2Count === 2) {
      return match + relatedHTML;
    }
    return match;
  });
}

// Image Optimization
export function optimizeImages(html) {
  if (!html) return "";

  return html.replace(/<img([^>]+)>/gi, (match, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);

    if (!srcMatch) return match;

    const src = normalizeImageUrl(srcMatch[1]);
    const optimizedSrc = getOptimizedImageUrl(src);

    const alt = altMatch ? altMatch[1] : "";

    return `
      <img 
        src="${optimizedSrc}"
        alt="${alt}" 
        loading="lazy" 
        decoding="async" 
        class="rounded-lg block mx-auto w-auto max-w-full h-auto max-h-[82vh] object-contain my-6"
      />
      `;
  });
}
