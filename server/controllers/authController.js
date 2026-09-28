const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const auditService = require('../services/auditService');
const otpService = require('../services/otpService');
const otpDeliveryService = require('../services/otpDeliveryService');

const generateTwoFactorToken = (userId) => {
  return jwt.sign({ id: userId, purpose: '2fa' }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
};

const verifyTwoFactorToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== '2fa') return null;
    return decoded;
  } catch {
    return null;
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, badgeNumber, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'public',
      phone,
      badgeNumber,
      department,
    });

    generateToken(res, user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated — contact admin',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Database Error: Password hash missing for this user.',
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.twoFactorEnabled) {
      const otp = await otpService.generateAndStoreOTP(user._id);
      await otpDeliveryService.deliver(user, otp);

      const twoFactorToken = generateTwoFactorToken(user._id);

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        twoFactorToken,
        message: 'OTP has been sent. Please verify to complete login.',
      });
    }

    generateToken(res, user._id);

    req.user = user;
    await auditService.log(req, 'login', 'User', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const verifyTwoFactor = async (req, res) => {
  try {
    const { twoFactorToken, otp } = req.body;

    if (!twoFactorToken || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Token and OTP are required',
      });
    }

    const decoded = verifyTwoFactorToken(twoFactorToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Verification session expired. Please login again.',
      });
    }

    const result = await otpService.verifyOTP(decoded.id, otp);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: result.reason,
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.',
      });
    }

    generateToken(res, user._id);

    req.user = user;
    await auditService.log(req, 'login_2fa', 'User', user._id);

    res.status(200).json({
      success: true,
      message: 'Two-factor verification successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA verification',
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { twoFactorToken } = req.body;

    if (!twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'Verification session token is required',
      });
    }

    const decoded = verifyTwoFactorToken(twoFactorToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Verification session expired. Please login again.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = await otpService.generateAndStoreOTP(user._id);
    await otpDeliveryService.deliver(user, otp);

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent.',
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
    });
  }
};

const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is already enabled.',
      });
    }

    const otp = await otpService.generateAndStoreOTP(user._id);
    await otpDeliveryService.deliver(user, otp);

    res.status(200).json({
      success: true,
      message: 'Confirmation OTP sent. Verify to activate 2FA.',
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while enabling 2FA',
    });
  }
};

const confirmEnableTwoFactor = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const result = await otpService.verifyOTP(req.user._id, otp);

    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.reason });
    }

    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });

    await auditService.log(req, '2fa_enabled', 'User', req.user._id);

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been enabled.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while confirming 2FA',
    });
  }
};

const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is not enabled.',
      });
    }

    const otp = await otpService.generateAndStoreOTP(user._id);
    await otpDeliveryService.deliver(user, otp);

    res.status(200).json({
      success: true,
      message: 'Confirmation OTP sent. Verify to deactivate 2FA.',
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while disabling 2FA',
    });
  }
};

const confirmDisableTwoFactor = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const result = await otpService.verifyOTP(req.user._id, otp);

    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.reason });
    }

    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: false });

    await auditService.log(req, '2fa_disabled', 'User', req.user._id);

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been disabled.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while confirming 2FA disable',
    });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

const logout = async (req, res) => {
  if (req.user) {
    await auditService.log(req, 'logout', 'User', req.user._id);
  }

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
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
};
