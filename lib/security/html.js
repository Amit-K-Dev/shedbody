const SCRIPT_LIKE_BLOCKS =
  /<(script|style|object|embed|base|form|input|button|textarea|select|option|meta|link)\b[\s\S]*?<\/\1>/gi;
const SELF_CLOSING_DANGEROUS =
  /<(script|style|object|embed|base|form|input|button|textarea|select|option|meta|link)\b[^>]*\/?>/gi;
const EVENT_HANDLER_ATTR = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URLS =
  /\s+(href|src)\s*=\s*(["'])\s*(javascript:|data:text\/html|vbscript:)[\s\S]*?\2/gi;
const IFRAME_TAG = /<iframe\b([^>]*)>/gi;

const allowedIframeHosts = [
  "www.instagram.com",
  "www.facebook.com",
  "assets.pinterest.com",
];

function sanitizeIframe(match, attrs) {
  const srcMatch = attrs.match(/\s+src\s*=\s*(["'])(.*?)\1/i);
  if (!srcMatch) return "";

  try {
    const url = new URL(srcMatch[2]);
    if (!allowedIframeHosts.includes(url.hostname)) return "";
  } catch {
    return "";
  }

  return match
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+sandbox\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/>$/, ' sandbox="allow-scripts allow-same-origin">');
}

export function sanitizeArticleHtml(html) {
  if (!html) return "";

  return html
    .replace(SCRIPT_LIKE_BLOCKS, "")
    .replace(SELF_CLOSING_DANGEROUS, "")
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(DANGEROUS_URLS, "")
    .replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(IFRAME_TAG, sanitizeIframe);
}

export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
