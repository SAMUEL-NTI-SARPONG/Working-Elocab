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
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    let admin = await User.findOne({
      email,
      role: "admin",
    });
    if (!admin)
      admin = new User({
        phoneNumber: "admin",
        email,
        role: "admin",
      });
    admin.password = process.env.ADMIN_PASSWORD;
    admin.isActive = true;
    await admin.save();

    console.log("✅ Admin account password synchronized with ADMIN_PASSWORD");
    console.log("📧 Email:", email);

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
