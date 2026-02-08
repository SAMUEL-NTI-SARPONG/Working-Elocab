const express = require("express");
const router = express.Router();
const {
  getArchivableBookings,
  archiveAndCleanup,
  getArchiveStats,
} = require("../controllers/archiveController");
const { protect, admin } = require("../middleware/auth");

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Archive routes
router.get("/stats", getArchiveStats);
router.get("/preview", getArchivableBookings);
router.post("/execute", archiveAndCleanup);

module.exports = router;
