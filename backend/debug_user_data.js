import pg from 'pg';
import dotenv from 'dotenv';
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

const checkLatestUser = async () => {
  try {
    const res = await pool.query(`
      SELECT u.id, u.email, u.created_at, 
             p.full_name, p.fitness_level, 
             g.goal_type, g.target_weight_kg, g.activity_level,
             n.daily_calories, n.daily_protein_g
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN fitness_goals g ON u.id = g.user_id 
      LEFT JOIN nutrition_targets n ON u.id = n.user_id
      ORDER BY u.created_at DESC
      LIMIT 1;
    `);
    
    console.log("Latest User Data:", res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};

checkLatestUser();
