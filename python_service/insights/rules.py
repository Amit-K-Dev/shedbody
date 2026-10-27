import math
from .primitives import add_days, is_valid_date, js_round, js_to_fixed

def is_finite(val):
    if val is None:
        return False
    if not isinstance(val, (int, float)):
        return False
    return not math.isnan(val) and not math.isinf(val)

class WeightTrendChangeRule:
    id = "WEIGHT_TREND_CHANGE"
    category = "body"
    priority = 10

    @staticmethod
    def can_evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        if not timeline or len(timeline) == 0:
            return False
        if not is_valid_date(current_date):
            return False
        
        current_start = add_days(current_date, -6)
        previous_start = add_days(current_date, -13)
        previous_end = add_days(current_date, -7)

        current_valid = 0
        previous_valid = 0

        for entry in timeline:
            body = entry.get('body', {})
            weight = body.get('weight')
            if weight is not None:
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    current_valid += 1
                elif date >= previous_start and date <= previous_end:
                    previous_valid += 1
        
        return current_valid >= 2 and previous_valid >= 1

    @staticmethod
    def evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        current_start = add_days(current_date, -6)
        previous_start = add_days(current_date, -13)
        previous_end = add_days(current_date, -7)

        current_sum = 0
        current_count = 0
        previous_sum = 0
        previous_count = 0
        latest_weight_date = ""

        for entry in timeline:
            body = entry.get('body', {})
            weight = body.get('weight')
            if weight is not None:
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    current_sum += weight
                    current_count += 1
                    if date > latest_weight_date:
                        latest_weight_date = date
                elif date >= previous_start and date <= previous_end:
                    previous_sum += weight
                    previous_count += 1

        current_avg = current_sum / current_count
        previous_avg = previous_sum / previous_count
        diff = current_avg - previous_avg

        if abs(diff) < 0.5:
            return None

        direction = "higher" if diff > 0 else "lower"
        confidence = "high" if current_count >= 4 and previous_count >= 3 else "medium"
        sign = "+" if diff > 0 else ""

        return {
            "id": "WEIGHT_TREND_CHANGE",
            "category": "body",
            "priority": 10,
            "observation": "Your average weight changed over the comparison period.",
            "evidence": f"Previous 7-day average: {js_to_fixed(previous_avg, 1)} kg; current 7-day average: {js_to_fixed(current_avg, 1)} kg; change: {sign}{js_to_fixed(diff, 1)} kg.",
            "interpretation": f"Your recent average weight is {direction} than the previous comparison period.",
            "recommendation": "Continue logging weight consistently so the trend can be monitored over time.",
            "confidence": confidence,
            "timestamp": latest_weight_date,
            "type": "info"
        }

class WorkoutConsistencyRule:
    id = "WORKOUT_CONSISTENCY"
    category = "lifestyle"
    priority = 20

    @staticmethod
    def can_evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        if not timeline or len(timeline) == 0:
            return False
        if not is_valid_date(current_date):
            return False
        
        current_start = add_days(current_date, -6)
        previous_start = add_days(current_date, -13)
        previous_end = add_days(current_date, -7)

        current_valid = 0
        previous_valid = 0

        for entry in timeline:
            lifestyle = entry.get('lifestyle', {})
            workout_completed = lifestyle.get('workoutCompleted')
            if workout_completed is True or workout_completed is False:
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    current_valid += 1
                elif date >= previous_start and date <= previous_end:
                    previous_valid += 1
                    
        return current_valid >= 2 and previous_valid >= 1

    @staticmethod
    def evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        current_start = add_days(current_date, -6)
        previous_start = add_days(current_date, -13)
        previous_end = add_days(current_date, -7)

        current_true = 0
        previous_true = 0
        latest_valid_date = ""

        for entry in timeline:
            lifestyle = entry.get('lifestyle', {})
            workout_completed = lifestyle.get('workoutCompleted')
            if workout_completed is True or workout_completed is False:
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    if workout_completed is True:
                        current_true += 1
                    if date > latest_valid_date:
                        latest_valid_date = date
                elif date >= previous_start and date <= previous_end:
                    if workout_completed is True:
                        previous_true += 1

        if current_true == previous_true:
            return None

        if current_true < previous_true:
            return {
                "id": "WORKOUT_CONSISTENCY_DROP",
                "category": "lifestyle",
                "priority": 20,
                "observation": "Your workout frequency decreased this week.",
                "evidence": f"Previous 7 days: {previous_true} workout(s). Current 7 days: {current_true} workout(s).",
                "interpretation": "You completed fewer workouts in the current comparison period.",
                "recommendation": "Try to schedule a light session to rebuild your momentum.",
                "confidence": "medium",
                "timestamp": latest_valid_date,
                "type": "warning"
            }
        else:
            return {
                "id": "WORKOUT_CONSISTENCY_IMPROVED",
                "category": "lifestyle",
                "priority": 20,
                "observation": "Your workout frequency increased this week.",
                "evidence": f"Previous 7 days: {previous_true} workout(s). Current 7 days: {current_true} workout(s).",
                "interpretation": "You successfully completed more workouts in the current comparison period.",
                "recommendation": "Keep up the excellent consistency and ensure you are recovering adequately.",
                "confidence": "high",
                "timestamp": latest_valid_date,
                "type": "positive"
            }

class NutritionCaloricAdherenceRule:
    id = "NUTRITION_CALORIC_ADHERENCE"
    category = "nutrition"
    priority = 30

    @staticmethod
    def can_evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        if not timeline or len(timeline) == 0:
            return False
        if not is_valid_date(current_date):
            return False
        
        if not active_plan:
            return False
        calories = active_plan.get('calories')
        if not is_finite(calories) or calories <= 0:
            return False

        current_start = add_days(current_date, -6)
        current_valid = 0

        for entry in timeline:
            nutrition = entry.get('nutrition', {})
            cal = nutrition.get('calories')
            if is_finite(cal):
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    current_valid += 1
        
        return current_valid >= 3

    @staticmethod
    def evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        current_start = add_days(current_date, -6)
        
        total_sum = 0
        count = 0
        latest_valid_date = ""

        for entry in timeline:
            nutrition = entry.get('nutrition', {})
            cal = nutrition.get('calories')
            if is_finite(cal):
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    total_sum += cal
                    count += 1
                    if date > latest_valid_date:
                        latest_valid_date = date

        average = total_sum / count
        target = active_plan.get('calories')
        deviation = abs(average - target) / target

        if deviation <= 0.10:
            return {
                "id": "NUTRITION_CALORIC_ADHERENCE_POSITIVE",
                "category": "nutrition",
                "priority": 30,
                "observation": "You are accurately hitting your calorie target.",
                "evidence": f"7-day average: {js_round(average)} kcal. Target: {js_round(target)} kcal (within 10%).",
                "interpretation": "Your recent caloric intake is well-aligned with your active plan.",
                "recommendation": "Maintain this intake level for consistent progress.",
                "confidence": "high" if count >= 5 else "medium",
                "timestamp": latest_valid_date,
                "type": "positive"
            }
        
        return None

class ProteinConsistencyRule:
    id = "PROTEIN_CONSISTENCY"
    category = "nutrition"
    priority = 35

    @staticmethod
    def can_evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        if not timeline or len(timeline) == 0:
            return False
        if not is_valid_date(current_date):
            return False
        
        if not active_plan:
            return False
        protein = active_plan.get('protein')
        if not is_finite(protein) or protein <= 0:
            return False

        current_start = add_days(current_date, -6)
        current_valid = 0

        for entry in timeline:
            nutrition = entry.get('nutrition', {})
            prot = nutrition.get('protein')
            if is_finite(prot):
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    current_valid += 1
        
        return current_valid >= 3

    @staticmethod
    def evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        current_start = add_days(current_date, -6)
        
        total_sum = 0
        count = 0
        latest_valid_date = ""

        for entry in timeline:
            nutrition = entry.get('nutrition', {})
            prot = nutrition.get('protein')
            if is_finite(prot):
                date = entry.get('date')
                if date >= current_start and date <= current_date:
                    total_sum += prot
                    count += 1
                    if date > latest_valid_date:
                        latest_valid_date = date

        average = total_sum / count
        target = active_plan.get('protein')
        deviation = abs(average - target) / target

        if deviation <= 0.10:
            return {
                "id": "PROTEIN_CONSISTENCY_POSITIVE",
                "category": "nutrition",
                "priority": 35,
                "observation": "You are accurately hitting your protein target.",
                "evidence": f"7-day average: {js_round(average)}g. Target: {js_round(target)}g (within 10%).",
                "interpretation": "Your recent protein intake is well-aligned with your active plan.",
                "recommendation": "Maintain this intake level for consistent progress.",
                "confidence": "high" if count >= 5 else "medium",
                "timestamp": latest_valid_date,
                "type": "positive"
            }
        
        return None

class GoalProgressRule:
    id = "GOAL_PROGRESS"
    category = "body"
    priority = 5

    @staticmethod
    def can_evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        if not timeline or len(timeline) == 0:
            return False
        if not active_weight_goal:
            return False
        
        if active_weight_goal.get('domain') != "weight" or active_weight_goal.get('status') != "active":
            return False
            
        start_value = active_weight_goal.get('start_value')
        target_value = active_weight_goal.get('target_value')

        if not is_finite(start_value) or not is_finite(target_value):
            return False
        if start_value == target_value:
            return False
        
        has_valid_weight = False
        for entry in timeline:
            body = entry.get('body', {})
            weight = body.get('weight')
            if is_finite(weight):
                has_valid_weight = True
                break
        
        return has_valid_weight

    @staticmethod
    def evaluate(timeline, profile, active_plan, active_weight_goal, current_date):
        latest_weight = None
        latest_weight_date = ""

        for entry in timeline:
            body = entry.get('body', {})
            weight = body.get('weight')
            if is_finite(weight):
                latest_weight = weight
                date = entry.get('date')
                if date > latest_weight_date:
                    latest_weight_date = date

        if latest_weight is None:
            return None

        start_value = active_weight_goal.get('start_value')
        target_value = active_weight_goal.get('target_value')

        raw_progress = (latest_weight - start_value) / (target_value - start_value)
        display_progress = max(0, min(1, raw_progress))

        interpretation = ""
        display_percentage = js_round(display_progress * 100)

        if raw_progress >= 1:
            interpretation = "You are at or beyond your target."
        elif raw_progress < 0:
            interpretation = "Your current weight is moving away from the target relative to the starting point."
        else:
            interpretation = f"You have completed approximately {display_percentage}% of your weight goal."

        return {
            "id": "GOAL_PROGRESS_INFO",
            "category": "body",
            "priority": 5,
            "observation": "Current state of your active weight goal.",
            "evidence": f"Start: {start_value}, Target: {target_value}, Current: {latest_weight}. Progress: {display_percentage}% (Raw: {js_to_fixed(raw_progress * 100, 1)}%).",
            "interpretation": interpretation,
            "recommendation": "Keep tracking your weight to monitor your progress over time.",
            "confidence": "high",
            "timestamp": latest_weight_date,
            "type": "info"
        }

rules = [
    WeightTrendChangeRule(),
    WorkoutConsistencyRule(),
    NutritionCaloricAdherenceRule(),
    ProteinConsistencyRule(),
    GoalProgressRule()
]
