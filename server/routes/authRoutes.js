const express = require('express');
const router = express.Router();
const {
  register,
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

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.post('/2fa/verify', verifyTwoFactor);
router.post('/2fa/resend', resendOTP);
router.post('/2fa/enable', protect, enableTwoFactor);
router.post('/2fa/enable/confirm', protect, confirmEnableTwoFactor);
router.post('/2fa/disable', protect, disableTwoFactor);
router.post('/2fa/disable/confirm', protect, confirmDisableTwoFactor);

module.exports = router;
