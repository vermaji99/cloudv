const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.get('/me', authController.getMe); // Removed protect middleware for silent session check
router.post('/logout', authController.logout);

module.exports = router;
