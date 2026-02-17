import axios from 'axios';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

import { calculateNutritionTargets } from './services/gemini.service.js';

const testNutritionAutomation = async () => {
  try {
    // 1. Create a simplified test user directly in DB (to avoid auth complexity in script)
    // Removed DB creation part to keep it simple and focus on SERVICE logic
    /*
    const email = `test_nutrition_${Date.now()}@example.com`;
    // ...
    */

    // Test the SERVICE interactions directly to verify Gemini.
    const mockProfile = { age: 30, gender: 'male', height_cm: 180, current_weight_kg: 80, fitness_level: 'intermediate' };
    const mockGoal = { goal_type: 'muscle_gain', target_weight_kg: 85, activity_level: 'active', target_physique: 'muscular' };
    
    console.log('Testing gemini.service.js directly...');
    
    const targets = await calculateNutritionTargets(mockProfile, mockGoal);
    console.log('Received Targets from AI:', targets);

    if (targets.daily_calories && targets.daily_protein_g) {
        console.log('✅ AI Service Verification Passed');
    } else {
        console.error('❌ AI Service returned incomplete data');
    }

  } catch (err) {
    console.error('❌ Verification Failed:', err);
  } finally {
    await pool.end();
  }
};

testNutritionAutomation();
