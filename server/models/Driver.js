const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  baseLocation: {
    type: String,
    required: true,
    trim: true,
  },
  carType: {
    type: String,
    required: true,
    enum: [
      "Nissan Caravan",
      "Toyota Hiace",
      "Toyota Voxy",
      "Toyota Vitz",
      "Other",
    ],
    trim: true,
  },
  carNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  numberOfSeats: {
    type: Number,
    required: true,
    min: 2,
    max: 30,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  totalRides: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
driverSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Driver", driverSchema);
