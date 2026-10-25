const Booking = require("../models/Booking");
const { archiveOldBookings, Archive } = require("../utils/archive");
const { sendError } = require("../utils/errors");
const query = () => ({
  status: { $in: ["completed", "cancelled"] },
  createdAt: { $lt: new Date(Date.now() - 90 * 86400000) },
});
exports.getArchivableBookings = async (req, res) => {
  try {
    const filter = query();
    const bookings = await Booking.find(filter)
      .populate("customerId", "name phoneNumber city")
      .populate("driverId", "name contactNumber carType carNumber");
    res.json({
      count: bookings.length,
      bookings,
      cutoffDate: filter.createdAt.$lt,
    });
  } catch (e) {
    sendError(res, e);
  }
};
exports.archiveAndCleanup = async (req, res) => {
  try {
    const result = await archiveOldBookings();
    res.json({
      ...result,
      message: result.archived
        ? "Archive saved. Download your copy below."
        : "No bookings are ready for archiving.",
      filename: `elocab-archive-${new Date().toISOString().slice(0, 10)}.json`,
    });
  } catch (e) {
    sendError(res, e);
  }
};
exports.getArchiveStats = async (req, res) => {
  try {
    const filter = query();
    const [archivable, recentCompleted, active] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.countDocuments({
        status: filter.status,
        createdAt: { $gte: filter.createdAt.$lt },
      }),
      Booking.countDocuments({ status: { $nin: ["completed", "cancelled"] } }),
    ]);
    res.json({
      archivable,
      recentCompleted,
      active,
      cutoffDate: filter.createdAt.$lt,
      total: archivable + recentCompleted + active,
    });
  } catch (e) {
    sendError(res, e);
  }
};
exports.getSavedArchives = async (req, res) => {
  try {
    res.json(
      await Archive.find()
        .select("exportDate totalBookings")
        .sort({ exportDate: -1 }),
    );
  } catch (e) {
    sendError(res, e);
  }
};
exports.getSavedArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive)
      return res.status(404).json({ message: "Archive not found." });
    res.json(archive);
  } catch (e) {
    sendError(res, e);
  }
};
