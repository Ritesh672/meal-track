const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// @route   GET api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authMiddleware, userController.getProfile);

// @route   POST api/user/profile
// @desc    Create or update profile
// @access  Private
router.post('/profile', authMiddleware, userController.updateProfile);

// @route   POST api/user/goals
// @desc    Set fitness goals
// @access  Private
router.post('/goals', authMiddleware, userController.setGoals);

module.exports = router;
