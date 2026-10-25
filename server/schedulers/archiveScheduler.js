const cron = require("node-cron");
const { archiveOldBookings } = require("../utils/archive");
let task;
const startArchiveScheduler = () => {
  if (task) return task;
  task = cron.schedule(
    "0 2 1 * *",
    async () => {
      try {
        const result = await archiveOldBookings();
        console.log("Archived bookings:", result.archived);
      } catch (error) {
        console.error("Archive failed:", error.name);
      }
    },
    { timezone: "Africa/Accra" },
  );
  return task;
};
module.exports = { startArchiveScheduler };
