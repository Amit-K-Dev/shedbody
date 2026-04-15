// ShedBody V 2.0: Workout Database - Bodybuilding Protocols
// Incorporates Tempo, Advanced Techniques (Drop Sets, Supersets), and Rest Timers.

export const workoutPlans = {
  fat_loss: {
    beginner: {
      protocol_name: "Fat Loss Foundation",
      days_per_week: 4,
      goal_focus: "Basic Conditioning & Caloric Burn",
      schedule: [
        // Beginner days map for future...
        {
          day: 1,
          title: "Full Body Circuit",
          target_muscles: ["Full Body"],
          estimated_time: "45 mins",
          warmup: "5 mins Brisk Walk + Dynamic Stretching",
          exercises: [
            {
              id: "fl_b_1",
              name: "Bodyweight Squats",
              sets: 3,
              reps: "15",
              rest: "60s",
              tempo: "Standard",
              technique: "Steady",
              note: "Keep back straight.",
              icon: "dumbbell",
            },
            {
              id: "fl_b_2",
              name: "Push-ups (or Knee Push-ups)",
              sets: 3,
              reps: "To Failure",
              rest: "60s",
              tempo: "Standard",
              technique: "Steady",
              note: "Core tight.",
              icon: "activity",
            },
          ],
          finisher_cardio: {
            type: "LISS",
            duration: "15 mins",
            details: "Moderate cycling or walking.",
          },
          cooldown: "5 mins Full Body Stretch",
        },
      ],
    },
    intermediate: {
      protocol_name: "Shredded 2.0",
      days_per_week: 5,
      goal_focus: "Hypertrophy & Fat Oxidation",
      schedule: [
        {
          day: 1,
          title: "Push Day (Heavy + Volume)",
          target_muscles: ["Chest", "Shoulders", "Triceps"],
          estimated_time: "65-75 mins",
          warmup:
            "5 mins Incline Walk + Dynamic Arm Circles & Rotator Cuff warmups",
          exercises: [
            {
              id: "fl_i_1",
              name: "Incline Dumbbell Press",
              sets: 4,
              reps: "8-10",
              rest: "90s",
              tempo: "3-1-X-1",
              technique: "Heavy Compound",
              note: "Arch lower back slightly, squeeze chest at the top.",
              icon: "dumbbell",
            },
            {
              id: "fl_i_2",
              name: "Pec Deck Flyes (Machine)",
              sets: 3,
              reps: "12-15",
              rest: "60s",
              tempo: "2-1-2-1",
              technique: "Drop Set on Last Set",
              note: "Focus on the deep stretch. Do not bend elbows too much.",
              icon: "target",
            },
            {
              id: "fl_i_3",
              name: "Overhead Dumbbell Press",
              sets: 4,
              reps: "10-12",
              rest: "90s",
              tempo: "Standard",
              technique: "Hypertrophy",
              note: "Keep core tight, do not use momentum from legs.",
              icon: "dumbbell",
            },
            {
              id: "fl_i_4",
              name: "Tricep Rope Pushdowns",
              sets: 3,
              reps: "15",
              rest: "60s",
              tempo: "Standard",
              technique: "Constant Tension",
              note: "Lock elbows to your sides. Squeeze at the bottom.",
              icon: "zap",
            },
          ],
          finisher_cardio: {
            type: "HIIT",
            duration: "15 mins",
            details: "Sprint for 30 seconds, Walk for 30 seconds (15 Rounds).",
          },
          cooldown: "5 mins Static Stretching (Chest & Shoulders).",
        },
        // Day 2, Day 3 will be here...
      ],
    },
    advanced: {
      protocol_name: "Shredded Pro (Double Split)",
      days_per_week: 6,
      goal_focus: "Extreme Fat Loss & Muscle Preservation",
      schedule: [
        // Advanced fat loss data
      ],
    },
  },

  muscle_gain: {
    beginner: {
      protocol_name: "Mass Foundation",
      days_per_week: 4,
      goal_focus: "Strength & Form Mastery",
      schedule: [],
    },
    intermediate: {
      protocol_name: "Double XL Protocol",
      days_per_week: 5,
      goal_focus: "Pure Hypertrophy (Size)",
      schedule: [],
    },
    advanced: {
      protocol_name: "Monster Mass 5x5",
      days_per_week: 5,
      goal_focus: "Dense Muscle Tissue & Power",
      schedule: [
        {
          day: 1,
          title: "Heavy Push (Chest Dominant)",
          target_muscles: ["Chest", "Front Delts", "Triceps"],
          estimated_time: "80 mins",
          warmup: "10 mins light cardio + Empty Barbell complexes",
          exercises: [
            {
              id: "mg_a_1",
              name: "Barbell Bench Press",
              sets: 5,
              reps: "5",
              rest: "120-180s", // Heavy lifting needs longer rest
              tempo: "2-0-X-0",
              technique: "Max Power 5x5",
              note: "Plant feet firmly. Control the negative, explode up.",
              icon: "dumbbell",
            },
            {
              id: "mg_a_2",
              name: "Incline Dumbbell Press",
              sets: 4,
              reps: "8",
              rest: "90s",
              tempo: "Standard",
              technique: "Hypertrophy",
              note: "Keep the bench at a 30-degree angle to target upper chest.",
              icon: "target",
            },
            {
              id: "mg_a_3",
              name: "Weighted Dips",
              sets: 3,
              reps: "8-10",
              rest: "90s",
              tempo: "3-1-1-1",
              technique: "Lean Forward",
              note: "Lean forward to target chest, stay upright for triceps.",
              icon: "activity",
            },
            {
              id: "mg_a_4",
              name: "Cable Crossovers (Low to High)",
              sets: 3,
              reps: "12-15",
              rest: "60s",
              tempo: "Standard",
              technique: "Burnout Finisher",
              note: "Target the upper-inner chest. Hold the squeeze for 1 second.",
              icon: "flame",
            },
          ],
          finisher_cardio: {
            type: "None",
            duration: "0 mins",
            details: "No cardio. Preserve calories for muscle growth.",
          },
          cooldown: "5 mins deep chest stretching.",
        },
      ],
    },
  },

  maintenance: {
    // Fit Life Protocols will go here...
    beginner: {
      protocol_name: "Fit Life Basic",
      days_per_week: 3,
      schedule: [],
    },
    intermediate: {
      protocol_name: "Fit Life Plus",
      days_per_week: 4,
      schedule: [],
    },
    advanced: { protocol_name: "Fit Life Pro", days_per_week: 5, schedule: [] },
  },
};
