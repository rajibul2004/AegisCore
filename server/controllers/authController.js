const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const auditService = require('../services/auditService');
const otpService = require('../services/otpService');
const otpDeliveryService = require('../services/otpDeliveryService');

const generateTemporaryToken = (userId, purpose) => {
  return jwt.sign({ id: userId, purpose }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
};

const verifyTemporaryToken = (token, expectedPurpose) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== expectedPurpose) return null;
    return decoded;
  } catch {
    return null;
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists',
        });
      } else {
        // Update unverified user's details in case they changed them
        user.name = name;
        user.password = password; 
        user.role = 'public'; // SECURE: Force public role on registration
        user.authProvider = 'local';
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: 'public', // SECURE: Force public role on registration
        isVerified: false,
        onboardingCompleted: false,
        authProvider: 'local'
      });
    }

    // Generate Email Verification OTP
    const otp = await otpService.generateAndStoreOTP(user._id, 'email_verification');
    await otpDeliveryService.deliver(user, otp, 'email_verification');

    const verificationToken = generateTemporaryToken(user._id, 'email_verification');

    res.status(201).json({
      success: true,
      verificationRequired: true,
      verificationToken,
      message: 'Registration initiated. Please verify your email to complete registration.',
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { verificationToken, otp } = req.body;

    if (!verificationToken || !otp) {
      return res.status(400).json({ success: false, message: 'Token and OTP are required' });
    }

    const decoded = verifyTemporaryToken(verificationToken, 'email_verification');
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Verification session expired. Please register again or request a new code.' });
    }

    const result = await otpService.verifyOTP(decoded.id, otp, 'email_verification');
    if (!result.valid) {
      return res.status(401).json({ success: false, message: result.reason });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    // Now log them in properly
    const token = generateToken(res, user._id);
    req.user = user;
    await auditService.log(req, 'email_verified_login', 'User', user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        twoFactorEnabled: user.twoFactorEnabled,
        isActive: user.isActive, token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { verificationToken } = req.body;
    if (!verificationToken) {
      return res.status(400).json({ success: false, message: 'Verification session token is required' });
    }

    const decoded = verifyTemporaryToken(verificationToken, 'email_verification');
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Session expired' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isVerified) {
       return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    const otp = await otpService.generateAndStoreOTP(user._id, 'email_verification');
    await otpDeliveryService.deliver(user, otp, 'email_verification');

    res.status(200).json({ success: true, message: 'A new verification code has been sent.' });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error while resending verification' });
  }
};

const socialAuth = async (req, res) => {
  try {
    // In a real app, you would verify the Google/Facebook token against their API here.
    // For this demonstration, we trust the payload structure passed from the client,
    // assuming it represents a successfully verified external token payload.
    const { provider, email, name, socialId, avatar, role } = req.body;

    if (!provider || !email || !socialId) {
      return res.status(400).json({ success: false, message: 'Incomplete social auth data' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user (automatically verified)
      user = await User.create({
        name,
        email,
        authProvider: provider,
        socialId,
        avatar,
        role: 'public', // SECURE: Force public role on registration
        isVerified: true, // Social accounts are pre-verified
        onboardingCompleted: false, // Must complete onboarding
      });
      await auditService.log({ user }, 'social_register', 'User', user._id);
    } else {
      // Check if trying to login with social but registered locally
      if (user.authProvider === 'local') {
        // We can link the account or throw an error. For now, let's link it.
        user.authProvider = provider;
        user.socialId = socialId;
        user.isVerified = true;
        await user.save();
      }
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }
      await auditService.log({ user }, 'social_login', 'User', user._id);
    }

    const token = generateToken(res, user._id);

    res.status(200).json({
      success: true,
      message: 'Social authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        twoFactorEnabled: user.twoFactorEnabled,
        isActive: user.isActive, token,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during social authentication' });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Allow updating profile fields based on what was passed
    const updatableFields = [
      'dateOfBirth', 'identificationType', 'identificationNumber', 
      'rank', 'station', 'jurisdiction', 'specialization', 'department', 'badgeNumber'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.address) {
      user.address = { ...user.address, ...req.body.address };
    }
    
    if (req.body.emergencyContact) {
      user.emergencyContact = { ...user.emergencyContact, ...req.body.emergencyContact };
    }

    user.onboardingCompleted = true;
    await user.save();

    await auditService.log(req, 'onboarding_completed', 'User', user._id);

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        ...user.toJSON(),
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during onboarding' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated — contact admin' });
    }

    if (user.authProvider !== 'local') {
      return res.status(400).json({ success: false, message: `Please login using your ${user.authProvider} account.` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      // Resend verification automatically
      const otp = await otpService.generateAndStoreOTP(user._id, 'email_verification');
      await otpDeliveryService.deliver(user, otp, 'email_verification');
      const verificationToken = generateTemporaryToken(user._id, 'email_verification');
      return res.status(403).json({
        success: false,
        verificationRequired: true,
        verificationToken,
        message: 'Email not verified. A new verification code has been sent.'
      });
    }

    if (user.twoFactorEnabled) {
      const otp = await otpService.generateAndStoreOTP(user._id, '2fa');
      await otpDeliveryService.deliver(user, otp, '2fa');
      const twoFactorToken = generateTemporaryToken(user._id, '2fa');
      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        twoFactorToken,
        message: 'OTP has been sent. Please verify to complete login.',
      });
    }

    const token = generateToken(res, user._id);
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
        onboardingCompleted: user.onboardingCompleted,
        twoFactorEnabled: user.twoFactorEnabled,
        isActive: user.isActive, token,
      },
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error during login' });
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

    const decoded = verifyTemporaryToken(twoFactorToken, '2fa');
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Verification session expired. Please login again.',
      });
    }

    const result = await otpService.verifyOTP(decoded.id, otp, '2fa');

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

    const token = generateToken(res, user._id);

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
        onboardingCompleted: user.onboardingCompleted,
        isActive: user.isActive, token,
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

    const decoded = verifyTemporaryToken(twoFactorToken, '2fa');
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

    const otp = await otpService.generateAndStoreOTP(user._id, '2fa');
    await otpDeliveryService.deliver(user, otp, '2fa');

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

    const otp = await otpService.generateAndStoreOTP(user._id, '2fa');
    await otpDeliveryService.deliver(user, otp, '2fa');

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

    const result = await otpService.verifyOTP(req.user._id, otp, '2fa');

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

    const otp = await otpService.generateAndStoreOTP(user._id, '2fa');
    await otpDeliveryService.deliver(user, otp, '2fa');

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

    const result = await otpService.verifyOTP(req.user._id, otp, '2fa');

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
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
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
};
