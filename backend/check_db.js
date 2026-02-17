import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const checkRecentTargets = async () => {
  try {
    console.log("Checking for recent nutrition targets...");
    const res = await pool.query(`
        SELECT nt.*, u.email 
        FROM nutrition_targets nt
        JOIN users u ON nt.user_id = u.id
        ORDER BY nt.created_at DESC 
        LIMIT 1
    `);
    
    if (res.rows.length > 0) {
        console.log("✅ DATA FOUND! Most recent entry:");
        console.log(JSON.stringify(res.rows[0], null, 2));
    } else {
        console.log("❌ No nutrition targets found.");
    }
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
};

checkRecentTargets();
