const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Statistics = require("../models/Statistics");
const User = require("../models/User");
const { createNotification } = require("./notificationController");

// Get customer profile
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer profile",
      error: error.message,
    });
  }
};

// Update customer profile
exports.updateProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const allowedUpdates = ["name", "phoneNumber", "digitalAddress", "city"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customer._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({
      message: "Error updating customer profile",
      error: error.message,
    });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const {
      serviceType,
      dateTime,
      pickupPoint,
      destination,
      numberOfPeople,
      notes,
    } = req.body;

    const booking = await Booking.create({
      customerId: customer._id,
      serviceType,
      dateTime,
      pickupPoint,
      destination,
      numberOfPeople,
      notes,
      status: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id).populate(
      "customerId",
      "name phoneNumber city",
    );

    // Track statistics
    const stats = await Statistics.getInstance();
    await stats.incrementBooking(booking.totalAmount || 0);

    // Notify admin via Socket.io
    const io = req.app.get("io");
    io.emit("newBooking", populatedBooking);

    // Create notification for customer
    await createNotification(
      req.user._id,
      "booking_created",
      "Booking Confirmed",
      `Your ${serviceType} ride from ${pickupPoint} to ${destination} has been submitted. We'll assign a driver soon.`,
      { bookingId: booking._id },
    );

    // Create notification for all admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "booking_created",
        "New Booking Received",
        `${customer.name} booked a ${serviceType} ride: ${pickupPoint} → ${destination}`,
        { bookingId: booking._id },
      );
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};

// Get customer's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const bookings = await Booking.find({ customerId: customer._id })
      .populate("driverId", "name contactNumber carType carNumber")
      .sort({ createdAt: -1 });

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
    const { bookingId } = req.params;
    const customer = await Customer.findOne({ userId: req.user._id });

    const booking = await Booking.findById(bookingId).populate(
      "driverId",
      "name contactNumber carType carNumber",
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId.toString() !== customer._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching booking", error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const customer = await Customer.findOne({ userId: req.user._id });

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId.toString() !== customer._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Notify admin and driver via Socket.io
    const io = req.app.get("io");
    io.emit("bookingCancelled", booking);

    // Create notification for admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "booking_cancelled",
        "Booking Cancelled",
        `${customer.name} cancelled their booking: ${booking.pickupPoint} → ${booking.destination}`,
        { bookingId: booking._id },
      );
    }

    // Create notification for the assigned driver (if any)
    if (booking.driverId) {
      const driver = await Driver.findById(booking.driverId);
      if (driver && driver.userId) {
        await createNotification(
          driver.userId,
          "booking_cancelled",
          "Booking Cancelled by Customer",
          `${customer.name} cancelled the booking: ${booking.pickupPoint} → ${booking.destination}`,
          { bookingId: booking._id },
        );
      }
    }

    res.json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: error.message });
  }
};
