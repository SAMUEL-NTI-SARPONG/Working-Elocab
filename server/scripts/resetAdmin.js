const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Delete existing admin user
    const deletedAdmin = await User.deleteOne({
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    });

    if (deletedAdmin.deletedCount > 0) {
      console.log("🗑️  Deleted existing admin user");
    } else {
      console.log("ℹ️  No existing admin user found");
    }

    // Create new admin user
    const newAdmin = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("✅ New admin user created successfully");
    console.log("📧 Email:", process.env.ADMIN_EMAIL);
    console.log("🔑 Password:", process.env.ADMIN_PASSWORD);

    // Disconnect
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetAdmin();
