export const rules = [
  {
    id: "WEIGHT_TREND_CHANGE",
    category: "body",
    priority: 10,
    canEvaluate: (timeline) => {
      if (!timeline || timeline.length === 0) return false;
      
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      const previousStart = _addDays(latestDate, -13);
      const previousEnd = _addDays(latestDate, -7);

      let currentValid = 0;
      let previousValid = 0;

      for (const entry of timeline) {
        if (entry.body && entry.body.weight !== null && entry.body.weight !== undefined) {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            currentValid++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousValid++;
          }
        }
      }

      return currentValid >= 2 && previousValid >= 1;
    },
    evaluate: (timeline) => {
      const latestDate = timeline[timeline.length - 1].date;
      const currentStart = _addDays(latestDate, -6);
      const previousStart = _addDays(latestDate, -13);
      const previousEnd = _addDays(latestDate, -7);

      let currentSum = 0;
      let currentCount = 0;
      let previousSum = 0;
      let previousCount = 0;

      for (const entry of timeline) {
        if (entry.body && entry.body.weight !== null && entry.body.weight !== undefined) {
          if (entry.date >= currentStart && entry.date <= latestDate) {
            currentSum += entry.body.weight;
            currentCount++;
          } else if (entry.date >= previousStart && entry.date <= previousEnd) {
            previousSum += entry.body.weight;
            previousCount++;
          }
        }
      }

      const currentAvg = currentSum / currentCount;
      const previousAvg = previousSum / previousCount;
      const diff = currentAvg - previousAvg;
      
      if (Math.abs(diff) < 0.5) {
        return null;
      }

      const direction = diff > 0 ? "higher" : "lower";
      const confidence = currentCount >= 4 && previousCount >= 3 ? "high" : "medium";

      return {
        id: "WEIGHT_TREND_CHANGE",
        category: "body",
        priority: 10,
        observation: "Your average weight changed over the comparison period.",
        evidence: `Previous 7-day average: ${previousAvg.toFixed(1)} kg; current 7-day average: ${currentAvg.toFixed(1)} kg; change: ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg.`,
        interpretation: `Your recent average weight is ${direction} than the previous comparison period.`,
        recommendation: "Continue logging weight consistently so the trend can be monitored over time.",
        confidence: confidence,
        timestamp: latestDate,
        type: "info"
      };
    }
  }
];

function _addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
