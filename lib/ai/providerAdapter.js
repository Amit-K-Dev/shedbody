/**
 * Provider-Agnostic AI Gateway Adapter
 * 
 * Exposes a clean interface for the API route, hiding the underlying AI provider.
 * Implements a simple fetch-based client to avoid introducing SDK dependencies.
 */

export async function callAiProvider(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  // Rule: Use ONLY the verified free model
  const model = "dots-studio/dots-3-note-preview:free";

  if (!apiKey) {
    throw new Error("Missing AI provider configuration");
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
    throw new Error("AI Provider Network Error");
  }

  if (!response.ok) {
    // We explicitly do NOT read response.text() or leak it into the Error message 
    // to prevent sensitive raw provider data/keys from escaping to logs/client.
    throw new Error("AI Provider HTTP Error");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid provider response format");
  }
  
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("Invalid response structure from AI Provider");
  }

  // Returns ONLY the normalized string response, not the raw provider object
  return data.choices[0].message.content;
}
