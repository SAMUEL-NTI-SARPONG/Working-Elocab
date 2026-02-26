const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_assigned",
        "booking_accepted",
        "booking_status",
        "booking_cancelled",
        "booking_completed",
        "driver_assigned",
        "driver_availability",
        "system",
        "welcome",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Auto-delete old notifications (older than 30 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model("Notification", notificationSchema);
