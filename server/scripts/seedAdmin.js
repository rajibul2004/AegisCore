require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@aegiscore.com'; // Default seed admin

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Super Admin already exists. Exiting...');
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: 'AdminPassword123!', // Require immediate change in production
      role: 'admin',
      isVerified: true,
      onboardingCompleted: true,
      authProvider: 'local'
    });

    console.log('Super Admin created successfully:', adminUser.email);
    console.log('Please log in and change the default password!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
