const User = require("../models/User");
const Driver = require("../models/Driver");
const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Statistics = require("../models/Statistics");
const { createAccount } = require("../utils/accounts");
const { fail, sendError } = require("../utils/errors");
const {
  transitionBooking,
  notifyBooking,
} = require("../utils/bookingWorkflow");
const activeStatuses = [
  "pending",
  "assigned",
  "accepted",
  "on-the-way",
  "picked-up",
];
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    sendError(res, e);
  }
};
exports.getAllDrivers = wrap(async (req, res) =>
  res.json(
    await Driver.find()
      .populate("userId", "phoneNumber createdAt")
      .sort({ createdAt: -1 }),
  ),
);
exports.getAllCustomers = wrap(async (req, res) =>
  res.json(
    await Customer.find()
      .populate("userId", "phoneNumber createdAt")
      .sort({ createdAt: -1 }),
  ),
);
exports.getAllBookings = wrap(async (req, res) =>
  res.json(
    await Booking.find()
      .populate("customerId", "name phoneNumber city digitalAddress")
      .populate("driverId", "name contactNumber carType carNumber")
      .sort({ createdAt: -1 }),
  ),
);
exports.getDashboardStats = wrap(async (req, res) => {
  const [
    totalDrivers,
    activeDrivers,
    totalCustomers,
    totalBookings,
    pendingBookings,
    completedBookings,
    stats,
  ] = await Promise.all([
    Driver.countDocuments(),
    Driver.countDocuments({ isActive: true, isAvailable: true }),
    Customer.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending" }),
    Booking.countDocuments({ status: "completed" }),
    Statistics.getInstance(),
  ]);
  res.json({
    drivers: { total: totalDrivers, active: activeDrivers },
    customers: { total: totalCustomers },
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
      last7Days: stats.dailyBookings.slice(-7).sort((a, b) => a.date - b.date),
    },
  });
});
exports.assignDriver = wrap(async (req, res) => {
  const assigned = await require("../utils/assignment")(
    req.body.bookingId,
    req.body.driverId,
  );
  res.json(await notifyBooking(req, "bookingAssigned", assigned));
});
exports.updateBookingStatus = wrap(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw fail(404, "Booking not found.");
  res.json(await transitionBooking(req, booking, req.body.status));
});
const deleteAccount = (Model, param, reference) =>
  wrap(async (req, res) => {
    const profile = await Model.findById(req.params[param]);
    if (!profile) throw fail(404, "Account not found.");
    if (
      await Booking.exists({
        [reference]: profile._id,
        status: { $in: activeStatuses },
      })
    )
      throw fail(409, "Resolve active bookings before deleting this account.");
    await User.findByIdAndDelete(profile.userId);
    await Notification.deleteMany({ userId: profile.userId });
    await Model.findByIdAndDelete(profile._id);
    req.app.get("io").in(`user:${profile.userId}`).disconnectSockets(true);
    res.json({ message: "Account deleted." });
  });
exports.deleteDriver = deleteAccount(Driver, "driverId", "driverId");
exports.deleteCustomer = deleteAccount(Customer, "customerId", "customerId");
exports.toggleDriverStatus = wrap(async (req, res) => {
  const driver = await Driver.findById(req.params.driverId);
  if (!driver) throw fail(404, "Driver not found.");
  if (
    driver.isActive &&
    (await Booking.exists({
      driverId: driver._id,
      status: { $in: activeStatuses },
    }))
  )
    throw fail(
      409,
      "Resolve this driver’s active rides before deactivating the account.",
    );
  driver.isActive = !driver.isActive;
  if (!driver.isActive) driver.isAvailable = false;
  await driver.save();
  await User.updateOne({ _id: driver.userId }, { isActive: driver.isActive });
  if (!driver.isActive)
    req.app.get("io").in(`user:${driver.userId}`).disconnectSockets(true);
  req.app.get("io").to("role:admin").emit("driverAvailabilityChanged", {
    driverId: driver._id,
    isAvailable: driver.isAvailable,
    driverName: driver.name,
  });
  res.json({
    message: driver.isActive
      ? "Driver account activated."
      : "Driver account deactivated.",
    driver,
  });
});
exports.clearCompletedBookings = wrap(async (req, res) => {
  const result = await Booking.deleteMany({
    status: { $in: ["completed", "cancelled"] },
  });
  res.json({
    message: "Completed and cancelled rides cleared.",
    deletedCount: result.deletedCount,
  });
});
exports.clearAllBookings = wrap(async (req, res) => {
  if (await Booking.exists({ status: { $in: activeStatuses } }))
    throw fail(
      409,
      "Finish or cancel all active rides before clearing records.",
    );
  const result = await Booking.deleteMany({
    status: { $in: ["completed", "cancelled"] },
  });
  res.json({
    message: "Ride records cleared.",
    deletedCount: result.deletedCount,
  });
});
exports.createCustomer = wrap(async (req, res) => {
  const { profile } = await createAccount(req.body, "customer");
  res.status(201).json({
    message: "Customer created.",
    customer: await profile.populate("userId", "phoneNumber createdAt"),
  });
});
exports.createDriver = wrap(async (req, res) => {
  const { profile } = await createAccount(req.body, "driver");
  res.status(201).json({
    message: "Driver created.",
    driver: await profile.populate("userId", "phoneNumber createdAt"),
  });
});
exports.resetStatistics = wrap(async (req, res) => {
  const stats = await Statistics.getInstance();
  await Statistics.updateOne(
    { _id: stats._id },
    {
      $set: {
        totalBookingsAllTime: 0,
        totalCompletedBookingsAllTime: 0,
        totalCancelledBookingsAllTime: 0,
        totalRevenueAllTime: 0,
        dailyBookings: [],
      },
    },
  );
  res.json({ message: "Statistics reset." });
});
