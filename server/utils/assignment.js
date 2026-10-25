const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const User = require("../models/User");
const { fail } = require("./errors");

// Touching the same driver inside the transaction serializes competing assignments.
// A retry sees the other committed booking, preventing the overlap-check race.
module.exports = async function assignDriver(bookingId, driverId) {
  const session = await mongoose.startSession();
  let assigned;
  try {
    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);
      if (!booking) throw fail(404, "Booking not found.");
      if (!["pending", "assigned"].includes(booking.status))
        throw fail(409, "Only pending or assigned rides can be assigned.");
      const driver = await Driver.findOneAndUpdate(
        { _id: driverId, isActive: true, isAvailable: true },
        { $inc: { assignmentVersion: 1 } },
        { new: true, session },
      );
      if (
        !driver ||
        !(await User.exists({ _id: driver.userId, isActive: true }).session(
          session,
        ))
      )
        throw fail(409, "Choose an active driver who is online.");
      if (driver.numberOfSeats < booking.numberOfPeople)
        throw fail(400, "This vehicle does not have enough passenger seats.");
      const overlap = await Booking.exists({
        _id: { $ne: booking._id },
        driverId,
        status: { $in: ["assigned", "accepted", "on-the-way", "picked-up"] },
        dateTime: {
          $gte: new Date(booking.dateTime.getTime() - 3600000),
          $lte: new Date(booking.dateTime.getTime() + 3600000),
        },
      }).session(session);
      if (overlap)
        throw fail(
          409,
          "This driver has another ride within an hour of this booking.",
        );
      assigned = await Booking.findOneAndUpdate(
        { _id: booking._id, status: booking.status },
        { $set: { driverId, status: "assigned", updatedAt: new Date() } },
        { new: true, runValidators: true, session },
      );
      if (!assigned)
        throw fail(409, "This ride changed. Refresh and try again.");
    });
    return assigned;
  } finally {
    await session.endSession();
  }
};
