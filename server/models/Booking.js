const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
  serviceType: {
    type: String,
    enum: ["Dropping", "Hiring"],
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  pickupPoint: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
    max: 30,
    validate: {
      validator: Number.isInteger,
      message: "Passenger count must be a whole number.",
    },
  },
  status: {
    type: String,
    enum: [
      "pending",
      "assigned",
      "accepted",
      "on-the-way",
      "picked-up",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// Update timestamp on save
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
