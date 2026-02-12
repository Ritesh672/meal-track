const db = require('../db');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const profile = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.id]);
    const goals = await db.query('SELECT * FROM fitness_goals WHERE user_id = $1 AND is_active = true', [req.user.id]);

    res.json({
      profile: profile.rows[0] || null,
      goals: goals.rows[0] || null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create or Update Profile
const updateProfile = async (req, res) => {
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

    res.json(profile.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Set Fitness Goals
const setGoals = async (req, res) => {
  try {
    const { goal_type, target_physique, target_weight_kg, activity_level } = req.body;

    // Deactivate old goals
    await db.query('UPDATE fitness_goals SET is_active = false WHERE user_id = $1', [req.user.id]);

    // Create new goal
    const newGoal = await db.query(
      'INSERT INTO fitness_goals (user_id, goal_type, target_physique, target_weight_kg, activity_level, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
      [req.user.id, goal_type, target_physique, target_weight_kg, activity_level]
    );

    res.json(newGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  setGoals,
};
