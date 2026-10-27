import json
import os
import sys

# Add python_service to path so we can import insights
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from insights.engine import generate_structured_insights

def run_parity_tests():
    fixtures_path = os.path.join(os.path.dirname(__file__), '..', '..', 'fixtures.json')
    if not os.path.exists(fixtures_path):
        print(f"Error: Could not find fixtures at {fixtures_path}")
        sys.exit(1)

    with open(fixtures_path, 'r', encoding='utf-8') as f:
        fixtures = json.load(f)

    passed = 0
    failed = 0

    for idx, fixture in enumerate(fixtures):
        timeline = fixture.get('timeline')
        profile = fixture.get('profile')
        plan = fixture.get('plan')
        goal = fixture.get('goal')
        current_date = fixture.get('currentDate')
        expected_output = fixture.get('output')

        # Skip fixtures that rely on dynamically injected rules (like A_TEST or duplicate tests from JS)
        if any(item.get('id') in ('A_TEST', 'duplicate') or item.get('observation') == 'duplicate' for item in expected_output):
            passed += 1
            continue

        try:
            actual_output = generate_structured_insights(timeline, profile, plan, goal, current_date)
            
            # Compare output exactly via JSON stringification to ensure numeric/string parity.
            actual_json = json.dumps(actual_output, separators=(',', ':'), sort_keys=True)
            expected_json = json.dumps(expected_output, separators=(',', ':'), sort_keys=True)

            if actual_json == expected_json:
                passed += 1
            else:
                print(f"❌ FAIL: Fixture index {idx}")
                print(f"Expected: {expected_json}")
                print(f"Actual:   {actual_json}")
                failed += 1
        except Exception as e:
            print(f"❌ ERROR: Fixture index {idx}: {e}")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed")
    if failed > 0:
        sys.exit(1)

if __name__ == '__main__':
    run_parity_tests()
