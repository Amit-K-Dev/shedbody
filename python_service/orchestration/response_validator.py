import math
from typing import Dict, Any, Tuple

ALLOWED_RESPONSE_TYPES = {
    "analysis",
    "correction",
    "motivation",
    "action_plan",
    "educational"
}

ALLOWED_CONFIDENCE = {"high", "medium"}

ALLOWED_CLAIM_TYPES = {
    "DIRECT_OBSERVATION",
    "DERIVED_ANALYTIC",
    "USER_GOAL",
    "DETERMINISTIC_INSIGHT"
}

ALLOWED_RECOMMENDATION_BASIS = {
    "GOAL_SUPPORT",
    "METRIC_CORRECTION",
    "TREND_MAINTENANCE"
}

def is_object(val: Any) -> bool:
    return isinstance(val, dict)

def check_keys(obj: Any, allowed_keys: list, path_str: str):
    if not is_object(obj):
        raise ValueError(f"{path_str} must be an object")
    
    for k in obj.keys():
        if k not in allowed_keys:
            raise ValueError(f"Unknown field '{k}' at {path_str}")

def validate_evidence_item(item: Any, index: int):
    p = f"evidence[{index}]"
    if not is_object(item):
        raise ValueError(f"{p} must be an object")

    if item.get("claimType") not in ALLOWED_CLAIM_TYPES:
        raise ValueError(f"{p}.claimType is invalid")

    if item["claimType"] == "DETERMINISTIC_INSIGHT":
        check_keys(item, ["claimType", "insightId"], p)
        if not isinstance(item.get("insightId"), str):
            raise ValueError(f"{p}.insightId must be a string")
        return

    check_keys(item, ["claimType", "supportedBy", "assertedValue", "unit"], p)

    supported_by = item.get("supportedBy")
    if not isinstance(supported_by, list):
        raise ValueError(f"{p}.supportedBy must be an array")
    if len(supported_by) != 1:
        raise ValueError(f"{p}.supportedBy must contain exactly one ID")
    if not isinstance(supported_by[0], str):
        raise ValueError(f"{p}.supportedBy[0] must be a string")

    asserted_value = item.get("assertedValue")
    if asserted_value is not None:
        if not isinstance(asserted_value, (str, int, float, bool)):
            raise ValueError(f"{p}.assertedValue must be primitive or null")
        if isinstance(asserted_value, bool):
            pass # Valid
        elif isinstance(asserted_value, (int, float)):
            if not math.isfinite(asserted_value):
                raise ValueError(f"{p}.assertedValue must be a finite number")
            
    unit = item.get("unit")
    if unit is not None and not isinstance(unit, str):
        raise ValueError(f"{p}.unit must be a string or null")

def validate_recommendation_item(item: Any, index: int):
    p = f"recommendations[{index}]"
    if not is_object(item):
        raise ValueError(f"{p} must be an object")

    check_keys(item, ["text", "recommendationBasis", "supportedBy"], p)

    text = item.get("text")
    if not isinstance(text, str):
        raise ValueError(f"{p}.text must be a string")
    if len(text) > 200:
        raise ValueError(f"{p}.text exceeds 200 characters")

    if item.get("recommendationBasis") not in ALLOWED_RECOMMENDATION_BASIS:
        raise ValueError(f"{p}.recommendationBasis is invalid")

    supported_by = item.get("supportedBy")
    if not isinstance(supported_by, list):
        raise ValueError(f"{p}.supportedBy must be an array")
    if len(supported_by) == 0:
        raise ValueError(f"{p}.supportedBy must contain at least one ID")
    for i, sb in enumerate(supported_by):
        if not isinstance(sb, str):
            raise ValueError(f"{p}.supportedBy[{i}] must be a string")


def validate_ai_response_schema(response: Any) -> Tuple[bool, str]:
    try:
        if not is_object(response):
            raise ValueError("Response must be an object")

        check_keys(response, [
            "type", "title", "summary", "evidence", "recommendations", "confidence", "safetyNote"
        ], "root")

        if response.get("type") not in ALLOWED_RESPONSE_TYPES:
            raise ValueError(f"type must be one of [{','.join(ALLOWED_RESPONSE_TYPES)}]")

        title = response.get("title")
        if not isinstance(title, str):
            raise ValueError("title must be a string")
        if len(title) > 100:
            raise ValueError("title exceeds 100 characters")

        summary = response.get("summary")
        if not isinstance(summary, str):
            raise ValueError("summary must be a string")
        if len(summary) > 500:
            raise ValueError("summary exceeds 500 characters")

        evidence = response.get("evidence")
        if not isinstance(evidence, list):
            raise ValueError("evidence must be an array")
        for i, item in enumerate(evidence):
            validate_evidence_item(item, i)

        recommendations = response.get("recommendations")
        if not isinstance(recommendations, list):
            raise ValueError("recommendations must be an array")
        if len(recommendations) > 3:
            raise ValueError("more than 3 recommendations")
        for i, item in enumerate(recommendations):
            validate_recommendation_item(item, i)

        if response.get("confidence") not in ALLOWED_CONFIDENCE:
            raise ValueError("confidence must be 'high' or 'medium'")

        safety_note = response.get("safetyNote")
        if safety_note is not None:
            if not isinstance(safety_note, str):
                raise ValueError("safetyNote must be string or null")
            if len(safety_note) > 200:
                raise ValueError("safetyNote exceeds 200 characters")

        return True, ""
    except ValueError as err:
        return False, str(err)

def validate_ai_response_safety(response: Any) -> Tuple[bool, str]:
    if not isinstance(response, dict) or not isinstance(response.get("type"), str):
        return False, "Safety failure: invalid response structure"
    
    blocklist = ["200 calories", "500 calories", "starve", "fasting for days"]

    recommendations = response.get("recommendations")
    if isinstance(recommendations, list):
        for rec in recommendations:
            if isinstance(rec, dict) and isinstance(rec.get("text"), str):
                text = rec["text"].lower()
                for blocked in blocklist:
                    if blocked in text:
                        return False, "Extreme restriction detected in recommendation"
    
    return True, ""
