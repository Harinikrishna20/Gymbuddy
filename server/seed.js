const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const GymClass = require('./models/GymClass');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});
    await GymClass.deleteMany({});

    const admin = await User.create({
      name: 'Gym Admin',
      email: 'admin@gymbooker.com',
      password: 'Admin@123',
      role: 'admin',
    });

    await User.create({
      name: 'Demo Member',
      email: 'member@gymbooker.com',
      password: 'Member@123',
      role: 'member',
    });

    await GymClass.insertMany([
      {
        title: 'Yoga',
        description: 'A calming flow class for mobility and flexibility.',
        category: 'Flexibility',
        trainer: 'Anjali',
        date: '2026-09-29',
        startTime: '6:00 PM',
        endTime: '7:00 PM',
        location: 'Studio A',
        capacity: 20,
      },
      {
        title: 'Zumba',
        description: 'Energetic dance cardio with motivating music.',
        category: 'Cardio',
        trainer: 'Marcus',
        date: '2026-09-30',
        startTime: '7:00 PM',
        endTime: '8:00 PM',
        location: 'Dance Studio',
        capacity: 25,
      },
      {
        title: 'Strength Training',
        description: 'Functional strength training with weights and resistance.',
        category: 'Strength',
        trainer: 'Rachel',
        date: '2026-10-01',
        startTime: '8:00 AM',
        endTime: '9:00 AM',
        location: 'Weights Area',
        capacity: 16,
      },
    ]);

    console.log('Seed data created successfully');
    console.log('Admin login:', admin.email, 'Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
