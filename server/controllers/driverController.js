const Driver = require("../models/Driver");
const Booking = require("../models/Booking");
const { fail, sendError } = require("../utils/errors");
const { requirePhone } = require("../utils/accounts");
const { transitionBooking } = require("../utils/bookingWorkflow");
const profile = async (req) => {
  const result = await Driver.findOne({ userId: req.user._id });
  if (!result) throw fail(404, "Driver profile not found.");
  return result;
};
exports.getProfile = async (req, res) => {
  try {
    res.json(await profile(req));
  } catch (e) {
    sendError(res, e);
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const driver = await profile(req);
    for (const key of [
      "name",
      "baseLocation",
      "carType",
      "carNumber",
      "licenseNumber",
      "numberOfSeats",
    ])
      if (req.body[key] !== undefined) driver[key] = req.body[key];
    if (req.body.contactNumber !== undefined)
      driver.contactNumber = requirePhone(req.body.contactNumber);
    await driver.save();
    res.json(driver);
  } catch (e) {
    sendError(res, e);
  }
};
exports.toggleAvailability = async (req, res) => {
  try {
    const driver = await profile(req);
    if (!driver.isActive) throw fail(403, "Your driver account is inactive.");
    driver.isAvailable = !driver.isAvailable;
    await driver.save();
    req.app.get("io").to("role:admin").emit("driverAvailabilityChanged", {
      driverId: driver._id,
      isAvailable: driver.isAvailable,
      driverName: driver.name,
    });
    res.json({ isAvailable: driver.isAvailable });
  } catch (e) {
    sendError(res, e);
  }
};
exports.getMyBookings = async (req, res) => {
  try {
    const driver = await profile(req);
    res.json(
      await Booking.find({ driverId: driver._id })
        .populate("customerId", "name phoneNumber")
        .populate("driverId", "name contactNumber carType carNumber")
        .sort({ createdAt: -1 }),
    );
  } catch (e) {
    sendError(res, e);
  }
};
const changeStatus = async (req, res, status) => {
  try {
    const driver = await profile(req);
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) throw fail(404, "Booking not found.");
    if (!booking.driverId || String(booking.driverId) !== String(driver._id))
      throw fail(403, "This ride is not assigned to you.");
    res.json(await transitionBooking(req, booking, status));
  } catch (e) {
    sendError(res, e);
  }
};
exports.acceptBooking = (req, res) => changeStatus(req, res, "accepted");
exports.updateBookingStatus = (req, res) =>
  changeStatus(req, res, req.body.status);
