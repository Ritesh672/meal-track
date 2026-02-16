import db from '../db/index.js';

// Get Today's Meals
export const getMeals = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    
    let query = `SELECT m.*, mn.calories, mn.protein_g, mn.carbs_g, mn.fats_g 
       FROM meals m 
       LEFT JOIN meal_nutrition mn ON m.id = mn.meal_id 
       WHERE m.user_id = $1`;
    
    const params = [req.user.id];

    if (date) {
        query += ` AND m.meal_date = $2`;
        params.push(date);
    }

    query += ` ORDER BY m.meal_date DESC, m.meal_time DESC`;

    const meals = await db.query(query, params);

    res.json(meals.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add Meal
export const addMeal = async (req, res) => {
  try {
    const { 
        meal_type, meal_name, description, input_type, image_url,
        calories, protein_g, carbs_g, fats_g 
    } = req.body;

    // 1. Insert into meals
    const newMeal = await db.query(
      `INSERT INTO meals (user_id, meal_date, meal_time, meal_type, meal_name, description, input_type, image_url) 
       VALUES ($1, CURRENT_DATE, CURRENT_TIME, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, meal_type, meal_name, description, input_type, image_url]
    );

    const mealId = newMeal.rows[0].id;

    // 2. Insert into meal_nutrition
    const nutrition = await db.query(
      `INSERT INTO meal_nutrition (meal_id, calories, protein_g, carbs_g, fats_g) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [mealId, calories || 0, protein_g || 0, carbs_g || 0, fats_g || 0]
    );

    res.json({ ...newMeal.rows[0], ...nutrition.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete Meal
export const deleteMeal = async (req, res) => {
  try {
      const { id } = req.params;
      await db.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
      res.json({ message: 'Meal deleted' });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
};
