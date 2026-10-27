import os
import json
import requests
from requests.exceptions import Timeout, RequestException

class ProviderError(Exception):
    def __init__(self, message, status):
        super().__init__(message)
        self.status = status

def call_ai_provider(system_prompt: str, user_prompt: str, timeout: float = 45.0) -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    model = os.environ.get("OPENROUTER_MODEL")
    site_url = os.environ.get("NEXT_PUBLIC_SITE_URL", "https://shedbody.com")

    if not api_key:
        raise ProviderError("Missing AI provider configuration: OPENROUTER_API_KEY", 500)
    
    if not model:
        raise ProviderError("Missing AI provider configuration: OPENROUTER_MODEL", 500)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": site_url,
        "X-Title": "ShedBody AI Coach"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2
    }

    try:
        # NOTE: requests does not enforce an absolute total request deadline. 
        # This timeout=(5.0, timeout) restricts connection establishment to 5s
        # and inter-byte read time to the remaining timeout. A slow trickle 
        # of data can still exceed the intended overall deadline.
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=(5.0, timeout)
        )
    except Timeout as e:
        raise ProviderError(f"AI Provider Network Error: {str(e)}", 504)
    except RequestException as e:
        raise ProviderError(f"AI Provider Network Error: {str(e)}", 502)

    if not response.ok:
        error_text = f"AI Provider HTTP Error: {response.reason}"
        try:
            err_body = response.json()
            if isinstance(err_body, dict) and "error" in err_body and "message" in err_body["error"]:
                safe_msg = err_body["error"]["message"]
                if api_key:
                    safe_msg = safe_msg.replace(api_key, "[REDACTED_API_KEY]")
                error_text = f"AI Provider HTTP Error: {safe_msg}"
        except ValueError:
            pass
        raise ProviderError(error_text, response.status_code)

    try:
        data = response.json()
    except ValueError as e:
        raise ProviderError(f"Invalid provider response format: {str(e)}", 502)

    try:
        content = data["choices"][0]["message"]["content"]
        if not content:
            raise KeyError()
    except (KeyError, IndexError, TypeError):
        raise ProviderError("Invalid response structure from AI Provider", 502)

    return content
