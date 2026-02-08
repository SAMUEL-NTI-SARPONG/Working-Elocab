const Booking = require("../models/Booking");

// Get bookings ready for archiving (older than 90 days, completed/cancelled)
exports.getArchivableBookings = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const archivableBookings = await Booking.find({
      status: { $in: ["completed", "cancelled"] },
      createdAt: { $lt: ninetyDaysAgo }
    })
      .populate("customerId", "name phoneNumber city")
      .populate("driverId", "name contactNumber carType carNumber")
      .sort({ createdAt: -1 });

    res.json({
      count: archivableBookings.length,
      bookings: archivableBookings,
      cutoffDate: ninetyDaysAgo
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching archivable bookings", error: error.message });
  }
};

// Export and delete old bookings
exports.archiveAndCleanup = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get bookings to archive
    const bookingsToArchive = await Booking.find({
      status: { $in: ["completed", "cancelled"] },
      createdAt: { $lt: ninetyDaysAgo }
    })
      .populate("customerId", "name phoneNumber city")
      .populate("driverId", "name contactNumber carType carNumber")
      .sort({ createdAt: -1 })
      .lean();

    if (bookingsToArchive.length === 0) {
      return res.json({
        message: "No bookings to archive",
        archived: 0,
        data: null
      });
    }

    // Prepare archive data
    const archiveData = {
      exportDate: new Date().toISOString(),
      cutoffDate: ninetyDaysAgo.toISOString(),
      totalBookings: bookingsToArchive.length,
      bookings: bookingsToArchive
    };

    // Delete from database
    const deleteResult = await Booking.deleteMany({
      status: { $in: ["completed", "cancelled"] },
      createdAt: { $lt: ninetyDaysAgo }
    });

    res.json({
      message: `Successfully archived and deleted ${deleteResult.deletedCount} bookings`,
      archived: deleteResult.deletedCount,
      data: archiveData,
      filename: `elocab-archive-${new Date().toISOString().split('T')[0]}.json`
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error archiving bookings", error: error.message });
  }
};

// Get archive statistics
exports.getArchiveStats = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const archivableCount = await Booking.countDocuments({
      status: { $in: ["completed", "cancelled"] },
      createdAt: { $lt: ninetyDaysAgo }
    });

    const recentCompletedCount = await Booking.countDocuments({
      status: { $in: ["completed", "cancelled"] },
      createdAt: { $gte: ninetyDaysAgo }
    });

    const activeCount = await Booking.countDocuments({
      status: { $nin: ["completed", "cancelled"] }
    });

    res.json({
      archivable: archivableCount,
      recentCompleted: recentCompletedCount,
      active: activeCount,
      cutoffDate: ninetyDaysAgo,
      total: archivableCount + recentCompletedCount + activeCount
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching archive stats", error: error.message });
  }
};
