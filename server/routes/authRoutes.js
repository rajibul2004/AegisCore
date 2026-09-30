const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerificationEmail,
  socialAuth,
  completeOnboarding,
  login,
  verifyTwoFactor,
  resendOTP,
  enableTwoFactor,
  confirmEnableTwoFactor,
  disableTwoFactor,
  confirmDisableTwoFactor,
  getMe,
  logout,
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validateRequest');
const { protect } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/verify-email/resend', authLimiter, resendVerificationEmail);
router.post('/social', socialAuth);
router.post('/onboard', protect, completeOnboarding);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.post('/2fa/verify', verifyTwoFactor);
router.post('/2fa/resend', resendOTP);
router.post('/2fa/enable', protect, enableTwoFactor);
router.post('/2fa/enable/confirm', protect, confirmEnableTwoFactor);
router.post('/2fa/disable', protect, disableTwoFactor);
router.post('/2fa/disable/confirm', protect, confirmDisableTwoFactor);

module.exports = router;
