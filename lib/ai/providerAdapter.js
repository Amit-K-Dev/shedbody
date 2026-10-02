/**
 * Provider-Agnostic AI Gateway Adapter
 * 
 * Exposes a clean interface for the API route, hiding the underlying AI provider.
 * Implements a simple fetch-based client to avoid introducing SDK dependencies.
 */

export async function callAiProvider(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey) {
    const err = new Error("Missing AI provider configuration: OPENROUTER_API_KEY");
    err.status = 500;
    throw err;
  }
  
  if (!model) {
    const err = new Error("Missing AI provider configuration: OPENROUTER_MODEL");
    err.status = 500;
    throw err;
  }

  let response;
  try {
    // We use standard fetch to avoid SDK dependencies
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://shedbody.com",
        "X-Title": "ShedBody AI Coach"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      }),
      // Network timeout to prevent hanging connections
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    // Catches network errors, DNS failures, or AbortSignal timeouts
    const err = new Error(`AI Provider Network Error: ${error.message}`);
    err.status = 502;
    throw err;
  }

  if (!response.ok) {
    let errorText = `AI Provider HTTP Error: ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.error?.message) {
        let safeMsg = errBody.error.message;
        if (apiKey) {
          safeMsg = safeMsg.split(apiKey).join("[REDACTED_API_KEY]");
        }
        errorText = `AI Provider HTTP Error: ${safeMsg}`;
      }
    } catch (e) {
      // Ignored parsing errors
    }
    const err = new Error(errorText);
    err.status = response.status;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    const err = new Error("Invalid provider response format");
    err.status = 502;
    throw err;
  }
  
  if (!data?.choices?.[0]?.message?.content) {
    const err = new Error("Invalid response structure from AI Provider");
    err.status = 502;
    throw err;
  }

  // Returns ONLY the normalized string response, not the raw provider object
  return data.choices[0].message.content;
}
