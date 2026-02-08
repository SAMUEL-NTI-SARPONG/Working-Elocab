const Booking = require("../models/Booking");

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;

    const query = status ? { status } : {};

    const bookings = await Booking.find(query)
      .populate("customerId", "name phoneNumber city digitalAddress")
      .populate("driverId", "name contactNumber carType carNumber seats")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "name phoneNumber city digitalAddress")
      .populate("driverId", "name contactNumber carType carNumber seats");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching booking", error: error.message });
  }
};

// Get booking statistics
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const assignedBookings = await Booking.countDocuments({
      status: "assigned",
    });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    res.json({
      total: totalBookings,
      pending: pendingBookings,
      assigned: assignedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching booking statistics",
        error: error.message,
      });
  }
};
