import express from 'express';
import { getMeals, addMeal, deleteMeal } from '../controllers/meal.controller.js';
import  analyzeMeal  from '../controllers/gemini.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET api/meals
// @desc    Get meals for a specific date
// @access  Private
router.get('/', authMiddleware, getMeals);

// @route   POST api/meals/analyze
// @desc    Analyze a meal description using AI
// @access  Private
router.post('/analyze', authMiddleware, analyzeMeal);

// @route   POST api/meals
// @desc    Add a new meal
// @access  Private
router.post('/', authMiddleware, addMeal);

// @route   DELETE api/meals/:id
// @desc    Delete a meal
// @access  Private
router.delete('/:id', authMiddleware, deleteMeal);

export default router;
