const Driver = require("../models/Driver");
const Booking = require("../models/Booking");
const Statistics = require("../models/Statistics");
const Customer = require("../models/Customer");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Get driver profile
exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }
    res.json(driver);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching driver profile", error: error.message });
  }
};

// Update driver profile
exports.updateProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    const allowedUpdates = [
      "name",
      "baseLocation",
      "carType",
      "carNumber",
      "licenseNumber",
      "numberOfSeats",
      "contactNumber",
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedDriver = await Driver.findByIdAndUpdate(
      driver._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.json(updatedDriver);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating driver profile", error: error.message });
  }
};

// Toggle driver availability
exports.toggleAvailability = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    // Notify admin of availability change via Socket.io
    const io = req.app.get("io");
    io.emit("driverAvailabilityChanged", {
      driverId: driver._id,
      isAvailable: driver.isAvailable,
      driverName: driver.name,
    });

    res.json({
      message: `Driver is now ${driver.isAvailable ? "available" : "unavailable"}`,
      isAvailable: driver.isAvailable,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling availability", error: error.message });
  }
};

// Get driver's assigned bookings
exports.getMyBookings = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    const bookings = await Booking.find({ driverId: driver._id })
      .populate("customerId", "name phoneNumber")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

// Accept booking
exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const driver = await Driver.findOne({ userId: req.user._id });

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.driverId.toString() !== driver._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized for this booking" });
    }

    booking.status = "accepted";
    await booking.save();

    // Notify customer and admin
    const io = req.app.get("io");
    io.emit("bookingUpdated", booking);

    res.json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error accepting booking", error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const driver = await Driver.findOne({ userId: req.user._id });
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.driverId.toString() !== driver._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized for this booking" });
    }

    const validStatuses = [
      "accepted",
      "on-the-way",
      "picked-up",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Track statistics
    const stats = await Statistics.getInstance();
    if (status === "completed" && oldStatus !== "completed") {
      await stats.recordCompleted(booking.totalAmount || 0);
    } else if (status === "cancelled" && oldStatus !== "cancelled") {
      await stats.recordCancelled();
    }

    // Notify customer and admin via Socket.io
    const io = req.app.get("io");
    io.emit("bookingUpdated", booking);

    // Create notification for customer about status change
    const customer = await Customer.findById(booking.customerId);
    if (customer) {
      const statusMessages = {
        "on-the-way": `Your driver ${driver.name} is on the way to pick you up!`,
        "picked-up": `You've been picked up by ${driver.name}. Enjoy your ride!`,
        "completed": `Your ride with ${driver.name} is complete. Thank you for riding with ELOCAB!`,
        "cancelled": `Your ride has been cancelled by the driver.`,
      };
      const msg = statusMessages[status] || `Your booking status has been updated to: ${status}`;
      await createNotification(
        customer.userId,
        status === "completed" ? "booking_completed" : "booking_status",
        status === "completed" ? "Ride Completed" : "Ride Status Update",
        msg,
        { bookingId: booking._id, status }
      );
    }

    // Notify admins about status change
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "booking_status",
        "Booking Status Updated",
        `${driver.name} updated booking to: ${status.replace("-", " ")}`,
        { bookingId: booking._id, status }
      );
    }

    res.json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking status", error: error.message });
  }
};
