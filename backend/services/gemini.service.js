import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
console.log("Gemini Model Initialized: gemini-2.5-flash");

export const calculateNutritionTargets = async (profile, goal) => {
    try {
        const prompt = `
        As an expert nutritionist, calculate the daily nutrition targets for the following user:

        User Profile:
        - Age: ${profile.age}
        - Gender: ${profile.gender}
        - Height: ${profile.height_cm} cm
        - Weight: ${profile.current_weight_kg} kg
        - Fitness Level: ${profile.fitness_level}

        Fitness Goal:
        - Goal Type: ${goal.goal_type} (e.g., weight_loss, muscle_gain, maintenance)
        - Target Weight: ${goal.target_weight_kg} kg
        - Activity Level: ${goal.activity_level}
        - Target Physique: ${goal.target_physique}

        Please calculate the recommended:
        1. Daily Calories (kcal)
        2. Daily Protein (g)
        3. Daily Carbs (g)
        4. Daily Fats (g)
        5. Daily Fiber (g)
        6. Daily Water Intake (ml)

        Return ONLY valid JSON in the following format:
        {
            "daily_calories": number,
            "daily_protein_g": number,
            "daily_carbs_g": number,
            "daily_fats_g": number,
            "daily_fiber_g": number,
            "daily_water_ml": number,
            "notes": "string (brief explanation)"
        }
        `;

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        console.log("Gemini response received");
        const text = result.response.text();
        console.log("Gemini Raw Text:", text);
        
        // Clean markdown if present
        let jsonStr = text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }

        const targets = JSON.parse(jsonStr);
        return targets;

    } catch (error) {
        console.error("Gemini Nutrition Calculation Error:", error);
        console.log("Falling back to standard BMR calculation...");

        // --- Fallback Calculation (Mifflin-St Jeor Equation) ---
        let bmr;
        if (profile.gender === 'male') {
            bmr = (10 * profile.current_weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5;
        } else {
            bmr = (10 * profile.current_weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161;
        }

        // Activity Multipliers
        const activityMultipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extremely_active': 1.9
        };
        
        // Default to 'moderately_active' if valid activity level is missing or invalid
        const activityLevel = goal.activity_level && activityMultipliers[goal.activity_level] 
            ? goal.activity_level 
            : 'moderately_active';
            
        const tdee = bmr * activityMultipliers[activityLevel];

        // Goal Adjustment
        let dailyCalories = tdee;
        if (goal.goal_type === 'weight_loss') {
            dailyCalories -= 500;
        } else if (goal.goal_type === 'muscle_gain') {
            dailyCalories += 500;
        }

        dailyCalories = Math.round(dailyCalories);

        // Let's use a balanced split: Protein 30%, Fat 25%, Carbs 45%
        const proteinCals = dailyCalories * 0.30;
        const fatCals = dailyCalories * 0.25;
        const carbCals = dailyCalories * 0.45;

        return {
            daily_calories: dailyCalories,
            daily_protein_g: Math.round(proteinCals / 4),
            daily_carbs_g: Math.round(carbCals / 4),
            daily_fats_g: Math.round(fatCals / 9),
            daily_fiber_g: 30, // Standard recommendation
            daily_water_ml: 35 * profile.current_weight_kg, // ~35ml per kg
            notes: "Calculated using standard metabolic formulas (AI unavailable)."
        };
    }
};
