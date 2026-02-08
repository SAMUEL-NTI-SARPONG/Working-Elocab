const User = require("../models/User");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Statistics = require("../models/Statistics");
const bcrypt = require("bcryptjs");

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId", "email createdAt")
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching drivers", error: error.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("userId", "email createdAt")
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ isAvailable: true });
    const totalCustomers = await Customer.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    // Get lifetime statistics
    const stats = await Statistics.getInstance();
    const last7Days = stats.dailyBookings
      .slice(-7)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
      },
      customers: {
        total: totalCustomers,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
      },
      lifetime: {
        totalBookings: stats.totalBookingsAllTime,
        totalCompleted: stats.totalCompletedBookingsAllTime,
        totalCancelled: stats.totalCancelledBookingsAllTime,
        totalRevenue: stats.totalRevenueAllTime,
        last7Days: last7Days,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching dashboard stats",
        error: error.message,
      });
  }
};

// Assign driver to booking
exports.assignDriver = async (req, res) => {
  try {
    const { bookingId, driverId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    booking.driverId = driverId;
    booking.status = "accepted";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "name phoneNumber")
      .populate("driverId", "name contactNumber carType carNumber");

    // Notify driver and customer via Socket.io
    const io = req.app.get("io");
    io.emit("bookingAssigned", populatedBooking);

    // Send to specific driver if connected
    if (global.connectedUsers.has(driver.userId.toString())) {
      const driverSocketId = global.connectedUsers.get(
        driver.userId.toString(),
      );
      io.to(driverSocketId).emit("newAssignment", populatedBooking);
    }

    res.json(populatedBooking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error assigning driver", error: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
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

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "name phoneNumber")
      .populate("driverId", "name contactNumber carType carNumber");

    // Notify all parties via Socket.io
    const io = req.app.get("io");
    io.emit("bookingUpdated", populatedBooking);

    res.json(populatedBooking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating booking status", error: error.message });
  }
};

// Delete/Deactivate driver
exports.deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Delete user account
    await User.findByIdAndDelete(driver.userId);

    // Delete driver profile
    await Driver.findByIdAndDelete(driverId);

    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting driver", error: error.message });
  }
};

// Delete/Deactivate customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Delete user account
    await User.findByIdAndDelete(customer.userId);

    // Delete customer profile
    await Customer.findByIdAndDelete(customerId);

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting customer", error: error.message });
  }
};

// Toggle driver active status
exports.toggleDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isAvailable = !driver.isAvailable;
    await driver.save();

    res.json({
      message: `Driver ${driver.isAvailable ? "activated" : "deactivated"} successfully`,
      driver,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling driver status", error: error.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name phoneNumber city digitalAddress")
      .populate("driverId", "name contactNumber carType carNumber")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

// Clear completed bookings to save space
exports.clearCompletedBookings = async (req, res) => {
  try {
    const result = await Booking.deleteMany({ 
      status: { $in: ["completed", "cancelled"] } 
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} completed/cancelled bookings`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing bookings", error: error.message });
  }
};

// Clear all bookings (use with caution)
exports.clearAllBookings = async (req, res) => {
  try {
    const result = await Booking.deleteMany({});

    res.json({
      message: `Successfully deleted all ${result.deletedCount} bookings`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing all bookings", error: error.message });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, city, digitalAddress } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "customer",
    });

    // Create customer profile
    const customer = await Customer.create({
      userId: user._id,
      name,
      phoneNumber,
      city,
      digitalAddress,
    });

    const populatedCustomer = await Customer.findById(customer._id)
      .populate("userId", "email createdAt");

    res.status(201).json({
      message: "Customer created successfully",
      customer: populatedCustomer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating customer", error: error.message });
  }
};

// Create new driver
exports.createDriver = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      baseLocation,
      carType,
      carNumber,
      licenseNumber,
      seats,
      contactNumber,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "driver",
    });

    // Create driver profile
    const driver = await Driver.create({
      userId: user._id,
      name,
      baseLocation,
      carType,
      carNumber,
      licenseNumber,
      seats: seats || 4,
      contactNumber,
      isAvailable: true,
    });

    const populatedDriver = await Driver.findById(driver._id)
      .populate("userId", "email createdAt");

    res.status(201).json({
      message: "Driver created successfully",
      driver: populatedDriver,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating driver", error: error.message });
  }
};
