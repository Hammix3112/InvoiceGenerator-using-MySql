const sequelize = require('../db'); // your Sequelize connection
const User = require('../models/User');

async function seedUsers() {
  try {
    await sequelize.sync({ force: false }); // sync models but do NOT drop tables
    await User.create({
      username: "Hamaad Janjua",
      email: "hamaadjanjua64@gmail.com",
      password: "your_hashed_password_here", // IMPORTANT: hash passwords in real apps
      date: new Date("2025-05-12T06:45:46.849Z")
    });
    console.log("✅ User seeded successfully!");
    process.exit(0);  // exit after seeding
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
