const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const generateToken = require("../utils/generateToken");

// Register new user (Driver or Customer)
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...otherData } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please provide email, password, and role" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create user (password will be hashed by User model pre-save hook)
    const user = await User.create({
      email,
      password,
      role,
    });

    // Create role-specific profile
    if (role === "driver") {
      await Driver.create({
        userId: user._id,
        name: otherData.name,
        baseLocation: otherData.baseLocation,
        carType: otherData.carType,
        carNumber: otherData.carNumber,
        licenseNumber: otherData.licenseNumber,
        numberOfSeats: otherData.seats || otherData.numberOfSeats,
        contactNumber: otherData.contactNumber,
        isAvailable: false,
      });
    } else if (role === "customer") {
      await Customer.create({
        userId: user._id,
        name: otherData.name,
        phoneNumber: otherData.phoneNumber,
        digitalAddress: otherData.digitalAddress,
        city: otherData.city,
      });
    }

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password using model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get role-specific profile
    let profile = null;
    if (user.role === "driver") {
      profile = await Driver.findOne({ userId: user._id });
    } else if (user.role === "customer") {
      profile = await Customer.findOne({ userId: user._id });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Admin login (special credentials)
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin user exists
    let adminUser = await User.findOne({ email, role: "admin" });

    // If no admin exists and trying to login with default credentials, create admin
    if (!adminUser && email === process.env.ADMIN_EMAIL) {
      adminUser = await User.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      });
    }

    if (!adminUser) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Check password using model method
    const isMatch = await adminUser.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    res.json({
      _id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
      token: generateToken(adminUser._id),
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res
      .status(500)
      .json({ message: "Error logging in as admin", error: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    let profile = null;
    if (user.role === "driver") {
      profile = await Driver.findOne({ userId: user._id });
    } else if (user.role === "customer") {
      profile = await Customer.findOne({ userId: user._id });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};
