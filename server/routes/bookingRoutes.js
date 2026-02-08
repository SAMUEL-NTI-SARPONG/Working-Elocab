const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  getBookingStats,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.get("/", getAllBookings);
router.get("/stats", getBookingStats);
router.get("/:id", getBookingById);

module.exports = router;
