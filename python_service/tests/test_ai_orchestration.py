import unittest
from unittest.mock import patch, MagicMock
import os
import json
from requests.exceptions import Timeout, RequestException

from python_service.orchestration.provider import call_ai_provider, ProviderError
from python_service.orchestration.ai_coach import process_ai_coach_request
from python_service.orchestration.response_validator import validate_ai_response_schema, validate_ai_response_safety

class TestAIProvider(unittest.TestCase):
    def setUp(self):
        self.env_patcher = patch.dict(os.environ, {
            "OPENROUTER_API_KEY": "test_key",
            "OPENROUTER_MODEL": "test/model"
        })
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    @patch("python_service.orchestration.provider.requests.post")
    def test_call_ai_provider_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.ok = True
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": "SUCCESS_RESPONSE"}}]
        }
        mock_post.return_value = mock_resp

        result = call_ai_provider("system", "user")
        self.assertEqual(result, "SUCCESS_RESPONSE")
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(kwargs["timeout"], (5.0, 45.0))

    @patch("python_service.orchestration.provider.requests.post")
    def test_call_ai_provider_timeout(self, mock_post):
        mock_post.side_effect = Timeout("Timed out")
        with self.assertRaises(ProviderError) as context:
            call_ai_provider("sys", "user")
        self.assertEqual(context.exception.status, 504)

    @patch("python_service.orchestration.provider.requests.post")
    def test_call_ai_provider_auth_error(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.ok = False
        mock_resp.status_code = 401
        mock_resp.reason = "Unauthorized"
        mock_resp.json.return_value = {"error": {"message": "Invalid api key: test_key"}}
        mock_post.return_value = mock_resp

        with self.assertRaises(ProviderError) as context:
            call_ai_provider("sys", "user")
        self.assertEqual(context.exception.status, 401)
        self.assertIn("[REDACTED_API_KEY]", str(context.exception))
        self.assertNotIn("test_key", str(context.exception))

    def test_missing_env(self):
        with patch.dict(os.environ, clear=True):
            with self.assertRaises(ProviderError) as context:
                call_ai_provider("sys", "user")
            self.assertEqual(context.exception.status, 500)

class TestResponseValidator(unittest.TestCase):
    def test_valid_schema(self):
        payload = {
            "type": "motivation",
            "title": "Good Job",
            "summary": "Keep it up",
            "evidence": [
                {
                    "claimType": "DIRECT_OBSERVATION",
                    "supportedBy": ["obs_123"],
                    "assertedValue": 100,
                    "unit": "kg"
                }
            ],
            "recommendations": [
                {
                    "text": "Do a thing",
                    "recommendationBasis": "GOAL_SUPPORT",
                    "supportedBy": ["obs_123"]
                }
            ],
            "confidence": "high",
            "safetyNote": None
        }
        valid, err = validate_ai_response_schema(payload)
        self.assertTrue(valid, err)

    def test_invalid_schema_type(self):
        payload = {"type": "not_real"} # missing other fields too
        valid, err = validate_ai_response_schema(payload)
        self.assertFalse(valid)

    def test_safety_rejection(self):
        payload = {
            "type": "motivation",
            "recommendations": [{"text": "eat 500 calories a day"}]
        }
        valid, err = validate_ai_response_safety(payload)
        self.assertFalse(valid)

class TestAICoachOrchestration(unittest.TestCase):
    def setUp(self):
        self.env_patcher = patch.dict(os.environ, {
            "INTERNAL_API_SECRET": "secret123",
            "OPENROUTER_API_KEY": "test_key",
            "OPENROUTER_MODEL": "test/model",
            "ENVIRONMENT": "test"
        })
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    def get_mock_d10_payload(self):
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self.today = today
        return {
            "data": {
                "profile": {"heightCm": 180, "currentWeightKg": 80},
                "goal": {"domain": "weight", "startValue": 80, "targetValue": 75},
                "plan": {"dailyCalories": 2000, "dailyProteinGrams": 150},
                "progress": [{"date": today, "weightKg": 80}],
                "nutrition": [{"date": today, "calories": 1950, "proteinGrams": 140}],
                "lifestyle": [{"date": today, "workoutCompleted": True}]
            }
        }

    def get_mock_ai_response(self):
        return {
            "type": "analysis",
            "title": "Analysis",
            "summary": "You are doing well.",
            "evidence": [
                {
                    "claimType": "DIRECT_OBSERVATION",
                    "supportedBy": [f"obs_weightKg_{self.today}"],
                    "assertedValue": 80,
                    "unit": "kg"
                }
            ],
            "recommendations": [
                {
                    "text": "Keep eating 2000 calories.",
                    "recommendationBasis": "GOAL_SUPPORT",
                    "supportedBy": ["target_calories"]
                }
            ],
            "confidence": "high",
            "safetyNote": None
        }

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_successful_flow(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = self.get_mock_d10_payload()
        mock_get.return_value = mock_get_resp

        mock_ai.return_value = json.dumps(self.get_mock_ai_response())

        resp, status = process_ai_coach_request("userA", "How am I doing?", "GENERAL_SUMMARY")
        
        self.assertEqual(status, 200)
        self.assertTrue(resp["success"])
        self.assertEqual(resp["data"]["title"], "Analysis")
        
        # Verify isolation: we pass user_id down to internal API
        args, kwargs = mock_get.call_args
        self.assertEqual(kwargs["params"]["user_id"], "userA")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer secret123")

    @patch("python_service.orchestration.ai_coach.requests.get")
    def test_internal_api_failure(self, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = False
        mock_get.return_value = mock_get_resp

        resp, status = process_ai_coach_request("userA", "Question")
        self.assertEqual(status, 500)
        self.assertFalse(resp["success"])
        self.assertEqual(resp["error"], "Internal Context Error.")

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_ai_provider_error(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = self.get_mock_d10_payload()
        mock_get.return_value = mock_get_resp

        mock_ai.side_effect = ProviderError("Rate limit", 429)

        resp, status = process_ai_coach_request("userA", "Question")
        self.assertEqual(status, 429)
        self.assertIn("rate limit reached", resp["error"])

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_schema_failure(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = self.get_mock_d10_payload()
        mock_get.return_value = mock_get_resp

        # Invalid schema (missing title)
        bad_response = self.get_mock_ai_response()
        del bad_response["title"]
        mock_ai.return_value = json.dumps(bad_response)

        resp, status = process_ai_coach_request("userA", "Question")
        self.assertEqual(status, 500)
        self.assertFalse(resp["success"])

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_grounding_failure(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = self.get_mock_d10_payload()
        mock_get.return_value = mock_get_resp

        # Reference a non-existent claim ID
        bad_response = self.get_mock_ai_response()
        bad_response["evidence"][0]["supportedBy"] = ["not_a_real_id"]
        mock_ai.return_value = json.dumps(bad_response)

        resp, status = process_ai_coach_request("userA", "Question")
        self.assertEqual(status, 422)
        self.assertEqual(resp["error"], "AI_GROUNDING_VIOLATION")

    def test_missing_internal_auth(self):
        with patch.dict(os.environ, {"INTERNAL_API_SECRET": ""}):
            resp, status = process_ai_coach_request("userA", "Question")
            self.assertEqual(status, 500)
            self.assertFalse(resp["success"])

    @patch("python_service.orchestration.ai_coach.requests.get")
    def test_d10_1_timeout(self, mock_get):
        from requests.exceptions import Timeout
        mock_get.side_effect = Timeout("Timeout from D10-1")
        resp, status = process_ai_coach_request("userA", "Question")
        self.assertEqual(status, 500)
        self.assertEqual(resp["error"], "DATA_FETCH_FAILED")

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_provider_403_404_500(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = self.get_mock_d10_payload()
        mock_get.return_value = mock_get_resp
        
        # 403
        mock_ai.side_effect = ProviderError("Forbidden", 403)
        resp, status = process_ai_coach_request("userA", "Q")
        self.assertEqual(status, 403)
        self.assertIn("authentication failed", resp["error"])
        
        # 404
        mock_ai.side_effect = ProviderError("Not Found", 404)
        resp, status = process_ai_coach_request("userA", "Q")
        self.assertEqual(status, 404)
        self.assertIn("model configuration error", resp["error"])
        
        # 500
        mock_ai.side_effect = ProviderError("Internal", 500)
        resp, status = process_ai_coach_request("userA", "Q")
        self.assertEqual(status, 500)
        self.assertIn("provider configuration error", resp["error"])

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_malformed_json_response(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = self.get_mock_d10_payload()
        mock_get.return_value = mock_get_resp

        for bad_json in ["", "{truncated", "invalid json["]:
            mock_ai.return_value = bad_json
            resp, status = process_ai_coach_request("userA", "Q")
            self.assertEqual(status, 502)
            self.assertEqual(resp["error"], "Bad Gateway")
            
    def test_question_length_boundaries(self):
        # Max length
        max_q = "a" * 1000
        # Mock requests.get so we get past length validation and see it hit internal auth or requests get
        with patch("python_service.orchestration.ai_coach.requests.get") as mock_get:
            mock_get.return_value.ok = False
            resp, status = process_ai_coach_request("userA", max_q)
            self.assertNotEqual(status, 400)
        
        # Max + 1 length
        too_long = "a" * 1001
        resp, status = process_ai_coach_request("userA", too_long)
        self.assertEqual(status, 400)
        self.assertIn("exceeds maximum length", resp["error"])
        
    def test_missing_base_url_prod(self):
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}):
            if "NEXT_PUBLIC_SITE_URL" in os.environ:
                del os.environ["NEXT_PUBLIC_SITE_URL"]
            resp, status = process_ai_coach_request("userA", "Q")
            self.assertEqual(status, 500)
            self.assertEqual(resp["error"], "Internal Context Error.")


class TestDataNormalizationEquivalence(unittest.TestCase):
    def setUp(self):
        self.env_patcher = patch.dict(os.environ, {
            "INTERNAL_API_SECRET": "secret123",
            "ENVIRONMENT": "test"
        })
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_empty_d10_payload(self, mock_ai, mock_get):
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = {"data": {}}
        mock_get.return_value = mock_get_resp
        
        mock_ai.return_value = json.dumps({
            "type": "analysis",
            "title": "A",
            "summary": "B",
            "evidence": [],
            "recommendations": [],
            "confidence": "medium",
            "safetyNote": None
        })
        
        resp, status = process_ai_coach_request("userA", "Q")
        self.assertEqual(status, 200)

    @patch("python_service.orchestration.ai_coach.requests.get")
    @patch("python_service.orchestration.ai_coach.call_ai_provider")
    def test_nulls_and_zeroes(self, mock_ai, mock_get):
        from datetime import datetime, timezone
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        mock_get_resp = MagicMock()
        mock_get_resp.ok = True
        mock_get_resp.json.return_value = {
            "data": {
                "profile": None, 
                "goal": None,
                "plan": {"dailyCalories": 0}, 
                "progress": [{"date": today, "weightKg": None}], 
                "nutrition": [{"date": today, "calories": 0, "proteinGrams": None}],
                "lifestyle": [{"date": today, "workoutCompleted": False}]
            }
        }
        mock_get.return_value = mock_get_resp
        
        mock_ai.return_value = json.dumps({
            "type": "analysis",
            "title": "A",
            "summary": "B",
            "evidence": [
                 {
                    "claimType": "DIRECT_OBSERVATION",
                    "supportedBy": [f"obs_calories_{today}"],
                    "assertedValue": 0,
                    "unit": "kcal"
                 }
            ],
            "recommendations": [],
            "confidence": "medium",
            "safetyNote": None
        })
        
        resp, status = process_ai_coach_request("userA", "Q")
        self.assertEqual(status, 200)


class TestSchemaBoundaries(unittest.TestCase):
    def test_schema_field_limits(self):
        base_payload = {
            "type": "analysis",
            "title": "A",
            "summary": "B",
            "evidence": [],
            "recommendations": [],
            "confidence": "medium",
            "safetyNote": None
        }
        
        p = dict(base_payload)
        p["title"] = "A" * 101
        valid, err = validate_ai_response_schema(p)
        self.assertFalse(valid)
        self.assertIn("title exceeds", err)
        
        p = dict(base_payload)
        p["summary"] = "A" * 501
        valid, err = validate_ai_response_schema(p)
        self.assertFalse(valid)
        self.assertIn("summary exceeds", err)
        
        p = dict(base_payload)
        p["recommendations"] = [{
            "text": "A" * 201,
            "recommendationBasis": "GOAL_SUPPORT",
            "supportedBy": ["obs_1"]
        }]
        valid, err = validate_ai_response_schema(p)
        self.assertFalse(valid)
        self.assertIn("text exceeds 200", err)
        
        p = dict(base_payload)
        p["recommendations"] = [
            {"text": "A", "recommendationBasis": "GOAL_SUPPORT", "supportedBy": ["obs_1"]}
        ] * 4
        valid, err = validate_ai_response_schema(p)
        self.assertFalse(valid)
        self.assertIn("more than 3", err)
        
        p = dict(base_payload)
        p["safetyNote"] = "A" * 201
        valid, err = validate_ai_response_schema(p)
        self.assertFalse(valid)
        self.assertIn("safetyNote exceeds", err)


if __name__ == "__main__":
    unittest.main()
