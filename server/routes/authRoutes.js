const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validateRequest');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
