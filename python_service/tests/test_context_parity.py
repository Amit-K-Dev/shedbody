import os
import json
import unittest
from python_service.intelligence.context_builder import build_ai_context
from python_service.intelligence.context_validator import validate_ai_context

class TestContextParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixtures_path = os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'd10-3-fixtures.json')
        with open(fixtures_path, 'r', encoding='utf-8') as f:
            cls.fixtures = json.load(f)

    def test_builder_parity(self):
        builder_fixtures = self.fixtures.get("builder", [])
        self.assertTrue(len(builder_fixtures) > 0)
        for fixture in builder_fixtures:
            name = fixture["name"]
            input_p = fixture["input"]
            expected = fixture["output"]
            
            result = build_ai_context(input_p)
            self.assertEqual(result, expected, f"Builder failed on {name}")

    def test_validator_parity(self):
        validator_fixtures = self.fixtures.get("validator", [])
        self.assertTrue(len(validator_fixtures) > 0)
        for fixture in validator_fixtures:
            name = fixture["name"]
            input_payload = fixture["payload"] if "payload" in fixture else fixture["input"]
            expected = fixture["output"]
            
            result = validate_ai_context(input_payload)
            
            self.assertEqual(result["valid"], expected["valid"], f"Validator 'valid' mismatch on {name}")
            if not expected["valid"]:
                self.assertIn("error", result, f"Validator missing error on {name}")
                # We don't strictly require the error strings to be perfectly identical,
                # but we ensure it fails appropriately.

if __name__ == '__main__':
    unittest.main()
