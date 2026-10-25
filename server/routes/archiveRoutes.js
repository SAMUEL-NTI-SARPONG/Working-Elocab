const express = require("express");
const router = express.Router();
require("../middleware/recordIds")(router);
const {
  getArchivableBookings,
  archiveAndCleanup,
  getArchiveStats,
  getSavedArchives,
  getSavedArchive,
} = require("../controllers/archiveController");
const { protect, admin } = require("../middleware/auth");

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Archive routes
router.get("/stats", getArchiveStats);
router.get("/preview", getArchivableBookings);
router.get("/saved", getSavedArchives);
router.get("/saved/:id", getSavedArchive);
router.post("/execute", archiveAndCleanup);

module.exports = router;
