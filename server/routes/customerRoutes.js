const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/customerController");
const { protect, customer } = require("../middleware/auth");

// All routes require authentication and customer role
router.use(protect);
router.use(customer);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/bookings", createBooking);
router.get("/bookings", getMyBookings);
router.get("/bookings/:bookingId", getBookingById);
router.put("/bookings/:bookingId/cancel", cancelBooking);

module.exports = router;
