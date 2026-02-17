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
        throw new Error("Failed to calculate nutrition targets with AI");
    }
};
