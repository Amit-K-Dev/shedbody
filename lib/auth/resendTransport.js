/**
 * lib/auth/resendTransport.js
 *
 * Cloudflare Worker-compatible HTTP transport for Resend.
 * Uses global `fetch` (runtime-neutral, no Node TCP sockets).
 * Strictly enforces defensive error handling and redaction of secrets.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'ShedBody <auth@shedbody.com>';
const DEFAULT_APP_NAME = 'ShedBody';
const DEFAULT_EXPIRY_MINUTES = 10;

/**
 * Basic RFC 5322-compliant email syntax validation regex.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates an email address format.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Renders an accessible, responsive HTML email for ShedBody Magic Link authentication.
 *
 * @param {object} params
 * @param {string} params.url - Magic link verification URL
 * @param {string} params.email - Recipient email address
 * @param {string} [params.appName='ShedBody']
 * @param {number} [params.expiresInMinutes=10]
 * @returns {string} HTML string
 */
export function renderMagicLinkEmailHtml({
  url,
  email,
  appName = DEFAULT_APP_NAME,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}) {
  const safeUrl = String(url).replace(/"/g, '&quot;');
  const safeEmail = String(email || '').replace(/[&<>"']/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${appName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1f2937; text-align: center;">
              <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #10b981;">${appName}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;">Sign in to your account</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #9ca3af;">
                We received a request to sign in to ${appName} with <strong style="color: #f3f4f6;">${safeEmail}</strong>. Click the button below to complete your authentication:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${safeUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
                  Sign In to ${appName}
                </a>
              </div>
              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #6b7280;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 18px; word-break: break-all; color: #3b82f6;">
                <a href="${safeUrl}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${safeUrl}</a>
              </p>
              <div style="border-top: 1px solid #1f2937; padding-top: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">
                  &#9201; This link is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.
                </p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  If you did not request this email, you can safely disregard it. Your account remains secure.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0d121f; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Renders a plaintext fallback for ShedBody Magic Link authentication.
 *
 * @param {object} params
 * @param {string} params.url - Magic link verification URL
 * @param {string} params.email - Recipient email address
 * @param {string} [params.appName='ShedBody']
 * @param {number} [params.expiresInMinutes=10]
 * @returns {string} Plaintext string
 */
export function renderMagicLinkEmailText({
  url,
  email,
  appName = DEFAULT_APP_NAME,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
}) {
  return `Sign in to ${appName}

We received a request to sign in to ${appName} with ${email}.

Click the link below to sign in:
${url}

This link is valid for ${expiresInMinutes} minutes and can only be used once.

If you did not request this email, you can safely ignore it. Your account remains secure.

(c) ${new Date().getFullYear()} ${appName}. All rights reserved.`;
}

/**
 * Sanitizes an error message by scrubbing any apparent Resend API keys or Bearer tokens.
 *
 * @param {string} msg
 * @returns {string}
 */
function sanitizeErrorMessage(msg) {
  if (typeof msg !== 'string') return 'Unknown error';
  return msg
    .replace(/re_[a-zA-Z0-9_]{10,}/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]');
}

/**
 * Sends an email via Resend's REST API using the provided or global `fetch`.
 *
 * @param {object} params
 * @param {string} params.apiKey - Resend API key (re_*)
 * @param {string} [params.from=DEFAULT_FROM] - Sender address
 * @param {string|string[]} params.to - Recipient email(s)
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML body
 * @param {string} [params.text] - Plaintext body
 * @param {Function} [params.fetchFn=globalThis.fetch] - Injected fetch function
 * @returns {Promise<{ id: string }>}
 */
export async function sendResendEmail({
  apiKey,
  from = DEFAULT_FROM,
  to,
  subject,
  html,
  text,
  fetchFn = globalThis.fetch,
}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('Resend API key is required: provide a valid RESEND_API_KEY');
  }

  const recipients = Array.isArray(to) ? to : [to];
  if (recipients.length === 0 || !recipients.every((r) => validateEmail(r))) {
    throw new Error('Invalid recipient email address provided to sendResendEmail');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    throw new Error('Email subject is required');
  }

  if (!html && !text) {
    throw new Error('Email content is required (html or text)');
  }

  if (typeof fetchFn !== 'function') {
    throw new Error('fetchFn must be a valid function conforming to the Fetch API');
  }

  const payload = {
    from,
    to: recipients,
    subject,
    html,
    text,
  };

  let response;
  try {
    response = await fetchFn(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const safeErr = sanitizeErrorMessage(err?.message || 'Network request failed');
    throw new Error(`Resend network dispatch failed: ${safeErr}`);
  }

  if (!response.ok) {
    let errorDetail = response.statusText || 'Unknown Resend error';
    try {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.message || errorJson.error || errorDetail;
      } catch {
        if (errorText) errorDetail = errorText.slice(0, 200);
      }
    } catch {
      // Ignore body read errors
    }
    const safeDetail = sanitizeErrorMessage(errorDetail);
    throw new Error(`Resend email delivery failed (HTTP ${response.status}): ${safeDetail}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error('Failed to parse Resend API JSON response');
  }

  if (!data || !data.id) {
    throw new Error('Resend API response did not include a valid email id');
  }

  return { id: data.id };
}

/**
 * Creates a Better Auth compatible `sendMagicLink` callback wired to Resend.
 *
 * @param {object} config
 * @param {string} config.apiKey - Resend API key
 * @param {string} [config.fromEmail=DEFAULT_FROM]
 * @param {string} [config.appName=DEFAULT_APP_NAME]
 * @param {number} [config.expiresInMinutes=10]
 * @param {Function} [config.fetchFn=globalThis.fetch]
 * @returns {(data: { email: string, url: string, token: string }) => Promise<{ id: string }>}
 */
export function createResendMagicLinkSender({
  apiKey,
  fromEmail = DEFAULT_FROM,
  appName = DEFAULT_APP_NAME,
  expiresInMinutes = DEFAULT_EXPIRY_MINUTES,
  fetchFn = globalThis.fetch,
  appUrl = null,
}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('Resend API key is required to create magic link sender');
  }

  return async function sendMagicLink({ email, url, token }) {
    if (!email || !validateEmail(email)) {
      throw new Error(`Invalid recipient email for magic link: "${email}"`);
    }
    if (!url || typeof url !== 'string') {
      throw new Error('Magic link URL is required');
    }

    let effectiveUrl = url;
    if (appUrl && typeof appUrl === 'string') {
      try {
        const parsedApp = new URL(appUrl);
        const parsedUrl = new URL(url);
        parsedUrl.protocol = parsedApp.protocol;
        parsedUrl.host = parsedApp.host;
        effectiveUrl = parsedUrl.toString();
      } catch {}
    }

    const html = renderMagicLinkEmailHtml({
      url: effectiveUrl,
      email,
      appName,
      expiresInMinutes,
    });

    const text = renderMagicLinkEmailText({
      url: effectiveUrl,
      email,
      appName,
      expiresInMinutes,
    });

    return sendResendEmail({
      apiKey,
      from: fromEmail,
      to: email,
      subject: `Your ${appName} Login Link`,
      html,
      text,
      fetchFn,
    });
  };
}
