const express = require("express");
const router = express.Router();
require("../middleware/recordIds")(router);
const {
  getAllBookings,
  getBookingById,
  getBookingStats,
} = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/auth");

// All routes require authentication
router.use(protect);
router.use(admin);

router.get("/", getAllBookings);
router.get("/stats", getBookingStats);
router.get("/:id", getBookingById);

module.exports = router;
