from .rules import rules

def generate_structured_insights(unified_timeline, profile, active_plan, active_weight_goal, current_date):
    if not unified_timeline or not isinstance(unified_timeline, list) or len(unified_timeline) == 0:
        return []

    generated_insights = []
    seen_ids = set()

    for rule in rules:
        if rule.id in seen_ids:
            continue

        try:
            if rule.can_evaluate(unified_timeline, profile, active_plan, active_weight_goal, current_date):
                insight = rule.evaluate(unified_timeline, profile, active_plan, active_weight_goal, current_date)
                if insight and insight.get('id'):
                    generated_insights.append(insight)
                    seen_ids.add(insight['id'])
        except Exception as e:
            # We print error similarly to JS engine
            print(f"Error evaluating insight rule {rule.id}: {e}")

    # Sorting
    # 1. Priority (asc)
    # 2. Category (alpha)
    # 3. ID (alpha)
    generated_insights.sort(key=lambda x: (x.get('priority', 0), x.get('category', ''), x.get('id', '')))

    return generated_insights
