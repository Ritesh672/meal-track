import pg from 'pg';
import dotenv from 'dotenv';
import { calculateNutritionTargets } from './services/gemini.service.js';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

const triggerAI = async () => {
  try {
    console.log("Fetching latest user...");
    const user = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 1');
    if (user.rows.length === 0) { console.log("No users."); return; }
    
    const userId = user.rows[0].id;
    console.log(`User ID: ${userId} (${user.rows[0].email})`);

    const profile = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const goals = await pool.query('SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);

    if (!profile.rows[0] || !goals.rows[0]) {
        console.log("❌ Missing profile or goals.");
        return;
    }

    console.log("✅ Data found. Calling AI Service...");
    const targets = await calculateNutritionTargets(profile.rows[0], goals.rows[0]);
    console.log("✅ AI RESULT:", targets);

    // Write to DB
    await pool.query('UPDATE nutrition_targets SET is_active = false WHERE user_id = $1', [userId]);
    await pool.query(
        `INSERT INTO nutrition_targets 
        (user_id, goal_id, daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g, daily_fiber_g, daily_water_ml, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            userId, 
            goals.rows[0].id, 
            targets.daily_calories, 
            targets.daily_protein_g, 
            targets.daily_carbs_g, 
            targets.daily_fats_g, 
            targets.daily_fiber_g || 30, 
            targets.daily_water_ml || 2500, 
            targets.notes
        ]
    );
    console.log("✅ START SAVED TO DB! Check Dashboard.");

  } catch (err) {
    console.error("❌ FAILED:", err);
  } finally {
    await pool.end();
  }
};

triggerAI();
