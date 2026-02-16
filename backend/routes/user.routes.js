import express from 'express';
import { getProfile, updateProfile, setGoals } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, getProfile);

// @route   POST api/user/profile
// @desc    Create or update profile
// @access  Private
router.post('/profile', authMiddleware, updateProfile);

// @route   POST api/user/goals
// @desc    Set fitness goals
// @access  Private
router.post('/goals', authMiddleware, setGoals);

export default router;
