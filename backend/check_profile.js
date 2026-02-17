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

const checkUserProfile = async () => {
  try {
    console.log("Checking most recent user profile...");
    const profileRes = await pool.query(`
        SELECT up.*, u.email 
        FROM user_profiles up
        JOIN users u ON up.user_id = u.id
        ORDER BY up.created_at DESC 
        LIMIT 1
    `);
    
    if (profileRes.rows.length > 0) {
        console.log("✅ PROFILE FOUND:");
        console.log("User Email:", profileRes.rows[0].email);
        console.log("Profile Data:", JSON.stringify(profileRes.rows[0], null, 2));
        
        const userId = profileRes.rows[0].user_id;

        console.log(`Checking fitness goals for user ${userId}...`);
        const goalsRes = await pool.query(`
            SELECT * FROM fitness_goals 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `, [userId]);

        if (goalsRes.rows.length > 0) {
            console.log("✅ GOALS FOUND:");
            console.log(JSON.stringify(goalsRes.rows[0], null, 2));
        } else {
            console.log("❌ NO GOALS FOUND for this user.");
        }

    } else {
        console.log("❌ No user profiles found.");
    }
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
};

checkUserProfile();
