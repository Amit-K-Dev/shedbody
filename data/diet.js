// ShedBody V 2.0: Diet Database - Bodybuilding & Fitness Protocols

export const dietPlans = {
  fat_loss: {
    1500: {
      // Extreme Fat Loss Protocol
      veg: {
        macros: {
          protein: 187,
          carbs: 113,
          fats: 34,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 5 Egg Whites, 1 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "100g Paneer Bhurji (or 7 Egg Whites Omelette), Add any veggies, Half Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1 Rice Cake, 1 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "50g Soy Chunks (or 70g Paneer Bhurji), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 187,
          carbs: 113,
          fats: 34,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 5 Egg Whites, 1 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "7 Egg Whites Omelette or Bhurji, Add any veggies, Half Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1 Rice Cake, 1 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "120-140g Grilled Chicken Breast (or 100g soya paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional) Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    1600: {
      // Extreme Fat Loss Protocol
      veg: {
        macros: {
          protein: 200,
          carbs: 120,
          fats: 35.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 9 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 5 Egg Whites, 1 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 9 Egg Whites Omelette), Add any veggies, Half Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1 Rice Cake, 1 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml Water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 200,
          carbs: 120,
          fats: 35.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 9 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 5 Egg Whites, 1 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "9 Egg Whites Omelette or Bhurji, Add any veggies, Half Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1 Rice Cake, 1 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml Water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2sp coconut oil for cooking (optional), Half Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein Isolate in 300ml Water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    1700: {
      // Extreme Fat Loss Protocol
      veg: {
        macros: {
          protein: 213,
          carbs: 127,
          fats: 37.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 9 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 5 Egg Whites, 1 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 9 Egg Whites), Add any veggies, 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1.2 tsp Peanut Butter (18g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 213,
          carbs: 127,
          fats: 37.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 9 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 5 Egg Whites, 1 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "9 Egg Whites Omelette or Bhurji, Add any veggies, 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1.2 tsp Peanut Butter (18g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g soya paneer), 1 Roti or 125g Brown Rice, 1/2 sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    1800: {
      // Extreme Fat Loss Protocol
      veg: {
        macros: {
          protein: 225,
          carbs: 135,
          fats: 40,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxeed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites Omelette or Bhurji), 5 Almonds, 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1.2 tsp Peanut Butter, 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 225,
          carbs: 135,
          fats: 40,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, Add any veggies, 5 Almonds, 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1.2 tsp Peanut Butter (18g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein in 300ml water (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    1900: {
      // Extreme Fat Loss Protocol
      veg: {
        macros: {
          protein: 237,
          carbs: 143,
          fats: 42,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites), 5 Almonds, 2/3 Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1/2 scoop Casein Protein (1/2 scoop Whey Protein if no Casein Protein) in 300ml water, 4 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 237,
          carbs: 143,
          fats: 42,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, Add any Veggies, 5 Almonds, 2/3 Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1/2 scoop Casein Protein (or 1/2 scoop Whey Protein if no Casein Protein) in 300ml, 4 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2000: {
      // Fat Loss Protocol
      veg: {
        macros: {
          protein: 250,
          carbs: 150,
          fats: 44.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites), 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 8 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 250,
          carbs: 150,
          fats: 44.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, Add any Veggies, 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 sccop Casein Protein (or Whey Protein if no Casein Protein) in 300ml water, 8 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2100: {
      // Fat Loss Protocol
      veg: {
        macros: {
          protein: 262,
          carbs: 158,
          fats: 46.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites), 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or Whey Protein if no Casein Protein), 10 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 262,
          carbs: 158,
          fats: 46.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 10 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2200: {
      // Fat Loss Protocol
      veg: {
        macros: {
          protein: 275,
          carbs: 165,
          fats: 49,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein (40g), 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 15-20g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites Omelette or Bhurji), Add any veggies, 8 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 70g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or 1 sccop Whey Protein if no Casein Protein), 11 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 275,
          carbs: 165,
          fats: 49,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 15-20g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, 8 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1-2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scooop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 11 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2300: {
      // Fat Loss Protocol
      veg: {
        macros: {
          protein: 259,
          carbs: 172,
          fats: 64,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 4 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "100g Paneer Bhurji (or 8 Egg Whites Omelette or Bhurji), 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water(or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "570g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 scoop Whey Protein if no Casein Protein), 1.5 tsp Peanut BUtter or 22g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 259,
          carbs: 172,
          fats: 64,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein (40g), 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 4 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "8 Egg Whites Omelette or Bhurji, 28g Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 sccop Whey Protein if no Casein Protein), 1.5 tsp Peanut Butter or 22g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2400: {
      // Fat Loss Protocol
      veg: {
        macros: {
          protein: 270,
          carbs: 180,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "100g Paneer Bhurji (or 8 Egg Whites), Add any veggies, 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1.3 tsp Peanut Butter (20g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 150g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 scoop Whey Protein if no Casein Protein), 1.5 tsp Peanut Butter or 22g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 270,
          carbs: 180,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "8 Egg Whites Omelette or Bhurji, Add any veggies, 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1.3 tsp Peanut Butter (20g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 150g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or Whey Protein if no Casein Protein), 1.5 tsp Peanut Butter or 22g Waluts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2500: {
      // Fat Loss Protocol
      veg: {
        macros: {
          protein: 281,
          carbs: 188,
          fats: 69.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "40g Oats, 1.5 scoop Whey Protein (50g), 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "100g Paneer Bhurji (or 8 Egg Whites Omelette or Bhurji), Add any veggies, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1.3 tsp Peanut Butter (20g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 150g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 scoop Whey Protein if no Casein Protein), 2 tsp Peanut Butter or 28g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 281,
          carbs: 188,
          fats: 69.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "40g Oats, 1.5 scoop Whey Protein (50g), 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "8 Egg Whites Omelette or Bhurji, 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1.3 tsp Peanut Butter (20g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 150g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 scoop Whey Protein if no Casein Protein), 2 tsp Peanut Butter or 28g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },
  },

  muscle_gain: {
    2400: {
      // Lean Gain Protocol
      veg: {
        macros: {
          protein: 180,
          carbs: 300,
          fats: 53,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "75g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 4 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 6 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 100g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 180,
          carbs: 300,
          fats: 53,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "75g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 4 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 6 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 100g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2500: {
      // Lean Gain Protocol
      veg: {
        macros: {
          protein: 188,
          carbs: 313,
          fats: 55,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "80g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 6 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.5 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 188,
          carbs: 313,
          fats: 55,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "80g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 6 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.5 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2600: {
      // Lean Gain Protocol
      veg: {
        macros: {
          protein: 195,
          carbs: 325,
          fats: 57.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "80g Oats, 1 scoop Whey Protein, 1/2 Apple, 10 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 6 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.5 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 195,
          carbs: 325,
          fats: 57.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "80g Oats, 1 scoop Whey Protein, 1/2 Apple, 10 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 6 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.5 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2700: {
      // Lean Gain Protocol
      veg: {
        macros: {
          protein: 202,
          carbs: 338,
          fats: 60,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 6 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.5 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 202,
          carbs: 338,
          fats: 60,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 6 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1/2 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.5 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2800: {
      // Lean Gain Protocol
      veg: {
        macros: {
          protein: 210,
          carbs: 350,
          fats: 62,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 210,
          carbs: 350,
          fats: 62,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2900: {
      // Clean Gain Protocol
      veg: {
        macros: {
          protein: 217,
          carbs: 363,
          fats: 64.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 217,
          carbs: 363,
          fats: 64.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "220g Rice, 110g Kidney Beans, 7 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3000: {
      // Clean Gain Protocol
      veg: {
        macros: {
          protein: 225,
          carbs: 375,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 225,
          carbs: 375,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items: "240ml Low Fat Milk or 0.8 scoop Casein Protein (optional)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3100: {
      // Clean Gain Protocol
      veg: {
        macros: {
          protein: 232,
          carbs: 388,
          fats: 68.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 225,
          carbs: 375,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "3 Rice Cake, 1.8 tsp Peanut Butter, 240ml Low Fat Milk, Boiled Egg Whites (OPTIONAL to increase protein)",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 3 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3200: {
      // Clean Gain Protocol
      veg: {
        macros: {
          protein: 240,
          carbs: 400,
          fats: 71,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "4 Rice Cake, 2 tsp Peanut Butter, 200ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "200g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 240,
          carbs: 400,
          fats: 71,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "4 Rice Cake, 2 tsp Peanut Butter, 200ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3300: {
      // Clean Gain Protocol
      veg: {
        macros: {
          protein: 247,
          carbs: 413,
          fats: 73,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "4 Rice Cake, 2 tsp Peanut Butter, 200ml Low Fat Milk, 5 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 50g Red Grapes",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 247,
          carbs: 413,
          fats: 73,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 14 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "4 Rice Cake, 2 tsp Peanut Butter, 200ml Low Fat Milk, 5 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 50g Red Grapes",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3400: {
      // Clean Gain Protocol
      veg: {
        macros: {
          protein: 255,
          carbs: 425,
          fats: 75.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 18 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "4 Rice Cake, 2 tsp Peanut Butter, 200ml Low Fat Milk, 7 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 256,
          carbs: 425,
          fats: 75,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 18 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 8 Egg Whites, 3 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 9 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "4 Rice Cake, 2 tsp Peanut Butter, 200ml Low Fat Milk, 7 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3500: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 218,
          carbs: 481,
          fats: 77.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 18 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 6 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 4 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 218,
          carbs: 481,
          fats: 77.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 18 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "240g Rice, 110g Kidney Beans, 6 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 4 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3600: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 225,
          carbs: 495,
          fats: 80,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 18 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 4 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 225,
          carbs: 495,
          fats: 80,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 18 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 4 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 140g Brown Rice, 1/2 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3700: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 232,
          carbs: 509,
          fats: 82,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 22 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 232,
          carbs: 509,
          fats: 82,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "90g Oats, 1.2 scoop Whey Protein (35g), 1/2 Apple, 22 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3800: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 237,
          carbs: 523,
          fats: 84,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1/2 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 237,
          carbs: 523,
          fats: 84,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "5 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    3900: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 244,
          carbs: 536,
          fats: 86.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 8 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 244,
          carbs: 536,
          fats: 86.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 5 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 8 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4000: {
      // Bulk Gain Protocol
      veg: {
        macros: {
          protein: 250,
          carbs: 550,
          fats: 89,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 7 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 8 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 250,
          carbs: 550,
          fats: 89,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "2 Whole Eggs, 7 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 8 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 300ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4100: {
      // Bulk Gain Protocol
      veg: {
        macros: {
          protein: 256,
          carbs: 564,
          fats: 91,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 7 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 400ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 256,
          carbs: 564,
          fats: 91,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 7 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1/2 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 400ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 4 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4200: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 263,
          carbs: 578,
          fats: 93,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 7 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 263,
          carbs: 578,
          fats: 93,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 7 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "290g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4300: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 269,
          carbs: 591,
          fats: 95.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 269,
          carbs: 591,
          fats: 95,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4400: {
      // Extreme Gain Protocol
      veg: {
        macros: {
          protein: 275,
          carbs: 605,
          fats: 98,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 275,
          carbs: 605,
          fats: 98,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1/2 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd) 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "150ml Low Fat Milk or 0.6 scoop Casein Protein (or 0.6 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4500: {
      // Extreme Bulk Gain Protocol
      veg: {
        macros: {
          protein: 281,
          carbs: 619,
          fats: 100,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 281,
          carbs: 619,
          fats: 100,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 9 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd) 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein)",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4600: {
      // Extreme Bulk Gain Protocol
      veg: {
        macros: {
          protein: 287,
          carbs: 633,
          fats: 102,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 10 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 1 Rice Cake",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 287,
          carbs: 633,
          fats: 102,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 23 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 10 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 1 Rice Cake",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4700: {
      // Extreme Bulk Gain Protocol
      veg: {
        macros: {
          protein: 294,
          carbs: 646,
          fats: 104,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 24 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 10 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1.5 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 1 Rice Cake",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 294,
          carbs: 646,
          fats: 104,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 24 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "6 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 10 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Protein in 420ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1.5 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 1 Rice Cake",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    4800: {
      // Extreme Bulk Gain Protocol
      veg: {
        macros: {
          protein: 300,
          carbs: 660,
          fats: 106.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 24 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "7 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 10 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "2.2 scoops Whey Protein in 500ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1.5 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for cooking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk mix 10g Whey protein or 1.2 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 1 Rice Cake",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 300,
          carbs: 660,
          fats: 106,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "high-carb",
            items:
              "110g Oats, 1.5 scoop Whey Protein (40g), 1 Apple, 24 Almonds, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "carb-protein",
            items:
              "3 Whole Eggs, 8 Egg Whites, 4 Multigrain Bread, 1.2 tsp Jam, 1.5 Banana",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-carb",
            items:
              "310g Rice, 110g Kidney Beans, 8 Egg Whites, Any Vegetables (Peas, Carrots, Bell Pepper, etc), 1 tsp Ghee or Coconut",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy-dense",
            items:
              "7 Rice Cake, 2 tsp Peanut Butter, 180ml Low Fat Milk, 10 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "2.2 scoops Whey Protein in 500ml Gatorade or Coconut Water (or 6–10 Egg Whites if no Whey Protein), 3g Creatine Monohydrate, 6 Khajoor (Dates), 1.5 Banana (or 80g Grapes)",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "balanced",
            items:
              "250g Black Lentil, 180g Brown Rice, 110g Low Fat Yogurt (Curd), 1 tsp coconut oil for coocking, 1/2 Plate Mixed Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "260ml Low Fat Milk mix 10g Whey Protein or 1.2 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 1 Rice Cake",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },
  },

  maintenance: {
    // 2000-2400 calorie protocol balance out maintenance
    2000: {
      veg: {
        macros: {
          protein: 250,
          carbs: 150,
          fats: 44.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites), 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 8 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 250,
          carbs: 150,
          fats: 44.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, Add any Veggies, 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "1.5 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 3 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 sccop Casein Protein (or Whey Protein if no Casein Protein) in 300ml water, 8 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2100: {
      veg: {
        macros: {
          protein: 262,
          carbs: 158,
          fats: 46.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites), 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or Whey Protein if no Casein Protein), 10 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 262,
          carbs: 158,
          fats: 46.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items: "2 Whole Eggs, 7 Egg Whites, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, 5 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 10 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2200: {
      veg: {
        macros: {
          protein: 275,
          carbs: 165,
          fats: 49,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein (40g), 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 15-20g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "150g Paneer Bhurji (or 10 Egg Whites Omelette or Bhurji), Add any veggies, 8 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 70g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scoop Casein Protein (or 1 sccop Whey Protein if no Casein Protein), 11 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soy Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 275,
          carbs: 165,
          fats: 49,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 15-20g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "10 Egg Whites Omelette or Bhurji, 8 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1-2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 1 scooop Casein Protein (or 1 scoop Whey Protein if no Casein Protein), 11 Almonds",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2300: {
      veg: {
        macros: {
          protein: 259,
          carbs: 172,
          fats: 64,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 4 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "100g Paneer Bhurji (or 8 Egg Whites Omelette or Bhurji), 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water(or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "570g Soy Chunks (or 100g Soya Paneer), 1 Roti or 100g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 scoop Whey Protein if no Casein Protein), 1.5 tsp Peanut BUtter or 22g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 259,
          carbs: 172,
          fats: 64,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein (40g), 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 4 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "8 Egg Whites Omelette or Bhurji, 28g Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1 tsp Peanut Butter (16g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 125g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 sccop Whey Protein if no Casein Protein), 1.5 tsp Peanut Butter or 22g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },

    2400: {
      veg: {
        macros: {
          protein: 270,
          carbs: 180,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "100g Paneer Bhurji (or 8 Egg Whites), Add any veggies, 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1.3 tsp Peanut Butter (20g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate in 300ml water (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "70g Soy Chunks (or 100g Soya Paneer), 1 Roti or 150g Brown Rice, 1/2sp coconut oil for cooking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or 0.8 scoop Whey Protein if no Casein Protein), 1.5 tsp Peanut Butter or 22g Walnuts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "Rotate Lentils, Beans, Channa, etc on daily basis. 100g Dairy Paneer or Soy Paneer can be added in Dinner few times a week. Add 40g Soya Chunk 4-5 times a week.",
          },
        ],
      },

      nonVeg: {
        macros: {
          protein: 270,
          carbs: 180,
          fats: 66.5,
        },
        meals: [
          {
            id: "meal1",
            name: "Breakfast",
            time: "8–9 AM",
            icon: "sun",
            color: "yellow",
            type: "balanced",
            items:
              "30g Oats, 1.3 scoop Whey Protein, 1/2 Apple, 1-2 tsp Flaxseed or Pumpkin seed, Cinnamon, 1 Multivitamin",
          },
          {
            id: "meal2",
            name: "Mid-Morning Snack",
            time: "10–11 AM",
            icon: "apple",
            color: "green",
            type: "light",
            items:
              "2 Whole Eggs, 7 Egg Whites, 30g Dry Roasted Channa, 1.5 Fruit (Guava/Apple/Orange)",
          },
          {
            id: "meal3",
            name: "Lunch",
            time: "1–2 PM",
            icon: "utensils",
            color: "orange",
            type: "high-protein",
            items:
              "8 Egg Whites Omelette or Bhurji, Add any veggies, 28 Almonds, Full Plate Salad (Lettuce, Cucumber, Carrots, etc)",
          },
          {
            id: "meal4",
            name: "Evening Snack",
            time: "4–5 PM",
            icon: "coffee",
            color: "purple",
            type: "energy",
            items:
              "2 Rice Cake, 1.3 tsp Peanut Butter (20g), 240ml Low Fat Milk, 6 Boiled Egg Whites",
          },
          {
            id: "postWorkout",
            name: "Post-Workout",
            icon: "dumbbell",
            color: "red",
            type: "recovery",
            note: "Adjust based on workout timing (morning/evening)",
            items:
              "1–2 scoop Whey Isolate (or 6–10 Egg Whites if no Whey Protein or Isolate), 5g Glutamine",
          },
          {
            id: "meal5",
            name: "Dinner",
            time: "8–9 PM",
            icon: "moon",
            color: "blue",
            type: "lean",
            items:
              "130-150g Grilled Chicken Breast (or 100g Soya Paneer), 1 Roti or 150g Brown Rice, 1/2 tsp coconut oil for coocking (optional), 1/2 Plate Salad (Lettuce, Cucumber, Carrots, etc), 1g Fish Oil or Omega 3",
          },
          {
            id: "meal6",
            name: "Pre-Bed Snack",
            time: "1 hour before sleep",
            icon: "bed",
            color: "indigo",
            type: "slow-protein",
            items:
              "240ml Low Fat Milk or 0.8 scoop Casein Protein (or Whey Protein if no Casein Protein), 1.5 tsp Peanut Butter or 22g Waluts",
          },
          {
            id: "tips",
            name: "Tips",
            icon: "info",
            color: "gray",
            type: "info",
            items:
              "120g Grilled Chicken Can be added in Dinner everyday or 3 times a week. 120g Grilled Fish can be added in Dinner once a week.",
          },
        ],
      },
    },
  },
};
