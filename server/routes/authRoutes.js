const express = require("express");
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/security");

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/admin/login", authLimiter, adminLogin);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
