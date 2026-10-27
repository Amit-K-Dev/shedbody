def normalize_d10_payload(d10_payload):
    # Maps the payload from D10-1 JSON boundary into
    # the exact data structures expected by the JS engine equivalent.

    profile = d10_payload.get('profile')
    # JS didn't really use profile for deterministic rules yet, but we map it verbatim or simply pass it along.

    # Goal mapping
    active_weight_goal = None
    goal = d10_payload.get('goal')
    if goal and goal.get('domain') == 'weight':
        active_weight_goal = {
            'domain': goal.get('domain'),
            'status': 'active', # Since D10-1 only returns activeWeightGoal
            'start_value': goal.get('startValue'),
            'target_value': goal.get('targetValue')
        }

    # Plan mapping
    active_plan = None
    plan = d10_payload.get('plan')
    if plan:
        active_plan = {
            'calories': plan.get('dailyCalories'),
            'protein': plan.get('dailyProteinGrams')
        }

    # Unified Timeline
    timeline_map = {}

    def get_or_create(date):
        if date not in timeline_map:
            timeline_map[date] = {
                'date': date,
                'body': {},
                'nutrition': {},
                'lifestyle': {}
            }
        return timeline_map[date]

    for p in d10_payload.get('progress', []):
        date = p.get('date')
        if not date: continue
        entry = get_or_create(date)
        entry['body']['weight'] = p.get('weightKg')
        # We also might map bodyFatPercent, but the rules don't use it yet.

    for n in d10_payload.get('nutrition', []):
        date = n.get('date')
        if not date: continue
        entry = get_or_create(date)
        entry['nutrition']['calories'] = n.get('calories')
        entry['nutrition']['protein'] = n.get('proteinGrams')

    for l in d10_payload.get('lifestyle', []):
        date = l.get('date')
        if not date: continue
        entry = get_or_create(date)
        entry['lifestyle']['workoutCompleted'] = l.get('workoutCompleted')

    unified_timeline = list(timeline_map.values())
    
    # D10-1 response doesn't provide current_date, the caller should provide it,
    # or the integration endpoint should.
    return {
        'unifiedTimeline': unified_timeline,
        'profile': profile,
        'activePlan': active_plan,
        'activeWeightGoal': active_weight_goal
    }
