const express = require("express");
const router = express.Router();
const {
  getAllDrivers,
  getAllCustomers,
  getDashboardStats,
  assignDriver,
  updateBookingStatus,
  deleteDriver,
  deleteCustomer,
  toggleDriverStatus,
  getAllBookings,
  clearCompletedBookings,
  clearAllBookings,
  createCustomer,
  createDriver,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get("/stats", getDashboardStats);

// Drivers
router.get("/drivers", getAllDrivers);
router.post("/drivers", createDriver);
router.delete("/drivers/:driverId", deleteDriver);
router.put("/drivers/:driverId/toggle-status", toggleDriverStatus);

// Customers
router.get("/customers", getAllCustomers);
router.post("/customers", createCustomer);
router.delete("/customers/:customerId", deleteCustomer);

// Bookings
router.get("/bookings", getAllBookings);
router.post("/bookings/assign", assignDriver);
router.put("/bookings/:bookingId/status", updateBookingStatus);
router.delete("/bookings/clear-completed", clearCompletedBookings);
router.delete("/bookings/clear-all", clearAllBookings);

module.exports = router;
