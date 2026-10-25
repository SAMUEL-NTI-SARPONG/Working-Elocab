const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Driver = require("../models/Driver");
const generateToken = require("../utils/generateToken");
const { createAccount, normalizePhone } = require("../utils/accounts");
const { fail, sendError } = require("../utils/errors");
const { createNotification } = require("./notificationController");
const profileFor = (user) =>
  user.role === "customer"
    ? Customer.findOne({ userId: user._id })
    : user.role === "driver"
      ? Driver.findOne({ userId: user._id })
      : null;
const session = (user, profile) => ({
  _id: user._id,
  phoneNumber: user.phoneNumber,
  email: user.email,
  role: user.role,
  profile,
  token: generateToken(user._id),
});
exports.register = async (req, res) => {
  try {
    const { user, profile } = await createAccount(req.body, req.body.role);
    await createNotification(
      user._id,
      "welcome",
      "Welcome to ELOCAB",
      "Your account is ready. Your journey starts here.",
    );
    res.status(201).json(session(user, profile));
  } catch (error) {
    sendError(res, error);
  }
};
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const phoneNumber = normalizePhone(req.body.phoneNumber);
    if (!phoneNumber || typeof password !== "string" || !password)
      throw fail(400, "Enter your phone number and password.");
    const user = await User.findOne({
      phoneNumber,
      role: { $in: ["customer", "driver"] },
    });
    if (!user || !(await user.comparePassword(password)))
      throw fail(401, "Invalid phone number or password.");
    if (!user.isActive)
      throw fail(403, "Your account is inactive. Please contact ELOCAB.");
    const profile = await profileFor(user);
    if (!profile || !profile.isActive)
      throw fail(403, "Your profile is unavailable. Please contact ELOCAB.");
    res.json(session(user, profile));
  } catch (error) {
    sendError(res, error);
  }
};
exports.adminLogin = async (req, res) => {
  try {
    const { password } = req.body;
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    if (!email || typeof password !== "string" || !password)
      throw fail(400, "Enter your email and password.");
    let user = await User.findOne({ email, role: "admin" });
    if (
      !user &&
      email === process.env.ADMIN_EMAIL?.toLowerCase() &&
      process.env.ADMIN_PASSWORD
    ) {
      const bootstrapHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      if (await bcrypt.compare(password, bootstrapHash)) {
        try {
          user = await User.create({
            phoneNumber: "admin",
            email,
            password,
            role: "admin",
          });
        } catch (error) {
          if (error.code !== 11000) throw error;
          user = await User.findOne({ email, role: "admin" });
        }
      }
    }
    if (!user || !(await user.comparePassword(password)))
      throw fail(401, "Invalid admin credentials.");
    if (!user.isActive) throw fail(403, "This admin account is inactive.");
    res.json(session(user, null));
  } catch (error) {
    sendError(res, error);
  }
};
exports.getMe = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      phoneNumber: req.user.phoneNumber,
      email: req.user.email,
      role: req.user.role,
      profile: await profileFor(req.user),
    });
  } catch (error) {
    sendError(res, error);
  }
};
