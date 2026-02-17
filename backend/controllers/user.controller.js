import db from '../db/index.js';
import { calculateNutritionTargets } from '../services/gemini.service.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const profile = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
    const goals = await db.query('SELECT * FROM fitness_goals WHERE user_id = $1 AND is_active = true', [req.user.id]);
    const nutrition = await db.query('SELECT * FROM nutrition_targets WHERE user_id = $1 AND is_active = true', [req.user.id]);

    res.json({
      profile: profile.rows[0] || null,
      goals: goals.rows[0] || null,
      nutrition: nutrition.rows[0] || null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create or Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { full_name, age, gender, height_cm, current_weight_kg, fitness_level } = req.body;

    // Sanitize numeric inputs (handle empty strings 'null' or undefined)
    const height = (height_cm && !isNaN(height_cm)) ? height_cm : null;
    const weight = (current_weight_kg && !isNaN(current_weight_kg)) ? current_weight_kg : null;

    // Check if profile exists
    const check = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);

    let profile;
    if (check.rows.length > 0) {
      // Update
      profile = await db.query(
        'UPDATE user_profiles SET full_name = $1, age = $2, gender = $3, height_cm = $4, current_weight_kg = $5, fitness_level = $6, updated_at = CURRENT_TIMESTAMP WHERE user_id = $7 RETURNING *',
        [full_name, age, gender, height, weight, fitness_level, req.user.id]
      );
    } else {
      // Create
      profile = await db.query(
        'INSERT INTO user_profiles (user_id, full_name, age, gender, height_cm, current_weight_kg, fitness_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [req.user.id, full_name, age, gender, height, weight, fitness_level]
      );
    }

    // --- AI Nutrition Recalculation (if profile changed) ---
    // 1. Get Active Goal
    const goalsResult = await db.query('SELECT * FROM fitness_goals WHERE user_id = $1 AND is_active = true', [req.user.id]);
    const activeGoal = goalsResult.rows[0];

    if (activeGoal && profile.rows[0]) {
        try {
            console.log("Recalculating nutrition targets due to profile update...");
            // 2. Calculate Targets via Gemini
            const targets = await calculateNutritionTargets(profile.rows[0], activeGoal);

            // 3. Deactivate old targets
            await db.query('UPDATE nutrition_targets SET is_active = false WHERE user_id = $1', [req.user.id]);

            // 4. Save new targets
            await db.query(
                `INSERT INTO nutrition_targets 
                (user_id, goal_id, daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g, daily_fiber_g, daily_water_ml, notes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    req.user.id, 
                    activeGoal.id, 
                    targets.daily_calories, 
                    targets.daily_protein_g, 
                    targets.daily_carbs_g, 
                    targets.daily_fats_g, 
                    targets.daily_fiber_g || 30, 
                    targets.daily_water_ml || 2500, 
                    targets.notes
                ]
            );
            console.log("AI Nutrition Targets Updated for User:", req.user.id);
        } catch (aiError) {
             console.error("Failed to update AI nutrition targets:", aiError);
        }
    }

    res.json(profile.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Set Fitness Goals
export const setGoals = async (req, res) => {
  try {
    const { goal_type, target_physique, target_weight_kg, activity_level } = req.body;

    // Deactivate old goals
    await db.query('UPDATE fitness_goals SET is_active = false WHERE user_id = $1', [req.user.id]);

    // Create new goal
    const newGoalResult = await db.query(
      'INSERT INTO fitness_goals (user_id, goal_type, target_physique, target_weight_kg, activity_level, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
      [req.user.id, goal_type, target_physique, target_weight_kg, activity_level]
    );
    const newGoal = newGoalResult.rows[0];

    // --- AI Nutrition Calculation ---
    // 1. Get User Profile
    const profileResult = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
    const profile = profileResult.rows[0];

    if (profile) {
        try {
            // 2. Calculate Targets via Gemini
            const targets = await calculateNutritionTargets(profile, newGoal);

            // 3. Deactivate old targets
            await db.query('UPDATE nutrition_targets SET is_active = false WHERE user_id = $1', [req.user.id]);

            // 4. Save new targets
            await db.query(
                `INSERT INTO nutrition_targets 
                (user_id, goal_id, daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g, daily_fiber_g, daily_water_ml, notes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    req.user.id, 
                    newGoal.id, 
                    targets.daily_calories, 
                    targets.daily_protein_g, 
                    targets.daily_carbs_g, 
                    targets.daily_fats_g, 
                    targets.daily_fiber_g || 30, // Default if AI misses it
                    targets.daily_water_ml || 2500, 
                    targets.notes
                ]
            );
            console.log("AI Nutrition Targets Saved for User:", req.user.id);
        } catch (aiError) {
            console.error("Failed to generate AI nutrition targets:", aiError);
            // Non-blocking: we still return the goal, just maybe with a warning or silently fail the AI part
        }
    }

    res.json(newGoal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
