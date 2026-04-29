const activityMap = {
  walking: { label: "Walking", met: 3.5 },
  running: { label: "Running", met: 9.8 },
  cycling: { label: "Cycling", met: 7.5 },
  strength: { label: "Strength training", met: 5 },
  yoga: { label: "Yoga", met: 2.8 },
  swimming: { label: "Swimming", met: 7 },
  hiit: { label: "HIIT", met: 8.5 },
};

export function calculateCaloriesBurnedByActivity(inputs) {
  const unit = inputs.unit || "metric";
  const weight = Number(inputs.weight);
  const duration = Number(inputs.duration);
  const activity = activityMap[inputs.activityType] || activityMap.walking;

  if (!weight || !duration) {
    throw new Error("Please enter weight and duration");
  }

  const weightKg = unit === "imperial" ? weight * 0.453592 : weight;
  const caloriesBurned = Math.round(activity.met * 3.5 * weightKg * (duration / 200));

  return {
    caloriesBurned,
    activityLabel: activity.label,
    duration,
    met: activity.met,
    perMinute: Number((caloriesBurned / duration).toFixed(1)),
    note: "MET estimates are useful for planning, but wearable data and pace-specific formulas can vary.",
  };
}
