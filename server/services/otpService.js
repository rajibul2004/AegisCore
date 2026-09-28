const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_REQUESTS = 3;

const generateOTPCode = () => {
  const digits = crypto.randomInt(0, Math.pow(10, OTP_LENGTH));
  return digits.toString().padStart(OTP_LENGTH, '0');
};

const canRequestOTP = async (userId, purpose = '2fa') => {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  const recentCount = await OTP.countDocuments({
    userId,
    purpose,
    createdAt: { $gte: windowStart },
  });
  return recentCount < RATE_LIMIT_MAX_REQUESTS;
};

const generateAndStoreOTP = async (userId, purpose = '2fa') => {
  const allowed = await canRequestOTP(userId, purpose);
  if (!allowed) {
    const err = new Error('Too many OTP requests. Please wait before trying again.');
    err.statusCode = 429;
    throw err;
  }

  await OTP.updateMany(
    { userId, purpose, isUsed: false },
    { isUsed: true }
  );

  const plainOTP = generateOTPCode();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(plainOTP, salt);

  await OTP.create({
    userId,
    purpose,
    otpHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    isUsed: false,
  });

  return plainOTP;
};

const verifyOTP = async (userId, code, purpose = '2fa') => {
  const otpRecord = await OTP.findOne({
    userId,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { valid: false, reason: 'OTP has expired or does not exist. Please request a new one.' };
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    return { valid: false, reason: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(code, otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = otpRecord.maxAttempts - otpRecord.attempts;
    return { valid: false, reason: `Invalid OTP. ${remaining} attempt(s) remaining.` };
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  return { valid: true };
};

module.exports = {
  generateAndStoreOTP,
  verifyOTP,
  canRequestOTP,
};
