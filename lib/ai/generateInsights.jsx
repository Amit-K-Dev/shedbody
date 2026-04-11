export function generateInsights({ weightData, goal, bmiLogs }) {
  if (!weightData || weightData.length < 2) {
    return ["Start tracking your weight to see insights."];
  }

  const insights = [];

  const latest = weightData[weightData.length - 1]?.weight;
  const prev = weightData[weightData.length - 2]?.weight;
  const start = weightData[0]?.weight;

  const diff = latest - prev;
  const totalChange = latest - start;

  // Weight trend
  if (diff < 0) {
    insights.push(
      `🔥 You lost ${Math.abs(diff).toFixed(1)} kg since last entry.`,
    );
  } else if (diff > 0) {
    insights.push(
      `⚠ Weight increased by ${diff.toFixed(1)} kg. Stay consistent.`,
    );
  }

  // Overall trend
  if (totalChange < 0) {
    insights.push(
      `📉 Total progress: ${Math.abs(totalChange).toFixed(1)} kg lost.`,
    );
  }

  // Goal prediction
  if (goal) {
    const remaining = latest - goal;

    if (remaining > 0 && diff < 0) {
      const weeks = Math.abs(remaining / diff);
      insights.push(
        `🎯 At pace, you can reach your goal in ~${Math.ceil(weeks)} weeks.`,
      );
    }
  }

  // BMI insight
  if (bmiLogs?.length) {
    const latestBMI = bmiLogs[0]?.bmi;

    if (latestBMI >= 30) {
      insights.push("⚠ BMI indicates obesity. Focus on consistent fat loss.");
    } else if (latestBMI >= 25) {
      insights.push("⚠ You are in overweight range. Keep pushing.");
    } else if (latestBMI >= 18.5) {
      insights.push("✅ You are in a healthy BMI range.");
    }
  }

  return insights;
}
