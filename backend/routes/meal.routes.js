const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   GET api/meals
// @desc    Get meals for a specific date
// @access  Private
router.get('/', authMiddleware, mealController.getMeals);

// @route   POST api/meals
// @desc    Add a new meal
// @access  Private
router.post('/', authMiddleware, mealController.addMeal);

// @route   DELETE api/meals/:id
// @desc    Delete a meal
// @access  Private
router.delete('/:id', authMiddleware, mealController.deleteMeal);

module.exports = router;
