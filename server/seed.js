const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running the seed command.');
    }

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      console.log('An account with ADMIN_EMAIL already exists; no changes were made.');
      return;
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD,
      role: 'admin',
    });

    console.log(`Admin account created for ${ADMIN_EMAIL.toLowerCase()}.`);
  } catch (error) {
    console.error('Unable to create admin account:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
