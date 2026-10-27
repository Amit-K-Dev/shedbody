// lib/api/d1BridgeClient.js
/**
 * ShedBody — Cloudflare D1 Bridge HTTP Client (Vercel Node / Edge Context)
 *
 * Provides a secure, fail-closed HTTP client interface for Vercel Server Actions
 * and API routes to communicate with the dedicated Cloudflare Worker D1 Bridge.
 *
 * Invariants:
 * 1. Default-off activation: Strictly gated by process.env.ENABLE_D1_BRIDGE === "true".
 * 2. Identity forwarding: Forwards verified user Supabase access token as Bearer token.
 * 3. Zero silent fallback: If D1 Bridge returns an error or times out, fails closed immediately.
 * 4. Zero ambiguous retries: Dispatched mutations are never automatically retried.
 */

export class D1BridgeClient {
  /**
   * @param {object} [options]
   * @param {string} [options.baseUrl] - Base URL of the deployed Cloudflare D1 Bridge Worker.
   * @param {string} [options.internalSecret] - Shared internal secret for defense-in-depth.
   * @param {number} [options.timeoutMs=8000] - Request timeout in milliseconds.
   */
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || (typeof process !== 'undefined' ? process.env?.D1_BRIDGE_URL : '') || '').replace(/\/+$/, '');
    this.internalSecret = options.internalSecret || (typeof process !== 'undefined' ? process.env?.INTERNAL_BRIDGE_SECRET : '') || null;
    this.timeoutMs = options.timeoutMs || 8000;
  }

  /**
   * Checks whether the D1 Bridge integration is explicitly enabled.
   * @returns {boolean}
   */
  isEnabled() {
    return typeof process !== 'undefined' && process.env?.ENABLE_D1_BRIDGE === "true";
  }

  _assertEnabled() {
    if (!this.isEnabled()) {
      const err = new Error("D1 Bridge execution path is disabled. ENABLE_D1_BRIDGE must strictly equal 'true'.");
      err.code = "D1_BRIDGE_DISABLED";
      throw err;
    }

    if (typeof process !== 'undefined' && process.env?.REQUIRE_INTERNAL_SECRET === "true" && !this.internalSecret) {
      const err = new Error("Internal bridge secret is required but not configured on client.");
      err.code = "MISSING_INTERNAL_SECRET";
      throw err;
    }

    if (!this.baseUrl) {
      const err = new Error("D1 Bridge URL is not configured. Ensure D1_BRIDGE_URL is provided.");
      err.code = "D1_BRIDGE_URL_MISSING";
      throw err;
    }
  }

  /**
   * Checks health and connectivity of the D1 Bridge worker.
   * @returns {Promise<object>}
   */
  async checkHealth() {
    this._assertEnabled();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/bridge/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(this.internalSecret ? { 'x-internal-secret': this.internalSecret } : {}),
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = new Error(errData.message || "D1 Bridge health check failed");
        err.code = errData.error || `HTTP_${res.status}`;
        throw err;
      }

      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Sets a new weight goal in D1 via the Bridge Worker.
   *
   * @param {string} accessToken - Verified Supabase user Bearer access token.
   * @param {number} targetValue - Target weight value.
   * @returns {Promise<object>} Created goal record.
   */
  async createWeightGoal(accessToken, targetValue) {
    this._assertEnabled();

    if (!accessToken || typeof accessToken !== 'string') {
      const err = new Error("User access token is required for D1 Bridge authentication");
      err.code = "UNAUTHORIZED";
      throw err;
    }

    if (!Number.isFinite(targetValue) || targetValue <= 0) {
      const err = new Error("targetValue must be a positive finite number");
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/bridge/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...(this.internalSecret ? { 'x-internal-secret': this.internalSecret } : {}),
        },
        body: JSON.stringify({ targetValue }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = new Error(data.message || `D1 Bridge request failed with HTTP ${res.status}`);
        err.code = data.error || `HTTP_${res.status}`;
        err.status = res.status;
        throw err;
      }

      return data.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutErr = new Error("D1 Bridge request timed out. Outcome is ambiguous; do not retry.");
        timeoutErr.code = "D1_WRITE_TIMEOUT_UNKNOWN_OUTCOME";
        throw timeoutErr;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetches active goal for a domain from D1 via Bridge Worker.
   *
   * @param {string} accessToken - Verified Supabase user Bearer access token.
   * @param {string} [domain='weight']
   * @returns {Promise<object|null>}
   */
  async getActiveGoal(accessToken, domain = 'weight') {
    this._assertEnabled();

    if (!accessToken || typeof accessToken !== 'string') {
      const err = new Error("User access token is required for D1 Bridge authentication");
      err.code = "UNAUTHORIZED";
      throw err;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/api/bridge/goals/active?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...(this.internalSecret ? { 'x-internal-secret': this.internalSecret } : {}),
        },
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = new Error(data.message || `D1 Bridge request failed with HTTP ${res.status}`);
        err.code = data.error || `HTTP_${res.status}`;
        err.status = res.status;
        throw err;
      }

      return data.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutErr = new Error("D1 Bridge read request timed out.");
        timeoutErr.code = "D1_READ_TIMEOUT";
        throw timeoutErr;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
