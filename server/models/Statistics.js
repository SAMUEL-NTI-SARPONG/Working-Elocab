const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    singletonKey: { type: String, unique: true, sparse: true },
    totalBookingsAllTime: { type: Number, default: 0 },
    totalCompletedBookingsAllTime: { type: Number, default: 0 },
    totalCancelledBookingsAllTime: { type: Number, default: 0 },
    totalRevenueAllTime: { type: Number, default: 0 },
    dailyBookings: [
      {
        date: { type: Date, required: true },
        bookingCount: { type: Number, default: 0 },
        completedCount: { type: Number, default: 0 },
        cancelledCount: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
schema.statics.getInstance = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  try {
    return await this.findOneAndUpdate(
      { singletonKey: "global" },
      { $setOnInsert: { singletonKey: "global" } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (e) {
    if (e.code !== 11000) throw e;
    return this.findOne({ singletonKey: "global" });
  }
};
async function record(lifetimeKey, dailyKey, amount = 0) {
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const Model = this.constructor;
  await Model.updateOne(
    { _id: this._id, "dailyBookings.date": { $ne: day } },
    {
      $push: {
        dailyBookings: {
          date: day,
          bookingCount: 0,
          completedCount: 0,
          cancelledCount: 0,
          revenue: 0,
        },
      },
    },
  );
  const increments = { [lifetimeKey]: 1, [`dailyBookings.$.${dailyKey}`]: 1 };
  if (amount) {
    increments.totalRevenueAllTime = amount;
    increments["dailyBookings.$.revenue"] = amount;
  }
  await Model.updateOne(
    { _id: this._id, "dailyBookings.date": day },
    { $inc: increments, $set: { lastUpdated: new Date() } },
  );
}
schema.methods.incrementBooking = function () {
  return record.call(this, "totalBookingsAllTime", "bookingCount");
};
schema.methods.recordCompleted = function (amount = 0) {
  return record.call(
    this,
    "totalCompletedBookingsAllTime",
    "completedCount",
    amount,
  );
};
schema.methods.recordCancelled = function () {
  return record.call(this, "totalCancelledBookingsAllTime", "cancelledCount");
};
module.exports = mongoose.model("Statistics", schema);
