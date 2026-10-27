import math

VALID_CLAIM_TYPES = [
    "DIRECT_OBSERVATION",
    "DERIVED_ANALYTIC",
    "USER_GOAL",
    "DETERMINISTIC_INSIGHT",
    "RECOMMENDATION"
]

VALID_RECOMMENDATION_BASIS = [
    "GOAL_SUPPORT",
    "METRIC_CORRECTION",
    "TREND_MAINTENANCE"
]

def is_object(val):
    return val is not None and isinstance(val, dict)

def fail(msg):
    raise ValueError(msg)

def validate_grounding(claims, context_dictionary):
    try:
        if not isinstance(claims, list):
            fail("claims must be an array")
        if not is_object(context_dictionary):
            fail("contextDictionary must be an object")
            
        for i, claim in enumerate(claims):
            if not is_object(claim):
                fail(f"claims[{i}] must be an object")
                
            c_type = claim.get("claimType")
            if c_type not in VALID_CLAIM_TYPES:
                fail(f"claims[{i}].claimType is invalid: {c_type}")
                
            if c_type == "DETERMINISTIC_INSIGHT":
                i_id = claim.get("insightId")
                if not isinstance(i_id, str):
                    fail(f"claims[{i}].insightId must be a string for DETERMINISTIC_INSIGHT")
                
                ref = context_dictionary.get(i_id)
                if not ref:
                    fail(f"claims[{i}] hallucinated insightId: {i_id}")
                if ref.get("type") != "DETERMINISTIC_INSIGHT":
                    fail(f"claims[{i}] insightId maps to incorrect type: {ref.get('type')}")
                continue
                
            supported_by = claim.get("supportedBy")
            if not isinstance(supported_by, list) or len(supported_by) == 0:
                fail(f"claims[{i}] missing or empty supportedBy array")
                
            refs = []
            for ref_id in supported_by:
                if not isinstance(ref_id, str):
                    fail(f"claims[{i}].supportedBy contains non-string")
                ref = context_dictionary.get(ref_id)
                if not ref:
                    fail(f"claims[{i}] hallucinated reference ID: {ref_id}")
                refs.append(ref)
                
            if c_type == "RECOMMENDATION":
                basis = claim.get("recommendationBasis")
                if basis not in VALID_RECOMMENDATION_BASIS:
                    fail(f"claims[{i}].recommendationBasis is invalid: {basis}")
                    
                has_compatible_ref = False
                for ref in refs:
                    r_type = ref.get("type")
                    if basis == "GOAL_SUPPORT":
                        if r_type in ("USER_GOAL", "PROTOCOL_TARGET"):
                            has_compatible_ref = True
                            break
                    elif basis == "METRIC_CORRECTION":
                        if r_type in ("DIRECT_OBSERVATION", "DERIVED_ANALYTIC"):
                            has_compatible_ref = True
                            break
                    elif basis == "TREND_MAINTENANCE":
                        if r_type == "DETERMINISTIC_INSIGHT":
                            has_compatible_ref = True
                            break
                            
                if not has_compatible_ref:
                    fail(f"claims[{i}] structural compatibility failed for basis {basis}")
                continue
                
            # Factual Claims
            has_matching_type = any(r.get("type") == c_type for r in refs)
            if not has_matching_type:
                fail(f"claims[{i}] reference type mismatch. Expected at least one {c_type}")
                
            target_ref = next(r for r in refs if r.get("type") == c_type)
            
            asserted = claim.get("assertedValue")
            unit = claim.get("unit")
            
            ref_val = target_ref.get("value")
            if isinstance(ref_val, (int, float)) and not isinstance(ref_val, bool):
                if not isinstance(asserted, (int, float)) or isinstance(asserted, bool) or not math.isfinite(asserted):
                    fail(f"claims[{i}].assertedValue must be a finite number")
                if asserted != ref_val:
                    fail(f"claims[{i}] numeric mismatch: expected {ref_val}, got {asserted}")
            else:
                if asserted != ref_val:
                    fail(f"claims[{i}] value mismatch: expected {ref_val}, got {asserted}")
                    
            if target_ref.get("unit") and unit != target_ref.get("unit"):
                fail(f"claims[{i}] unit mismatch: expected {target_ref.get('unit')}, got {unit}")
                
        return { "valid": True }
    except ValueError as e:
        return { "valid": False, "error": str(e) }
    except Exception as e:
        return { "valid": False, "error": str(e) }

# Helper from app/api/ai/coach/route.js to build the dictionary
def get_unit(key):
    units = {
        "weightKg": "kg", "averageWeight": "kg", "weightChange": "kg", "weightRateOfChange": "kg/day",
        "calories": "kcal", "averageCalories": "kcal", "dailyCalories": "kcal",
        "proteinGrams": "g", "averageProtein": "g", "dailyProteinGrams": "g",
        "waterMl": "ml",
        "workoutCompleted": "boolean", "totalWorkouts": "count",
        "steps": "steps", "averageSteps": "steps",
        "sleepHours": "hours", "averageSleep": "hours",
        "calorieAdherence": "%", "proteinAdherence": "%", "progressPercent": "%"
    }
    return units.get(key, "unit")

def build_context_dictionary(context):
    dict_out = {}
    
    if context.get("observations"):
        for obs in context["observations"]:
            for k, v in obs.items():
                if k != "date" and v is not None:
                    dict_out[f"obs_{k}_{obs['date']}"] = {
                        "type": "DIRECT_OBSERVATION",
                        "value": v,
                        "unit": get_unit(k)
                    }
                    
    if context.get("derivedAnalytics"):
        for da in context["derivedAnalytics"]:
            dict_out[f"da_{da['metric']}"] = {
                "type": "DERIVED_ANALYTIC",
                "value": da["value"],
                "unit": da.get("unit") or get_unit(da["metric"])
            }
            
    if context.get("userGoal"):
        dict_out[f"goal_{context['userGoal']['domain']}"] = {
            "type": "USER_GOAL",
            "value": context["userGoal"]["targetValue"],
            "unit": get_unit(context["userGoal"]["domain"])
        }
        
    if context.get("protocolTarget"):
        dict_out["target_calories"] = {
            "type": "PROTOCOL_TARGET", 
            "value": context["protocolTarget"]["dailyCalories"], 
            "unit": "kcal"
        }
        dict_out["target_protein"] = {
            "type": "PROTOCOL_TARGET", 
            "value": context["protocolTarget"]["dailyProteinGrams"], 
            "unit": "g"
        }
        
    if context.get("deterministicInsights"):
        for insight in context["deterministicInsights"]:
            dict_out[f"insight_{insight['id']}"] = {
                "type": "DETERMINISTIC_INSIGHT"
            }
            
    return dict_out
