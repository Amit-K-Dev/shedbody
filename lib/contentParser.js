// Clean WordPress Content
export function cleanWordPressContent(html) {
  if (!html) return "";

  let cleaned = html;

  // Remove WordPress Gutenberg block comments
  cleaned = cleaned.replace(/<!--\s*\/?wp:[^>]+-->/g, "");

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
    /https?:\/\/www\.instagram\.com\/p\/([A-Za-z0-9_-]+)\//g,
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
    /https?:\/\/www\.facebook\.com\/[^\\s"]+/g,
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
    /https?:\/\/.pinterest\.com\/pin\/(\d+)\//g,
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

  // Remove extra empty paragrapghs
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");

  return cleaned;
}

// Inject Inline Related Articles
export function injectInlineRelated(html, posts) {
  if (!html || !posts || posts.length === 0) return html;

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
          <a href="/${post.category}/${post.slug}" class="text-green-400 hover:text-green-300 transition">
            ${post.title}
          </a>
        </li>
        `,
        )
        .join("")}
    </ul>
  </div>
  `;

  const headings = html.split("</h2>");

  if (headings.length > 2) {
    headings.splice(2, 0, relatedHTML);
    return headings.join("</h2>");
  }

  return html + relatedHTML;
}

// Image Optimization
export function optimizeImages(html) {
  if (!html) return "";

  return html.replace(/<img[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    return `
      <img 
        src="${src}" 
        loading="lazy" 
        decoding="async" 
        class="rounded-lg w-full my-6"
      />
      `;
  });
}
