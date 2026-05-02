require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const seedUsers = [
  { name: 'Admin User', email: 'admin@test.com', password: 'Admin@1234', role: 'admin' },
  { name: 'Alice', email: 'alice@test.com', password: 'Member@1234', role: 'member' },
  { name: 'Bob', email: 'bob@test.com', password: 'Member@1234', role: 'member' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared.');

    // Hash passwords and insert using save() to trigger the pre-save hook
    const insertedUsers = await Promise.all(
      seedUsers.map(async (userData) => {
        const user = new User(userData);
        await user.save();
        return user;
      })
    );

    console.log(`✓ Seeded ${insertedUsers.length} users:`);
    insertedUsers.forEach((u) => {
      console.log(`  - ${u.name} (${u.email}) [${u.role}]`);
    });

    await mongoose.disconnect();
    console.log('Done. MongoDB disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
