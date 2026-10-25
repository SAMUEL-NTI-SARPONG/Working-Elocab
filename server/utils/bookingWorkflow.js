const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Driver = require("../models/Driver");
const User = require("../models/User");
const Statistics = require("../models/Statistics");
const { createNotification } = require("../controllers/notificationController");
const { fail } = require("./errors");
const transitions = {
  pending: ["cancelled"],
  assigned: ["accepted", "cancelled"],
  accepted: ["on-the-way", "cancelled"],
  "on-the-way": ["picked-up", "cancelled"],
  "picked-up": ["completed"],
  completed: [],
  cancelled: [],
};
const notifyBooking = async (req, event, booking) => {
  const full = await Booking.findById(booking._id)
    .populate("customerId", "name phoneNumber city digitalAddress")
    .populate("driverId", "name contactNumber carType carNumber");
  const customer = await Customer.findById(booking.customerId);
  const driver = booking.driverId
    ? await Driver.findById(booking.driverId)
    : null;
  const io = req.app.get("io");
  let audience = io.to("role:admin");
  if (customer) audience = audience.to(`user:${customer.userId}`);
  if (driver) audience = audience.to(`user:${driver.userId}`);
  audience.emit(event, full);
  if (event === "bookingAssigned" && driver)
    io.to(`user:${driver.userId}`).emit("newAssignment", full);
  const type =
    booking.status === "completed"
      ? "booking_completed"
      : booking.status === "cancelled"
        ? "booking_cancelled"
        : "booking_status";
  const message = `${booking.pickupPoint} → ${booking.destination}: ${booking.status.replaceAll("-", " ")}.`;
  const admins = await User.find({ role: "admin", isActive: true }).select(
    "_id",
  );
  const users = new Set([
    ...admins.map((a) => String(a._id)),
    ...(customer ? [String(customer.userId)] : []),
    ...(driver ? [String(driver.userId)] : []),
  ]);
  await Promise.all(
    [...users].map((id) =>
      createNotification(
        id,
        type,
        booking.status === "pending" ? "Ride request received" : "Ride updated",
        message,
        { bookingId: booking._id },
      ),
    ),
  );
  return full;
};
const transitionBooking = async (req, booking, status) => {
  if (!transitions[booking.status]?.includes(status))
    throw fail(
      409,
      `Cannot change a ${booking.status.replaceAll("-", " ")} ride to ${String(status).replaceAll("-", " ")}.`,
    );
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: booking.status },
    {
      $set: {
        status,
        updatedAt: new Date(),
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw fail(409, "This ride changed. Refresh and try again.");
  const stats = await Statistics.getInstance();
  if (status === "completed") {
    await stats.recordCompleted(0);
    if (updated.driverId)
      await Driver.updateOne(
        { _id: updated.driverId },
        { $inc: { totalRides: 1 } },
      );
  }
  if (status === "cancelled") await stats.recordCancelled();
  return notifyBooking(
    req,
    status === "cancelled" ? "bookingCancelled" : "bookingUpdated",
    updated,
  );
};
module.exports = { transitions, transitionBooking, notifyBooking };
