// lib/api/pythonClient.js
/**
 * PythonServiceClient
 * Establishes the strict API boundary between the Edge (Next.js/Cloudflare Workers)
 * and the Python Intelligence Layer. 
 * 
 * All heavy analytics, AI context generation, and ML workloads must route through this client
 * rather than being computed on the Edge.
 */
export class PythonServiceClient {
  constructor(env = {}) {
    this.baseUrl = env.PYTHON_BACKEND_URL || (typeof process !== "undefined" ? process.env?.PYTHON_BACKEND_URL : undefined);
    this.apiKey = env.PYTHON_BACKEND_API_KEY || env.PYTHON_API_SECRET || (typeof process !== "undefined" ? (process.env?.PYTHON_BACKEND_API_KEY || process.env?.PYTHON_API_SECRET) : undefined);

    if (!this.baseUrl || !this.apiKey) {
      console.warn("PythonServiceClient initialized without PYTHON_BACKEND_URL or API key.");
    }
  }

  /**
   * Fetch pre-aggregated analytics data for a specific user and metric.
   */
  async fetchAnalytics(userId, metric, timeframe) {
    return this._request(`/api/v1/analytics/${metric}`, {
      method: 'GET',
      query: { user_id: userId, timeframe }
    });
  }

  /**
   * Trigger the AI Coach to adapt a fitness/nutrition plan based on user context.
   */
  async triggerAIAdaptation(userId, contextData) {
    return this._request(`/api/v1/ai/adapt-plan`, {
      method: 'POST',
      body: { user_id: userId, context: contextData }
    });
  }

  async _request(endpoint, options = {}) {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("PythonServiceClient: Missing PYTHON_BACKEND_URL or API key configuration.");
    }
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (options.query) {
      Object.entries(options.query).forEach(([key, val]) => url.searchParams.append(key, val));
    }

    try {
      const res = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!res.ok) {
        throw new Error(`Python Service Error: ${res.status} ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`PythonServiceClient _request failed for ${endpoint}:`, error);
      throw error;
    }
  }
}
