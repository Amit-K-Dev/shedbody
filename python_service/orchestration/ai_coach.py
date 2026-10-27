import os
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple
import requests
import time

from python_service.insights.normalizer import normalize_d10_payload
from python_service.insights.engine import generate_structured_insights
from python_service.intelligence.context_builder import build_ai_context
from python_service.intelligence.context_validator import validate_ai_context
from python_service.intelligence.grounding_validator import validate_grounding, build_context_dictionary
from python_service.orchestration.provider import call_ai_provider, ProviderError
from python_service.orchestration.response_validator import validate_ai_response_schema, validate_ai_response_safety

logger = logging.getLogger(__name__)

MAX_QUESTION_LENGTH = 1000
ALLOWED_INTENTS = ["GOAL_PROGRESS", "WEIGHT_TREND", "NUTRITION_ADHERENCE", "WORKOUT_LIFESTYLE", "GENERAL_SUMMARY"]

SYSTEM_PROMPT = """You are the ShedBody AI Coach.
Your primary role is to act as a supportive, highly analytical health, fitness, and nutrition coach.
You evaluate the user's progress and answer their questions using strictly the data provided in the Context Dictionary.

CRITICAL RULES:
1. ONLY use data explicitly present in the provided Context Dictionary.
2. YOU MUST provide evidence for every claim or recommendation.
3. Your recommendations must not include extreme medical advice (e.g. 'starve', '500 calories').
4. Always respond in valid JSON format matching the schema exactly.
"""

def process_ai_coach_request(user_id: str, question: str, intent: str = None) -> Tuple[Dict[str, Any], int]:
    """
    Orchestrates the AI Coach request via Python.
    Returns a tuple of (response_dict, status_code).
    """
    
    # 55.0s is the outer deadline for the Python orchestration to complete.
    # We must ensure we return before this expires so the caller (Next.js) doesn't 504 first.
    start_time = time.monotonic()
    OVERALL_DEADLINE_SEC = 55.0
    OVERHEAD_RESERVE_SEC = 2.0
    
    def get_time_remaining(reserve: float = 0.0) -> float:
        elapsed = time.monotonic() - start_time
        return max(0.0, OVERALL_DEADLINE_SEC - elapsed - reserve)
    if not isinstance(question, str) or not question.strip():
        return {"success": False, "error": "Question must be a non-empty string."}, 400
    
    if len(question) > MAX_QUESTION_LENGTH:
        return {"success": False, "error": f"Question exceeds maximum length of {MAX_QUESTION_LENGTH} characters."}, 400

    if intent is not None and intent not in ALLOWED_INTENTS:
        return {"success": False, "error": "Invalid intent."}, 400

    internal_api_secret = os.environ.get("INTERNAL_API_SECRET")
    if not internal_api_secret:
        return {"success": False, "error": "Missing internal authentication secret."}, 500

    # 1. Fetch D10-1 Data
    app_url = os.environ.get("NEXT_PUBLIC_SITE_URL")
    if not app_url:
        env_mode = os.environ.get("ENVIRONMENT", "production").lower()
        if env_mode in ("development", "test"):
            app_url = "http://localhost:3000"
        else:
            logger.error("Missing NEXT_PUBLIC_SITE_URL in production.")
            return {"success": False, "error": "Internal Context Error."}, 500
    
    now = datetime.now(timezone.utc)
    past = now - timedelta(days=29)
    end_date_str = now.strftime("%Y-%m-%d")
    start_date_str = past.strftime("%Y-%m-%d")
    
    headers = {
        "Authorization": f"Bearer {internal_api_secret}"
    }
    params = {
        "user_id": user_id,
        "start_date": start_date_str,
        "end_date": end_date_str
    }
    
    try:
        d10_timeout = min(5.0, get_time_remaining(OVERHEAD_RESERVE_SEC))
        if d10_timeout <= 0:
            return {"success": False, "error": "Internal Server Error"}, 504
            
        # NOTE: requests timeouts are for connect/read separately, not absolute execution time.
        resp = requests.get(f"{app_url}/api/internal/intelligence/context", headers=headers, params=params, timeout=(5.0, d10_timeout))
        if not resp.ok:
            return {"success": False, "error": "Internal Context Error."}, 500
        d10_payload = resp.json()
    except Exception as e:
        logger.error(f"Data fetch error: {e}")
        return {"success": False, "error": "DATA_FETCH_FAILED"}, 500

    # 2. Python Normalizer & D10-2 Insights
    try:
        normalized = normalize_d10_payload(d10_payload.get("data", d10_payload))
        profile_data = normalized.get("profile")
        active_weight_goal = normalized.get("activeWeightGoal")
        current_plan = normalized.get("activePlan")
        unified_timeline = normalized.get("unifiedTimeline", [])
        
        insights = generate_structured_insights(
            unified_timeline,
            profile_data,
            current_plan,
            active_weight_goal,
            end_date_str
        )
    except Exception as e:
        logger.error(f"Normalization/Insights error: {e}")
        return {"success": False, "error": "Internal Context Error."}, 500

    # 3. D10-3 Context Builder
    raw_context = build_ai_context({
        "question": question,
        "currentDate": end_date_str,
        "profile": profile_data,
        "activeGoal": active_weight_goal,
        "activePlan": current_plan,
        "timeline": unified_timeline,
        "insights": insights
    })

    # 4. Context Validation
    validation_res = validate_ai_context(raw_context)
    if not validation_res.get("valid"):
        logger.error(f"Context Validation Failed: {validation_res.get('error')}")
        return {"success": False, "error": "Internal Context Error."}, 500
    
    secure_context = validation_res["data"]
    
    # 4.5 Generate Context Dictionary
    context_dict = build_context_dictionary(secure_context)

    # 5. AI Provider Call
    user_prompt = f'User Question: "{question}"\n\nContext Dictionary:\n{json.dumps(context_dict, indent=2)}'
    
    try:
        provider_timeout = get_time_remaining(OVERHEAD_RESERVE_SEC)
        if provider_timeout <= 0:
            return {"success": False, "error": "AI provider took too long to respond. Please try again later."}, 504
            
        ai_response_string = call_ai_provider(SYSTEM_PROMPT, user_prompt, timeout=provider_timeout)
    except ProviderError as err:
        logger.error(f"AI Provider Error: {err}")
        status_code = err.status
        client_msg = "Unable to connect to the AI provider. Please try again later."
        
        if status_code == 500:
            client_msg = "AI provider configuration error."
        elif status_code in (401, 403):
            client_msg = "AI provider authentication failed."
        elif status_code == 404:
            client_msg = "AI model configuration error."
        elif status_code == 429:
            client_msg = "AI provider rate limit reached. Please try again later."
        elif status_code == 504:
            client_msg = "AI provider took too long to respond. Please try again later."
        elif status_code == 502:
            client_msg = "Unable to connect to the AI provider. Please try again later."
        elif 500 <= status_code < 600:
            client_msg = "AI provider is temporarily unavailable. Please try again later."
            
        return {"success": False, "error": client_msg}, status_code
    except Exception as e:
        logger.error(f"Unexpected AI Provider Error: {e}")
        return {"success": False, "error": "Internal Server Error"}, 500

    # 6. JSON Parsing
    try:
        cleaned_string = ai_response_string.replace("```json", "").replace("```", "").strip()
        parsed_response = json.loads(cleaned_string)
    except Exception:
        logger.error("AI produced invalid JSON - parsing failed.")
        return {"success": False, "error": "Bad Gateway"}, 502

    # 7. Schema Validation
    schema_valid, schema_err = validate_ai_response_schema(parsed_response)
    if not schema_valid:
        logger.error(f"Schema Validation Failed: {schema_err}")
        return {"success": False, "error": "Internal Server Error"}, 500

    # 8. Grounding Validation
    combined_claims = []
    combined_claims.extend(parsed_response.get("evidence", []))
    for rec in parsed_response.get("recommendations", []):
        combined_claims.append({**rec, "claimType": "RECOMMENDATION"})
        
    grounding_res = validate_grounding(combined_claims, context_dict)
    if not grounding_res.get("valid"):
        logger.error(f"Grounding Validation Failed: {grounding_res.get('error')}")
        return {"success": False, "error": "AI_GROUNDING_VIOLATION"}, 422

    # 9. Safety Validation
    safety_valid, safety_err = validate_ai_response_safety(parsed_response)
    if not safety_valid:
        logger.error(f"Safety Validation Failed: {safety_err}")
        return {"success": False, "error": "AI_SAFETY_VIOLATION"}, 422

    # 10. Success Response
    return {"success": True, "data": parsed_response}, 200
