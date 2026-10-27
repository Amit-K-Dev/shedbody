import re
import math
from python_service.insights.primitives import is_valid_date

ALLOWED_INTENTS = [
    "WEIGHT_TREND",
    "GOAL_PROGRESS",
    "NUTRITION_ADHERENCE",
    "WORKOUT_LIFESTYLE",
    "GENERAL_SUMMARY"
]

ALLOWED_CONFIDENCE = ["high", "medium"]
ALLOWED_INSIGHT_CATEGORIES = ["body", "lifestyle", "nutrition"]

UUID_PATTERN = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
EMAIL_PATTERN = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")

FORBIDDEN_EXACT_KEYS = [
    "user_id", "userId", "email", "notes", "full_name", "fullName", "avatar_url", "avatarUrl"
]

def is_object(val):
    return val is not None and isinstance(val, dict)

def is_finite_number(val):
    return isinstance(val, (int, float)) and not isinstance(val, bool) and math.isfinite(val)

def check_sensitive_content(obj, path=None):
    if path is None:
        path = []
        
    if obj is None:
        return None
        
    if isinstance(obj, str):
        if UUID_PATTERN.search(obj):
            return f"UUID detected at {'.'.join(map(str, path))}"
        if EMAIL_PATTERN.search(obj):
            return f"Email detected at {'.'.join(map(str, path))}"
        return None
        
    if isinstance(obj, list):
        for i, item in enumerate(obj):
            err = check_sensitive_content(item, path + [i])
            if err: return err
        return None
        
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = path + [key]
            path_str = '.'.join(map(str, current_path))
            
            if key in FORBIDDEN_EXACT_KEYS:
                return f"Forbidden key '{key}' detected at {path_str}"
                
            if key == "id":
                if not (len(path) == 2 and path[0] == "deterministicInsights"):
                    return f"Forbidden id key detected at {path_str}"
                    
            if key.endswith("_id") or key.endswith("Id"):
                return f"Forbidden identifier key '{key}' detected at {path_str}"
                
            err = check_sensitive_content(value, current_path)
            if err: return err
            
    return None

def fail(msg):
    raise ValueError(msg)

def check_keys(obj, allowed_keys, path_str):
    if not is_object(obj):
        fail(f"{path_str} must be an object")
    for k in obj.keys():
        if k not in allowed_keys:
            fail(f"Unknown field '{k}' at {path_str}")

def validate_metadata(meta):
    check_keys(meta, ["currentDate", "intent", "windowDays"], "metadata")
    if not is_valid_date(meta.get("currentDate")):
        fail("metadata.currentDate must be a valid YYYY-MM-DD string")
    if meta.get("intent") not in ALLOWED_INTENTS:
        fail(f"metadata.intent has invalid value '{meta.get('intent')}'")
    if not is_finite_number(meta.get("windowDays")) or not isinstance(meta.get("windowDays"), int) or meta.get("windowDays") < 1 or meta.get("windowDays") > 30:
        fail("metadata.windowDays must be an integer between 1 and 30")
    return meta["currentDate"]

def validate_profile(profile):
    if profile is None: return
    check_keys(profile, ["heightCm", "currentWeightKg"], "profile")
    h = profile.get("heightCm")
    if h is not None and (not is_finite_number(h) or h <= 0):
        fail("profile.heightCm invalid")
    w = profile.get("currentWeightKg")
    if w is not None and (not is_finite_number(w) or w <= 0):
        fail("profile.currentWeightKg invalid")

def validate_user_goal(goal, current_date):
    if goal is None: return
    check_keys(goal, ["type", "domain", "startValue", "targetValue", "startDate", "targetDate", "progressPercent"], "userGoal")
    
    if goal.get("type") != "USER_GOAL": fail("userGoal.type must be USER_GOAL")
    if goal.get("domain") is not None and not isinstance(goal.get("domain"), str): fail("userGoal.domain must be string or null")
    if goal.get("startValue") is not None and not is_finite_number(goal.get("startValue")): fail("userGoal.startValue must be number or null")
    if goal.get("targetValue") is not None and not is_finite_number(goal.get("targetValue")): fail("userGoal.targetValue must be number or null")
    
    prog = goal.get("progressPercent")
    if prog is not None and (not is_finite_number(prog) or prog < 0 or prog > 100):
        fail("userGoal.progressPercent must be between 0 and 100")
        
    start_date = goal.get("startDate")
    if start_date is not None:
        if not is_valid_date(start_date): fail("userGoal.startDate invalid date")
        if start_date > current_date: fail("userGoal.startDate cannot be in the future")
        
    target_date = goal.get("targetDate")
    if target_date is not None:
        if not is_valid_date(target_date): fail("userGoal.targetDate invalid date")

def validate_protocol_target(target):
    if target is None: return
    check_keys(target, ["type", "goal", "level", "dietType", "dailyCalories", "dailyProteinGrams"], "protocolTarget")
    
    if target.get("type") != "TARGET": fail("protocolTarget.type must be TARGET")
    if target.get("goal") is not None and not isinstance(target.get("goal"), str): fail("protocolTarget.goal invalid")
    if target.get("level") is not None and not isinstance(target.get("level"), str): fail("protocolTarget.level invalid")
    if target.get("dietType") is not None and not isinstance(target.get("dietType"), str): fail("protocolTarget.dietType invalid")
    
    c = target.get("dailyCalories")
    if c is not None and (not is_finite_number(c) or c < 0): fail("protocolTarget.dailyCalories invalid")
    p = target.get("dailyProteinGrams")
    if p is not None and (not is_finite_number(p) or p < 0): fail("protocolTarget.dailyProteinGrams invalid")

def validate_observations(obs_list, current_date):
    if not isinstance(obs_list, list): fail("observations must be an array")
    allowed = ["type", "date", "weightKg", "bodyFatPercent", "calories", "proteinGrams", "waterMl", "workoutCompleted", "steps", "sleepHours"]
    
    for i, obs in enumerate(obs_list):
        p = f"observations[{i}]"
        check_keys(obs, allowed, p)
        
        if obs.get("type") != "OBSERVED": fail(f"{p}.type must be OBSERVED")
        date_str = obs.get("date")
        if not is_valid_date(date_str): fail(f"{p}.date invalid")
        if date_str > current_date: fail(f"{p}.date cannot be in the future")
        
        wk = obs.get("weightKg")
        if wk is not None and (not is_finite_number(wk) or wk < 0): fail(f"{p}.weightKg invalid")
        bf = obs.get("bodyFatPercent")
        if bf is not None and (not is_finite_number(bf) or bf < 0 or bf > 100): fail(f"{p}.bodyFatPercent invalid")
        c = obs.get("calories")
        if c is not None and (not is_finite_number(c) or c < 0): fail(f"{p}.calories invalid")
        pg = obs.get("proteinGrams")
        if pg is not None and (not is_finite_number(pg) or pg < 0): fail(f"{p}.proteinGrams invalid")
        wml = obs.get("waterMl")
        if wml is not None and (not is_finite_number(wml) or wml < 0): fail(f"{p}.waterMl invalid")
        
        wc = obs.get("workoutCompleted")
        if wc is not None and not isinstance(wc, bool): fail(f"{p}.workoutCompleted invalid")
        st = obs.get("steps")
        if st is not None and (not is_finite_number(st) or st < 0 or not isinstance(st, int)): fail(f"{p}.steps invalid")
        sh = obs.get("sleepHours")
        if sh is not None and (not is_finite_number(sh) or sh < 0): fail(f"{p}.sleepHours invalid")

def validate_derived_analytics(derived_list):
    if not isinstance(derived_list, list): fail("derivedAnalytics must be an array")
    allowed_keys = ["type", "metric", "value", "unit", "calculation"]
    calc_allowed_keys = ["method", "window"]
    
    for i, d in enumerate(derived_list):
        p = f"derivedAnalytics[{i}]"
        check_keys(d, allowed_keys, p)
        
        if d.get("type") != "DERIVED": fail(f"{p}.type must be DERIVED")
        if not isinstance(d.get("metric"), str): fail(f"{p}.metric invalid")
        if not is_finite_number(d.get("value")): fail(f"{p}.value must be a finite number")
        if not isinstance(d.get("unit"), str): fail(f"{p}.unit invalid")
        
        check_keys(d.get("calculation"), calc_allowed_keys, f"{p}.calculation")
        if not isinstance(d["calculation"].get("method"), str): fail(f"{p}.calculation.method invalid")
        if not isinstance(d["calculation"].get("window"), str): fail(f"{p}.calculation.window invalid")

def validate_deterministic_insights(insights):
    if not isinstance(insights, list): fail("deterministicInsights must be an array")
    if len(insights) > 5: fail("deterministicInsights array exceeds maximum length of 5")
    
    allowed = ["type", "id", "category", "observation", "evidence", "interpretation", "recommendation", "confidence"]
    
    for i, d in enumerate(insights):
        p = f"deterministicInsights[{i}]"
        check_keys(d, allowed, p)
        
        if d.get("type") != "DETERMINISTIC_INSIGHT": fail(f"{p}.type must be DETERMINISTIC_INSIGHT")
        if not isinstance(d.get("id"), str): fail(f"{p}.id invalid")
        if d.get("category") not in ALLOWED_INSIGHT_CATEGORIES:
            fail(f"{p}.category must be one of [{','.join(ALLOWED_INSIGHT_CATEGORIES)}], got '{d.get('category')}'")
            
        if not isinstance(d.get("observation"), str): fail(f"{p}.observation invalid")
        if not isinstance(d.get("evidence"), str): fail(f"{p}.evidence invalid")
        if not isinstance(d.get("interpretation"), str): fail(f"{p}.interpretation invalid")
        if not isinstance(d.get("recommendation"), str): fail(f"{p}.recommendation invalid")
        
        if d.get("confidence") not in ALLOWED_CONFIDENCE:
            fail(f"{p}.confidence must be 'high' or 'medium', got '{d.get('confidence')}'")

def validate_ai_context(payload):
    try:
        if not is_object(payload):
            return { "valid": False, "error": "Payload must be an object" }
            
        security_error = check_sensitive_content(payload)
        if security_error:
            return { "valid": False, "error": f"Security validation failed: {security_error}" }
            
        check_keys(payload, [
            "metadata", "profile", "userGoal", "protocolTarget", 
            "observations", "derivedAnalytics", "deterministicInsights"
        ], "root")
        
        current_date = validate_metadata(payload.get("metadata"))
        validate_profile(payload.get("profile"))
        validate_user_goal(payload.get("userGoal"), current_date)
        validate_protocol_target(payload.get("protocolTarget"))
        validate_observations(payload.get("observations"), current_date)
        validate_derived_analytics(payload.get("derivedAnalytics"))
        validate_deterministic_insights(payload.get("deterministicInsights"))
        
        return { "valid": True, "data": payload }
    except ValueError as e:
        return { "valid": False, "error": str(e) }
    except Exception as e:
        return { "valid": False, "error": str(e) }
