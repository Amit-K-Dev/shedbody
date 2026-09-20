import { rules } from "./rules.js";

export function generateStructuredInsights(unifiedTimeline, profile, activePlan, activeWeightGoal) {
  if (!unifiedTimeline || !Array.isArray(unifiedTimeline) || unifiedTimeline.length === 0) {
    return [];
  }

  const generatedInsights = [];
  const seenIds = new Set();

  for (const rule of rules) {
    if (seenIds.has(rule.id)) continue;

    try {
      if (rule.canEvaluate(unifiedTimeline, profile, activePlan, activeWeightGoal)) {
        const insight = rule.evaluate(unifiedTimeline, profile, activePlan, activeWeightGoal);
        if (insight && insight.id) {
          generatedInsights.push(insight);
          seenIds.add(insight.id);
        }
      }
    } catch (e) {
      console.error(`Error evaluating insight rule ${rule.id}:`, e);
    }
  }

  generatedInsights.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.id.localeCompare(b.id);
  });

  return generatedInsights;
}
