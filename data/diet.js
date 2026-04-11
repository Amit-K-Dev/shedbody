// Elite Diet Database - Pro Bodybuilding & Fitness Protocols (ShedBody)
// Calories are precisely matched with Macros

export const dietPlans = {
  fat_loss: {
    1500: {
      // Extreme Fat Loss Protocol
      veg: {
        breakfast:
          "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon",
        lunch:
          "100g Paneer Bhurji (or 7 Egg Whites), Half Plate Mixed Green Salad",
        dinner:
          "50g Soy Chunks (or 70g Paneer), 1 Roti or 100g Brown Rice, Salad",
        snacks:
          "1 Rice Cake, 1sp Peanut Butter, 240ml Low Fat Milk, 1 Fruit (Guava/Apple)",
      },
      nonVeg: {
        breakfast:
          "30g Oats, 1 scoop Whey Protein, 1/2 Apple, 7 Almonds, Cinnamon",
        lunch: "7 Egg Whites Omelette, Half Plate Mixed Green Salad",
        dinner: "120g Grilled Chicken Breast, 1 Roti or 100g Brown Rice, Salad",
        snacks: "1 Rice Cake, 1sp Peanut Butter, 240ml Low Fat Milk, 1 Fruit",
      },
    },
    1800: {
      // Standard Fat Loss Protocol
      veg: {
        breakfast: "30g Oats, 1 scoop Whey, 1/2 Apple, 1sp Flaxseed",
        lunch: "100g Paneer or Tofu, 28 Almonds, Full Plate Salad",
        dinner: "70g Soy Chunks, 1 Roti or 100g Brown Rice, Mixed Salad",
        snacks: "1.5 Rice Cake, 1.2sp Peanut Butter, 240ml Milk, 1 Orange",
      },
      nonVeg: {
        breakfast: "30g Oats, 1 scoop Whey, 1/2 Apple, 1sp Flaxseed",
        lunch: "10 Egg Whites Omelette, 28 Almonds, Full Plate Salad",
        dinner: "150g Chicken Breast, 1 Roti or 125g Brown Rice, Salad",
        snacks:
          "2 Whole Eggs (boiled), 7 Egg Whites, 1.5 Rice Cake, 1.2sp Peanut Butter",
      },
    },
    2000: {
      // Fat Loss / Maintenance
      veg: {
        breakfast: "40g Oats, 1 scoop Whey, 1/2 Apple, 1sp Flaxseed",
        lunch: "120g Paneer/Tofu, 100g Brown Rice, Full Plate Salad",
        dinner: "70g Soy Chunks, 1 Roti or 100g Brown Rice, Salad",
        snacks: "1.5 Rice Cake, 1sp Peanut Butter, 240ml Milk, 1 Fruit",
      },
      nonVeg: {
        breakfast: "40g Oats, 1 scoop Whey, 1/2 Apple, 1sp Flaxseed",
        lunch: "10 Egg Whites, 100g Brown Rice, Full Plate Salad",
        dinner: "150g Chicken Breast, 1 Roti or 125g Brown Rice, Salad",
        snacks: "2 Whole Eggs, 7 Egg Whites, 1sp Peanut Butter, 240ml Milk",
      },
    },
  },

  muscle_gain: {
    2400: {
      // Lean Muscle Gain Protocol
      veg: {
        breakfast: "75g Oats, 1 scoop Whey, 1/2 Apple, 7 Almonds, Cinnamon",
        lunch: "220g Rice, 110g Kidney Beans (Rajma), Veggies, 1/2 sp Ghee",
        dinner: "200g Black Lentil (Dal), 100g Brown Rice, Mixed Salad",
        snacks:
          "3 Multigrain Bread, 1sp Jam, 1/2 Banana, 240ml Milk, 1sp Peanut Butter",
      },
      nonVeg: {
        breakfast: "75g Oats, 1 scoop Whey, 1/2 Apple, 7 Almonds, Cinnamon",
        lunch:
          "220g Rice, 110g Kidney Beans, 6 Egg Whites, Veggies, 1/2 sp Ghee",
        dinner:
          "120g Grilled Chicken, 200g Black Lentil, 100g Brown Rice, Salad",
        snacks: "2 Whole Eggs, 4 Egg Whites, 3 Rice Cake, 1sp Peanut Butter",
      },
    },
    2800: {
      // Clean Bulk Protocol
      veg: {
        breakfast: "90g Oats, 1.2 scoop Whey, 1/2 Apple, 14 Almonds",
        lunch: "220g Rice, 110g Kidney Beans, Mixed Veggies, 1/2 sp Ghee",
        dinner: "200g Black Lentil, 140g Brown Rice, Half Plate Salad",
        snacks:
          "3 Multigrain Bread, 1sp Jam, 1 Banana, 240ml Milk, 1.8sp Peanut Butter",
      },
      nonVeg: {
        breakfast: "90g Oats, 1.2 scoop Whey, 1/2 Apple, 14 Almonds",
        lunch: "220g Rice, 110g Kidney Beans, 7 Egg Whites, Veggies",
        dinner:
          "150g Chicken Breast, 200g Black Lentil, 140g Brown Rice, Salad",
        snacks:
          "2 Whole Eggs, 8 Egg Whites, 3 Rice Cake, 1.8sp Peanut Butter, Milk",
      },
    },
    3200: {
      // Extreme Bulk Protocol
      veg: {
        breakfast: "90g Oats, 1.2 scoop Whey, 1/2 Apple, 14 Almonds",
        lunch: "240g Rice, 110g Kidney Beans, High Protein Soy Chunks, Veggies",
        dinner: "200g Black Lentil, 140g Brown Rice, Mixed Salad",
        snacks:
          "4 Rice Cake, 2sp Peanut Butter, 200ml Milk, 3 Slices Multigrain Bread",
      },
      nonVeg: {
        breakfast: "90g Oats, 1.2 scoop Whey, 1/2 Apple, 14 Almonds",
        lunch: "240g Rice, 110g Kidney Beans, 9 Egg Whites, Veggies",
        dinner: "250g Chicken/Fish, 140g Brown Rice, Salad",
        snacks:
          "4 Rice Cake, 2sp Peanut Butter, 200ml Milk, 3 Boiled Egg Whites",
      },
    },
  },

  maintenance: {
    // We can use 2000-2400 calorie blocks from above to balance out maintenance.
    // Maintenance will automatically pull the closest calorie match from the logic we built in StartPlan!
  },
};
