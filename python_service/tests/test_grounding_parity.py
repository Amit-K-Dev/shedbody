import os
import json
import unittest
from python_service.intelligence.grounding_validator import validate_grounding

class TestGroundingParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixtures_path = os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'd10-3-fixtures.json')
        with open(fixtures_path, 'r', encoding='utf-8') as f:
            cls.fixtures = json.load(f)

    def test_grounding_parity(self):
        grounding_fixtures = self.fixtures.get("grounding", [])
        self.assertTrue(len(grounding_fixtures) > 0)
        for fixture in grounding_fixtures:
            name = fixture["name"]
            claims = fixture["input_claims"]
            context_dict = fixture["input_dict"]
            expected = fixture["output"]
            
            result = validate_grounding(claims, context_dict)
            
            self.assertEqual(result["valid"], expected["valid"], f"Grounding mismatch on {name}")

if __name__ == '__main__':
    unittest.main()
