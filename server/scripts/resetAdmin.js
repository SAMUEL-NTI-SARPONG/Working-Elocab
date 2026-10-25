const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
      throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD first.");
    let admin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    });
    if (!admin)
      admin = new User({
        phoneNumber: "admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      });
    admin.password = process.env.ADMIN_PASSWORD;
    admin.isActive = true;
    await admin.save();

    console.log("✅ New admin user created successfully");
    console.log("📧 Email:", process.env.ADMIN_EMAIL);

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
