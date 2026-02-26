const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const generateToken = require("../utils/generateToken");
const { createNotification } = require("./notificationController");

// Register new user (Driver or Customer)
exports.register = async (req, res) => {
  try {
    const { phoneNumber, password, role, ...otherData } = req.body;

    // Validate required fields
    if (!phoneNumber || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please provide phone number, password, and role" });
    }

    // Check if user exists
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "An account already exists with this phone number" });
    }

    // Create user (password will be hashed by User model pre-save hook)
    const user = await User.create({
      phoneNumber,
      password,
      role,
    });

    // Create role-specific profile — if this fails, clean up the User
    try {
      if (role === "driver") {
        await Driver.create({
          userId: user._id,
          name: otherData.name,
          baseLocation: otherData.baseLocation,
          carType: otherData.carType,
          carNumber: otherData.carNumber,
          licenseNumber: otherData.licenseNumber,
          numberOfSeats: otherData.seats || otherData.numberOfSeats,
          contactNumber: phoneNumber,
          isAvailable: false,
        });
      } else if (role === "customer") {
        await Customer.create({
          userId: user._id,
          name: otherData.name,
          phoneNumber: phoneNumber,
          digitalAddress: otherData.digitalAddress || "N/A",
          city: otherData.city || "Kumasi",
        });
      }
    } catch (profileError) {
      // Profile creation failed — remove the orphaned User so they can retry
      await User.findByIdAndDelete(user._id);
      console.error("Profile creation error:", profileError);
      return res.status(400).json({
        message: profileError.message || "Error creating profile. Please check your details and try again.",
      });
    }

    // Create welcome notification for new user
    const welcomeMessages = {
      customer: {
        title: "Welcome to ELOCAB! 🎉",
        message: "Your account has been created successfully. You can now book rides across Kumasi. Enjoy your journey!",
      },
      driver: {
        title: "Welcome to ELOCAB, Driver! 🚗",
        message: "Your driver account has been created successfully. Set your availability to start receiving ride requests.",
      },
    };

    if (welcomeMessages[role]) {
      await createNotification(
        user._id,
        "welcome",
        welcomeMessages[role].title,
        welcomeMessages[role].message
      );
    }

    // Notify all admins about new registration
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "system",
        "New User Registered",
        `A new ${role} has registered: ${otherData.name || phoneNumber}`,
        { userId: user._id, role }
      );
    }

    res.status(201).json({
      _id: user._id,
      phoneNumber: user.phoneNumber,
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
    const { phoneNumber, password } = req.body;

    // Validate required fields
    if (!phoneNumber || !password) {
      return res
        .status(400)
        .json({ message: "Please provide phone number and password" });
    }

    // Check for user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    // Check password using model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone number or password" });
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
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Admin login (uses email — special credentials)
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin user exists by email
    let adminUser = await User.findOne({ email, role: "admin" });

    // If no admin exists and trying to login with default credentials, create admin
    if (!adminUser && email === process.env.ADMIN_EMAIL) {
      adminUser = await User.create({
        phoneNumber: "admin",
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
      phoneNumber: user.phoneNumber,
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
