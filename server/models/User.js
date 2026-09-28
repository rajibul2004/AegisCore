const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
      required: function() {
        return this.authProvider === 'local';
      }
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },
    socialId: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'police', 'public'],
      default: 'public',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // --- Public Role Specific Fields ---
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    identificationType: {
      type: String,
      enum: ['NationalID', 'Passport', 'DriverLicense', 'Other']
    },
    identificationNumber: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },

    // --- Police/Admin Role Specific Fields ---
    badgeNumber: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    rank: String,
    station: String,
    jurisdiction: String,
    specialization: String,
    dateJoined: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
