const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Statistics = require("../models/Statistics");
const User = require("../models/User");
const { requirePhone } = require("../utils/accounts");
const { fail, sendError } = require("../utils/errors");
const {
  notifyBooking,
  transitionBooking,
} = require("../utils/bookingWorkflow");
const profile = async (req) => {
  const result = await Customer.findOne({ userId: req.user._id });
  if (!result) throw fail(404, "Customer profile not found.");
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
    const customer = await profile(req);
    const previousPhone = req.user.phoneNumber;
    for (const key of ["name", "digitalAddress", "city"])
      if (req.body[key] !== undefined) customer[key] = req.body[key];
    if (req.body.phoneNumber !== undefined)
      customer.phoneNumber = requirePhone(req.body.phoneNumber);
    await customer.validate();
    await User.updateOne(
      { _id: req.user._id },
      { $set: { phoneNumber: customer.phoneNumber } },
      { runValidators: true },
    );
    try {
      await customer.save();
    } catch (e) {
      await User.updateOne(
        { _id: req.user._id },
        { phoneNumber: previousPhone },
      );
      throw e;
    }
    res.json(customer);
  } catch (e) {
    sendError(res, e);
  }
};
exports.createBooking = async (req, res) => {
  try {
    const customer = await profile(req);
    const {
      serviceType,
      dateTime,
      pickupPoint,
      destination,
      numberOfPeople,
      notes = "",
    } = req.body;
    if (!["Dropping", "Hiring"].includes(serviceType))
      throw fail(400, "Choose dropping or hiring.");
    if (
      !dateTime ||
      !Number.isFinite(new Date(dateTime).getTime()) ||
      new Date(dateTime) < new Date(Date.now() - 60000)
    )
      throw fail(400, "Choose a date and time in the future.");
    if (
      typeof pickupPoint !== "string" ||
      !pickupPoint.trim() ||
      typeof destination !== "string" ||
      !destination.trim()
    )
      throw fail(400, "Enter a pickup point and destination.");
    if (
      !Number.isInteger(Number(numberOfPeople)) ||
      Number(numberOfPeople) < 1 ||
      Number(numberOfPeople) > 30
    )
      throw fail(400, "Choose between 1 and 30 passengers.");
    if (typeof notes !== "string" || notes.length > 1000)
      throw fail(400, "Keep notes to 1,000 characters.");
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
    await (await Statistics.getInstance()).incrementBooking();
    await Customer.updateOne(
      { _id: customer._id },
      { $inc: { totalBookings: 1 } },
    );
    res.status(201).json(await notifyBooking(req, "newBooking", booking));
  } catch (e) {
    sendError(res, e);
  }
};
exports.getMyBookings = async (req, res) => {
  try {
    const customer = await profile(req);
    res.json(
      await Booking.find({ customerId: customer._id })
        .populate("driverId", "name contactNumber carType carNumber")
        .sort({ createdAt: -1 }),
    );
  } catch (e) {
    sendError(res, e);
  }
};
const ownBooking = async (req) => {
  const customer = await profile(req);
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw fail(404, "Booking not found.");
  if (String(booking.customerId) !== String(customer._id))
    throw fail(403, "You cannot access this booking.");
  return booking;
};
exports.getBookingById = async (req, res) => {
  try {
    res.json(
      await (
        await ownBooking(req)
      ).populate("driverId", "name contactNumber carType carNumber"),
    );
  } catch (e) {
    sendError(res, e);
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    res.json(await transitionBooking(req, await ownBooking(req), "cancelled"));
  } catch (e) {
    sendError(res, e);
  }
};
