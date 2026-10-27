import re
import math
from datetime import datetime
from python_service.insights.primitives import is_valid_date, add_days

INTENT_PATTERNS = [
    {"intent": "GOAL_PROGRESS", "pattern": r"goal|target|progress|finish|reach|milestone"},
    {"intent": "WEIGHT_TREND", "pattern": r"weight|fat|scale|heavier|lighter|kg|lbs|plateau"},
    {"intent": "NUTRITION_ADHERENCE", "pattern": r"calorie|calories|protein|food|eat|diet|water|macro|nutrition"},
    {"intent": "WORKOUT_LIFESTYLE", "pattern": r"work\s*out|workout|gym|exercise|train|sleep|step|active"},
]

def js_round(val):
    if val is None:
        return None
    return int(math.floor(val + 0.5))

def classify_intent(question):
    if not question or not isinstance(question, str) or question.strip() == "":
        return "GENERAL_SUMMARY"
    
    for item in INTENT_PATTERNS:
        if re.search(item["pattern"], question, re.IGNORECASE):
            return item["intent"]
            
    return "GENERAL_SUMMARY"

INTENT_CONFIGS = {
    "WEIGHT_TREND": {
        "includeBody": True,
        "includeNutrition": True,
        "includeLifestyle": True,
        "includeGoal": True,
        "includePlan": True,
        "bodyWindowDays": 14,
        "nutritionWindowDays": 7,
        "lifestyleWindowDays": 7,
        "relevantInsightCategories": ["body", "nutrition", "lifestyle"],
    },
    "GOAL_PROGRESS": {
        "includeBody": True,
        "includeNutrition": False,
        "includeLifestyle": False,
        "includeGoal": True,
        "includePlan": False,
        "bodyWindowDays": 14,
        "nutritionWindowDays": 0,
        "lifestyleWindowDays": 0,
        "relevantInsightCategories": ["body"],
    },
    "NUTRITION_ADHERENCE": {
        "includeBody": False,
        "includeNutrition": True,
        "includeLifestyle": False,
        "includeGoal": False,
        "includePlan": True,
        "bodyWindowDays": 0,
        "nutritionWindowDays": 7,
        "lifestyleWindowDays": 0,
        "relevantInsightCategories": ["nutrition"],
    },
    "WORKOUT_LIFESTYLE": {
        "includeBody": False,
        "includeNutrition": False,
        "includeLifestyle": True,
        "includeGoal": False,
        "includePlan": True,
        "bodyWindowDays": 0,
        "nutritionWindowDays": 0,
        "lifestyleWindowDays": 7,
        "relevantInsightCategories": ["lifestyle"],
    },
    "GENERAL_SUMMARY": {
        "includeBody": True,
        "includeNutrition": True,
        "includeLifestyle": True,
        "includeGoal": True,
        "includePlan": True,
        "bodyWindowDays": 7,
        "nutritionWindowDays": 7,
        "lifestyleWindowDays": 7,
        "relevantInsightCategories": ["body", "nutrition", "lifestyle"],
    },
}

def bound_timeline(timeline, start_date, end_date):
    if not isinstance(timeline, list):
        return []
    return [
        entry for entry in timeline
        if isinstance(entry.get("date"), str) and start_date <= entry["date"] <= end_date
    ]

def build_body_observations(entries):
    observations = []
    for entry in entries:
        body = entry.get("body")
        if not body:
            continue
        if body.get("weight", object()) is None and body.get("bodyFat", object()) is None:
            continue
        obs = {
            "type": "OBSERVED",
            "date": entry["date"]
        }
        if "weight" in body:
            obs["weightKg"] = body["weight"]
        if "bodyFat" in body:
            obs["bodyFatPercent"] = body["bodyFat"]
        observations.append(obs)
    return observations

def build_nutrition_observations(entries):
    observations = []
    for entry in entries:
        nutrition = entry.get("nutrition")
        if not nutrition:
            continue
        if nutrition.get("calories", object()) is None and nutrition.get("protein", object()) is None and nutrition.get("water", object()) is None:
            continue
        obs = {
            "type": "OBSERVED",
            "date": entry["date"]
        }
        if "calories" in nutrition:
            obs["calories"] = nutrition["calories"]
        if "protein" in nutrition:
            obs["proteinGrams"] = nutrition["protein"]
        if "water" in nutrition:
            obs["waterMl"] = nutrition["water"]
        observations.append(obs)
    return observations

def build_lifestyle_observations(entries):
    observations = []
    for entry in entries:
        lifestyle = entry.get("lifestyle")
        if not lifestyle:
            continue
        if lifestyle.get("workoutCompleted", object()) is None and lifestyle.get("steps", object()) is None and lifestyle.get("sleepHours", object()) is None:
            continue
        obs = {
            "type": "OBSERVED",
            "date": entry["date"]
        }
        if "workoutCompleted" in lifestyle:
            obs["workoutCompleted"] = lifestyle["workoutCompleted"]
        if "steps" in lifestyle:
            obs["steps"] = lifestyle["steps"]
        if "sleepHours" in lifestyle:
            obs["sleepHours"] = lifestyle["sleepHours"]
        observations.append(obs)
    return observations

def derive_weight_analytics(body_obs, window_days):
    derived = []
    valid_weights = [o for o in body_obs if o.get("weightKg") is not None]
    if not valid_weights:
        return derived
    
    avg = sum(o["weightKg"] for o in valid_weights) / len(valid_weights)
    derived.append({
        "type": "DERIVED",
        "metric": "averageWeight",
        "value": js_round(avg * 10) / 10.0,
        "unit": "kg",
        "calculation": { "method": "mean", "window": f"{window_days}d" }
    })
    
    if len(valid_weights) >= 2:
        first = valid_weights[0]
        last = valid_weights[-1]
        change = last["weightKg"] - first["weightKg"]
        derived.append({
            "type": "DERIVED",
            "metric": "weightChange",
            "value": js_round(change * 10) / 10.0,
            "unit": "kg",
            "calculation": { "method": "delta", "window": f"{window_days}d" }
        })
        
        # Rate of change
        d1 = datetime.strptime(first["date"], "%Y-%m-%d").replace(tzinfo=None)
        d2 = datetime.strptime(last["date"], "%Y-%m-%d").replace(tzinfo=None)
        duration_days = (d2 - d1).total_seconds() / (60 * 60 * 24)
        if duration_days > 0:
            derived.append({
                "type": "DERIVED",
                "metric": "weightRateOfChange",
                "value": js_round(change / duration_days * 100) / 100.0,
                "unit": "kg/day",
                "calculation": { "method": "delta_over_duration", "window": f"{window_days}d" }
            })
            
    return derived

def is_finite_number(val):
    return isinstance(val, (int, float)) and not isinstance(val, bool) and math.isfinite(val)

def derive_nutrition_analytics(nutrition_obs, target_calories, target_protein):
    derived = []
    valid_calories = [o for o in nutrition_obs if is_finite_number(o.get("calories"))]
    valid_protein = [o for o in nutrition_obs if is_finite_number(o.get("proteinGrams"))]
    
    if valid_calories:
        cal_avg = sum(o["calories"] for o in valid_calories) / len(valid_calories)
        derived.append({
            "type": "DERIVED",
            "metric": "averageCalories",
            "value": js_round(cal_avg),
            "unit": "kcal",
            "calculation": { "method": "mean", "window": "7d" }
        })
        if is_finite_number(target_calories) and target_calories > 0:
            derived.append({
                "type": "DERIVED",
                "metric": "calorieAdherence",
                "value": js_round((cal_avg / target_calories) * 1000) / 10.0,
                "unit": "%",
                "calculation": { "method": "percentage_of_target", "window": "7d" }
            })
            
    if valid_protein:
        prot_avg = sum(o["proteinGrams"] for o in valid_protein) / len(valid_protein)
        derived.append({
            "type": "DERIVED",
            "metric": "averageProtein",
            "value": js_round(prot_avg),
            "unit": "g",
            "calculation": { "method": "mean", "window": "7d" }
        })
        if is_finite_number(target_protein) and target_protein > 0:
            derived.append({
                "type": "DERIVED",
                "metric": "proteinAdherence",
                "value": js_round((prot_avg / target_protein) * 1000) / 10.0,
                "unit": "%",
                "calculation": { "method": "percentage_of_target", "window": "7d" }
            })
            
    return derived

def derive_lifestyle_analytics(lifestyle_obs):
    derived = []
    with_workout = [o for o in lifestyle_obs if o.get("workoutCompleted") in (True, False)]
    if with_workout:
        workout_count = len([o for o in with_workout if o.get("workoutCompleted") is True])
        derived.append({
            "type": "DERIVED",
            "metric": "totalWorkouts",
            "value": workout_count,
            "unit": "sessions",
            "calculation": { "method": "count", "window": "7d" }
        })
        
    valid_steps = [o for o in lifestyle_obs if is_finite_number(o.get("steps"))]
    if valid_steps:
        step_avg = sum(o["steps"] for o in valid_steps) / len(valid_steps)
        derived.append({
            "type": "DERIVED",
            "metric": "averageSteps",
            "value": js_round(step_avg),
            "unit": "steps/day",
            "calculation": { "method": "mean", "window": "7d" }
        })
        
    valid_sleep = [o for o in lifestyle_obs if is_finite_number(o.get("sleepHours"))]
    if valid_sleep:
        sleep_avg = sum(o["sleepHours"] for o in valid_sleep) / len(valid_sleep)
        derived.append({
            "type": "DERIVED",
            "metric": "averageSleep",
            "value": js_round(sleep_avg * 10) / 10.0,
            "unit": "hours/night",
            "calculation": { "method": "mean", "window": "7d" }
        })
        
    return derived

def calculate_pure_goal_progress(active_goal, body_obs):
    if not active_goal:
        return None
    if active_goal.get("domain") != "weight":
        return None
    if not is_finite_number(active_goal.get("start_value")) or not is_finite_number(active_goal.get("target_value")):
        return None
    if active_goal["start_value"] == active_goal["target_value"]:
        return None
        
    valid_weights = [o for o in body_obs if o.get("weightKg") is not None]
    if not valid_weights:
        return None
        
    latest_weight = valid_weights[-1]["weightKg"]
    start = active_goal["start_value"]
    target = active_goal["target_value"]
    raw = ((latest_weight - start) / (target - start)) * 100
    clamped = max(0, min(100, js_round(raw)))
    
    return { "progressPercent": clamped, "latestWeightKg": latest_weight }

def build_sanitized_profile(profile):
    if not profile:
        return None
    res = {}
    if "height" in profile:
        res["heightCm"] = profile["height"]
    if "weight" in profile:
        res["currentWeightKg"] = profile["weight"]
    return res

def build_sanitized_goal(active_goal, progress_percent):
    if not active_goal:
        return None
    return {
        "type": "USER_GOAL",
        "domain": active_goal.get("domain") or None,
        "startValue": active_goal["start_value"] if "start_value" in active_goal else None,
        "targetValue": active_goal["target_value"] if "target_value" in active_goal else None,
        "startDate": active_goal.get("start_date") or None,
        "targetDate": active_goal.get("target_date") or None,
        "progressPercent": progress_percent if progress_percent is not None else None,
    }

def build_sanitized_plan_targets(active_plan):
    if not active_plan:
        return None
        
    cal = active_plan.get("calories")
    prot = active_plan.get("protein")
    return {
        "type": "TARGET",
        "goal": active_plan.get("goal") or None,
        "level": active_plan.get("level") or None,
        "dietType": active_plan.get("diet_type") or None,
        "dailyCalories": cal if is_finite_number(cal) else None,
        "dailyProteinGrams": prot if is_finite_number(prot) else None,
    }

def filter_insights(insights, relevant_categories):
    if not isinstance(insights, list) or not insights:
        return []
    filtered = []
    for insight in insights:
        if insight and isinstance(insight.get("category"), str) and insight["category"] in relevant_categories:
            filtered.append(insight)
            if len(filtered) >= 5:
                break
                
    result = []
    for i in filtered:
        item = {
            "type": "DETERMINISTIC_INSIGHT",
            "id": i.get("id"),
            "category": i.get("category"),
        }
        if "observation" in i: item["observation"] = i["observation"]
        if "evidence" in i: item["evidence"] = i["evidence"]
        if "interpretation" in i: item["interpretation"] = i["interpretation"]
        if "recommendation" in i: item["recommendation"] = i["recommendation"]
        if "confidence" in i: item["confidence"] = i["confidence"]
        result.append(item)
    return result

def build_ai_context(params):
    question = params.get("question")
    current_date = params.get("currentDate")
    profile = params.get("profile")
    active_goal = params.get("activeGoal")
    active_plan = params.get("activePlan")
    timeline = params.get("timeline")
    insights = params.get("insights")
    
    intent = classify_intent(question)
    
    if not is_valid_date(current_date):
        return {
            "metadata": {
                "currentDate": None,
                "intent": intent,
                "error": "INVALID_CURRENT_DATE",
            },
            "profile": build_sanitized_profile(profile),
            "userGoal": None,
            "protocolTarget": None,
            "observations": [],
            "derivedAnalytics": [],
            "deterministicInsights": [],
        }
        
    config = INTENT_CONFIGS[intent]
    safe_timeline = timeline if isinstance(timeline, list) else []
    
    body_obs = []
    body_derived = []
    if config["includeBody"] and config["bodyWindowDays"] > 0:
        body_start = add_days(current_date, -(config["bodyWindowDays"] - 1))
        bounded = bound_timeline(safe_timeline, body_start, current_date)
        body_obs = build_body_observations(bounded)
        body_derived = derive_weight_analytics(body_obs, config["bodyWindowDays"])
        
    nutrition_obs = []
    nutrition_derived = []
    if config["includeNutrition"] and config["nutritionWindowDays"] > 0:
        nut_start = add_days(current_date, -(config["nutritionWindowDays"] - 1))
        bounded = bound_timeline(safe_timeline, nut_start, current_date)
        nutrition_obs = build_nutrition_observations(bounded)
        target_cal = active_plan.get("calories") if active_plan else None
        target_prot = active_plan.get("protein") if active_plan else None
        nutrition_derived = derive_nutrition_analytics(nutrition_obs, target_cal, target_prot)
        
    lifestyle_obs = []
    lifestyle_derived = []
    if config["includeLifestyle"] and config["lifestyleWindowDays"] > 0:
        life_start = add_days(current_date, -(config["lifestyleWindowDays"] - 1))
        bounded = bound_timeline(safe_timeline, life_start, current_date)
        lifestyle_obs = build_lifestyle_observations(bounded)
        lifestyle_derived = derive_lifestyle_analytics(lifestyle_obs)
        
    goal_payload = None
    if config["includeGoal"] and active_goal:
        goal_progress = calculate_pure_goal_progress(active_goal, body_obs)
        goal_payload = build_sanitized_goal(
            active_goal,
            goal_progress["progressPercent"] if goal_progress else None
        )
        
    plan_payload = None
    if config["includePlan"] and active_plan:
        plan_payload = build_sanitized_plan_targets(active_plan)
        
    all_observations = body_obs + nutrition_obs + lifestyle_obs
    all_derived = body_derived + nutrition_derived + lifestyle_derived
    
    filtered_insights = filter_insights(insights, config["relevantInsightCategories"])
    
    max_window = max(config["bodyWindowDays"], config["nutritionWindowDays"], config["lifestyleWindowDays"])
    
    return {
        "metadata": {
            "currentDate": current_date,
            "intent": intent,
            "windowDays": max_window,
        },
        "profile": build_sanitized_profile(profile),
        "userGoal": goal_payload,
        "protocolTarget": plan_payload,
        "observations": all_observations,
        "derivedAnalytics": all_derived,
        "deterministicInsights": filtered_insights,
    }
