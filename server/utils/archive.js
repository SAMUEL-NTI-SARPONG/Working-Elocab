const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const schema = new mongoose.Schema(
  {
    exportDate: Date,
    cutoffDate: Date,
    totalBookings: Number,
    bookings: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true },
);
const Archive = mongoose.models.Archive || mongoose.model("Archive", schema);
const archiveOldBookings = async () => {
  const cutoffDate = new Date(Date.now() - 90 * 86400000);
  const query = {
    status: { $in: ["completed", "cancelled"] },
    createdAt: { $lt: cutoffDate },
  };
  const bookings = await Booking.find(query)
    .populate("customerId", "name phoneNumber city")
    .populate("driverId", "name contactNumber carType carNumber")
    .sort({ createdAt: -1 })
    .lean();
  if (!bookings.length) return { archived: 0, data: null };
  const data = {
    exportDate: new Date(),
    cutoffDate,
    totalBookings: bookings.length,
    bookings,
  };
  // Persist the snapshot before deleting exactly the exported records.
  await Archive.create(data);
  const result = await Booking.deleteMany({
    ...query,
    _id: { $in: bookings.map((b) => b._id) },
  });
  return { archived: result.deletedCount, data };
};
module.exports = { Archive, archiveOldBookings };
