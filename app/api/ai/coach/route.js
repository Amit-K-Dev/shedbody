import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


import { buildAiContext } from "@/lib/ai/contextBuilder";
import { validateAiContext } from "@/lib/ai/contextValidator";
import { callAiProvider } from "@/lib/ai/providerAdapter";
import { 
  validateAiResponseSchema, 
  validateAiResponseSafety 
} from "@/lib/ai/responseValidator";
import { validateGrounding } from "@/lib/ai/groundingValidator";

import { getBoundedProgress } from "@/lib/analytics/progress";
import { getProfileData } from "@/lib/dashboard/getProfileData";
import { getLifestyleData } from "@/lib/dashboard/getLifestyleData";
import { getNutritionData } from "@/lib/dashboard/getNutritionData";
import { getPlans } from "@/lib/storage";
import { getActiveGoal } from "@/lib/goals";
import { mergeDailyMetrics } from "@/lib/analytics/unified";
import { generateStructuredInsights } from "@/lib/insights/engine";

export const maxDuration = 60;

const MAX_QUESTION_LENGTH = 1000;
const ALLOWED_INTENTS = [
  "WEIGHT_TREND", 
  "GOAL_PROGRESS", 
  "NUTRITION_ADHERENCE", 
  "WORKOUT_LIFESTYLE", 
  "GENERAL_SUMMARY"
];

const SYSTEM_PROMPT = `You are ShedBody's AI Coach.
You provide evidence-based, deterministic fitness, nutrition, and lifestyle advice.
You MUST respond with a JSON object exactly matching this schema:
{
  "type": "analysis" | "correction" | "motivation" | "action_plan" | "educational",
  "title": "String max 100 chars",
  "summary": "String max 500 chars",
  "evidence": [
    {
      "claimType": "DIRECT_OBSERVATION" | "DERIVED_ANALYTIC" | "USER_GOAL" | "DETERMINISTIC_INSIGHT",
      "supportedBy": ["reference_id_from_context"],
      "assertedValue": 123,
      "unit": "kg",
      "insightId": "string (only if claimType is DETERMINISTIC_INSIGHT)"
    }
  ],
  "recommendations": [
    {
      "text": "String describing the recommendation max 200 chars",
      "recommendationBasis": "GOAL_SUPPORT" | "METRIC_CORRECTION" | "TREND_MAINTENANCE",
      "supportedBy": ["reference_id_from_context"]
    }
  ],
  "confidence": "high" | "medium",
  "safetyNote": "string max 200 chars or null"
}
Every claim and recommendation MUST be fully supported by the provided Context Dictionary.
Do NOT invent facts, IDs, targets, goals, observations, or insights.
Do NOT make arbitrary causal claims unless backed by a DETERMINISTIC_INSIGHT.
You must use the EXACT request-scoped reference IDs provided in the Context Dictionary.
Do NOT provide medical diagnosis.
Do NOT make predictions or guarantees about outcomes.
Do NOT speak with medical certainty.`;

function getUnit(key) {
  const units = {
    weightKg: "kg", averageWeight: "kg", weightChange: "kg", weightRateOfChange: "kg/day",
    calories: "kcal", averageCalories: "kcal", dailyCalories: "kcal",
    proteinGrams: "g", averageProtein: "g", dailyProteinGrams: "g",
    waterMl: "ml",
    workoutCompleted: "boolean", totalWorkouts: "count",
    steps: "steps", averageSteps: "steps",
    sleepHours: "hours", averageSleep: "hours",
    calorieAdherence: "%", proteinAdherence: "%", progressPercent: "%"
  };
  return units[key] || "unit";
}

function buildContextDictionary(context) {
  const dict = {};
  
  if (context.observations) {
    context.observations.forEach(obs => {
      for (const [k, v] of Object.entries(obs)) {
        if (k !== 'date' && v !== null) {
          dict[`obs_${k}_${obs.date}`] = {
            type: "DIRECT_OBSERVATION",
            value: v,
            unit: getUnit(k)
          };
        }
      }
    });
  }
  
  if (context.derivedAnalytics) {
    context.derivedAnalytics.forEach(da => {
      dict[`da_${da.metric}`] = {
        type: "DERIVED_ANALYTIC",
        value: da.value,
        unit: da.unit || getUnit(da.metric)
      };
    });
  }
  
  if (context.userGoal) {
    dict[`goal_${context.userGoal.domain}`] = {
      type: "USER_GOAL",
      value: context.userGoal.targetValue,
      unit: getUnit(context.userGoal.domain)
    };
  }
  
  if (context.protocolTarget) {
    dict[`target_calories`] = { type: "PROTOCOL_TARGET", value: context.protocolTarget.dailyCalories, unit: "kcal" };
    dict[`target_protein`] = { type: "PROTOCOL_TARGET", value: context.protocolTarget.dailyProteinGrams, unit: "g" };
  }
  
  if (context.deterministicInsights) {
    context.deterministicInsights.forEach(insight => {
      dict[`insight_${insight.id}`] = { type: "DETERMINISTIC_INSIGHT" };
    });
  }
  
  return dict;
}

export async function POST(req) {
  try {
    const supabase = await createClient();

    // 1. Authentication (Supabase SSR)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const authContext = { supabase, userId: user.id };

    // 2. Request Parsing & Validation
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request payload." }, { status: 400 });
    }

    const { question, intent, ...unexpectedFields } = body;

    if (Object.keys(unexpectedFields).length > 0) {
      return NextResponse.json({ success: false, error: "Unexpected fields in request body." }, { status: 400 });
    }

    if (typeof question !== "string" || question.trim() === "") {
      return NextResponse.json({ success: false, error: "Question must be a non-empty string." }, { status: 400 });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json({ success: false, error: `Question exceeds maximum length of ${MAX_QUESTION_LENGTH} characters.` }, { status: 400 });
    }

    if (intent !== undefined) {
      if (!ALLOWED_INTENTS.includes(intent)) {
        return NextResponse.json({ success: false, error: "Invalid intent." }, { status: 400 });
      }
    }

    // 3. Server-Side Context Building
    const now = new Date();
    const past = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    const endDateStr = now.toISOString().slice(0, 10);
    const startDateStr = past.toISOString().slice(0, 10);

    const [boundedProgress, profileData, plans, activeWeightGoal, lifestyleLogs, nutritionLogs] = await Promise.all([
      getBoundedProgress(authContext, startDateStr, endDateStr),
      getProfileData(authContext),
      getPlans(authContext),
      getActiveGoal("weight", authContext),
      getLifestyleData(authContext, startDateStr, endDateStr),
      getNutritionData(authContext, startDateStr, endDateStr),
    ]).catch(err => {
      console.error("Data fetch error:", err);
      throw new Error("DATA_FETCH_FAILED");
    });

    const unifiedTimeline = mergeDailyMetrics(boundedProgress, nutritionLogs, lifestyleLogs);
    const currentPlan = (plans || []).find((p) => p.is_active === true) || null;
    const insights = generateStructuredInsights(unifiedTimeline, profileData, currentPlan, activeWeightGoal, endDateStr);

    const rawContext = buildAiContext({
      question,
      currentDate: endDateStr,
      profile: profileData,
      activeGoal: activeWeightGoal,
      activePlan: currentPlan,
      timeline: unifiedTimeline,
      insights: insights
    });

    // 4. Context Validation (Firewall)
    const contextValidation = validateAiContext(rawContext);
    if (!contextValidation.valid) {
      console.error("Context Validation Failed:", contextValidation.error);
      return NextResponse.json({ success: false, error: "Internal Context Error." }, { status: 500 });
    }

    const secureContext = contextValidation.data;
    
    // 4.5. Generate Request-Scoped Context Dictionary (Grounding Contract V2)
    const contextDict = buildContextDictionary(secureContext);

    // 5. AI Provider Call
    let aiResponseString;
    try {
      const userPrompt = `User Question: "${question}"\n\nContext Dictionary:\n${JSON.stringify(contextDict, null, 2)}`;
      aiResponseString = await callAiProvider(SYSTEM_PROMPT, userPrompt);
    } catch (err) {
      console.error("AI Provider Error:", err.message);
      const statusCode = err.status || 502;
      let clientMsg = "Unable to connect to the AI provider. Please try again later.";

      if (statusCode === 500) {
        clientMsg = "AI provider configuration error.";
      } else if (statusCode === 401 || statusCode === 403) {
        clientMsg = "AI provider authentication failed.";
      } else if (statusCode === 404) {
        clientMsg = "AI model configuration error.";
      } else if (statusCode === 429) {
        clientMsg = "AI provider rate limit reached. Please try again later.";
      } else if (statusCode === 504) {
        clientMsg = "AI provider took too long to respond. Please try again later.";
      } else if (statusCode === 502) {
        clientMsg = "Unable to connect to the AI provider. Please try again later.";
      } else if (statusCode >= 500 && statusCode < 600) {
        clientMsg = "AI provider is temporarily unavailable. Please try again later.";
      }

      return NextResponse.json({ 
        success: false, 
        error: clientMsg
      }, { status: statusCode });
    }

    // 6. JSON Parsing
    let parsedResponse;
    try {
      const cleanedString = aiResponseString.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsedResponse = JSON.parse(cleanedString);
    } catch (e) {
      console.error("AI produced invalid JSON - parsing failed.");
      return NextResponse.json({ success: false, error: "Bad Gateway" }, { status: 502 });
    }

    // 7. Schema Validation
    const schemaValidation = validateAiResponseSchema(parsedResponse);
    if (!schemaValidation.valid) {
      console.error("Schema Validation Failed:", schemaValidation.error);
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }

    // 8. Grounding Validation
    const combinedClaims = [
      ...(parsedResponse.evidence || []),
      ...(parsedResponse.recommendations || []).map(r => ({ ...r, claimType: "RECOMMENDATION" }))
    ];
    const groundingValidation = validateGrounding(combinedClaims, contextDict);
    if (!groundingValidation.valid) {
      console.error("Grounding Validation Failed:", groundingValidation.error);
      return NextResponse.json({ success: false, error: "AI_GROUNDING_VIOLATION" }, { status: 422 });
    }

    // 9. Safety Validation
    const safetyValidation = validateAiResponseSafety(parsedResponse);
    if (!safetyValidation.valid) {
      console.error("Safety Validation Failed:", safetyValidation.error);
      return NextResponse.json({ success: false, error: "AI_SAFETY_VIOLATION" }, { status: 422 });
    }

    // 10. Success Response
    return NextResponse.json({ success: true, data: parsedResponse });

  } catch (error) {
    console.error("AI Gateway Crash:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
