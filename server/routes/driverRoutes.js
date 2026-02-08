const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  toggleAvailability,
  getMyBookings,
  acceptBooking,
  updateBookingStatus,
} = require("../controllers/driverController");
const { protect, driver } = require("../middleware/auth");

// All routes require authentication and driver role
router.use(protect);
router.use(driver);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/toggle-availability", toggleAvailability);
router.get("/bookings", getMyBookings);
router.post("/bookings/:bookingId/accept", acceptBooking);
router.put("/bookings/:bookingId/status", updateBookingStatus);

module.exports = router;
