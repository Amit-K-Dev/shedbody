const AMAZON_HOST_RE =
  /(?:^|\.)amazon\.(?:com|in|co\.uk|ca|de|fr|it|es|com\.au|co\.jp|nl|sg|ae|sa|se|pl|com\.mx|com\.br|com\.tr|cn|eg|be)$/i;
const AMAZON_SHORT_HOST_RE = /(?:^|\.)amzn\.to$/i;
const AMAZON_TEXT_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:amzn\.to|amazon\.(?:com|in|co\.uk|ca|de|fr|it|es|com\.au|co\.jp|nl|sg|ae|sa|se|pl|com\.mx|com\.br|com\.tr|cn|eg|be))(?:[/?#"'<>\s]|$)/i;
const URL_RE = /https?:\/\/[^\s"'<>]+/gi;

function isAmazonHost(hostname) {
  return AMAZON_SHORT_HOST_RE.test(hostname) || AMAZON_HOST_RE.test(hostname);
}

export function hasAmazonAffiliateLink(content = "") {
  if (!content) return false;
  if (AMAZON_TEXT_RE.test(content)) return true;

  const urls = content.match(URL_RE) || [];

  return urls.some((url) => {
    try {
      return isAmazonHost(new URL(url).hostname);
    } catch {
      return false;
    }
  });
}
