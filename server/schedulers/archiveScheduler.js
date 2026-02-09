const cron = require("node-cron");
const Booking = require("../models/Booking");
const fs = require("fs").promises;
const path = require("path");

/**
 * Automatic monthly archive cleanup
 * Runs on the 1st of each month at 2:00 AM
 * Archives bookings older than 90 days
 */
const startArchiveScheduler = () => {
  // Run at 2:00 AM on the 1st of every month
  // Format: minute hour day-of-month month day-of-week
  cron.schedule("0 2 1 * *", async () => {
    console.log("🗄️  Running automatic monthly archive cleanup...");

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Find archivable bookings
      const bookings = await Booking.find({
        status: { $in: ["completed", "cancelled"] },
        createdAt: { $lt: ninetyDaysAgo },
      })
        .populate("customerId", "name phoneNumber city")
        .populate("driverId", "name contactNumber carType carNumber")
        .sort({ createdAt: -1 })
        .lean();

      if (bookings.length === 0) {
        console.log("ℹ️  No bookings to archive this month");
        return;
      }

      // Create archive data
      const archiveData = {
        exportDate: new Date().toISOString(),
        cutoffDate: ninetyDaysAgo.toISOString(),
        totalBookings: bookings.length,
        bookings: bookings,
        automated: true,
        monthYear: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };

      // Create archives directory if it doesn't exist
      const archivesDir = path.join(__dirname, "..", "archives");
      try {
        await fs.access(archivesDir);
      } catch {
        await fs.mkdir(archivesDir, { recursive: true });
      }

      // Save archive to file
      const filename = `elocab-auto-archive-${new Date().toISOString().split("T")[0]}.json`;
      const filePath = path.join(archivesDir, filename);
      await fs.writeFile(filePath, JSON.stringify(archiveData, null, 2));

      // Delete archived bookings from database
      const result = await Booking.deleteMany({
        status: { $in: ["completed", "cancelled"] },
        createdAt: { $lt: ninetyDaysAgo },
      });

      console.log(`✅ Successfully archived ${result.deletedCount} bookings`);
      console.log(`📦 Archive saved to: ${filePath}`);
      console.log(`💾 Storage freed up`);
    } catch (error) {
      console.error("❌ Error during automatic archive:", error);
    }
  });

  console.log(
    "✅ Archive scheduler started - runs on 1st of every month at 2:00 AM",
  );
};

module.exports = { startArchiveScheduler };
