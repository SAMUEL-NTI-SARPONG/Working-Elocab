const mongoose = require("mongoose");

const statisticsSchema = new mongoose.Schema(
  {
    // Lifetime counters that persist even after data deletion
    totalBookingsAllTime: {
      type: Number,
      default: 0,
    },
    totalCompletedBookingsAllTime: {
      type: Number,
      default: 0,
    },
    totalCancelledBookingsAllTime: {
      type: Number,
      default: 0,
    },
    totalRevenueAllTime: {
      type: Number,
      default: 0,
    },
    
    // Daily booking statistics
    dailyBookings: [
      {
        date: {
          type: Date,
          required: true,
        },
        bookingCount: {
          type: Number,
          default: 0,
        },
        completedCount: {
          type: Number,
          default: 0,
        },
        cancelledCount: {
          type: Number,
          default: 0,
        },
        revenue: {
          type: Number,
          default: 0,
        },
      },
    ],
    
    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one statistics document exists (singleton pattern)
statisticsSchema.statics.getInstance = async function () {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

// Method to increment booking count
statisticsSchema.methods.incrementBooking = async function (totalAmount = 0) {
  this.totalBookingsAllTime += 1;
  
  // Update daily statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyStat = this.dailyBookings.find(
    (stat) => stat.date.getTime() === today.getTime()
  );
  
  if (dailyStat) {
    dailyStat.bookingCount += 1;
  } else {
    this.dailyBookings.push({
      date: today,
      bookingCount: 1,
      completedCount: 0,
      cancelledCount: 0,
      revenue: 0,
    });
  }
  
  this.lastUpdated = Date.now();
  await this.save();
};

// Method to record completed booking
statisticsSchema.methods.recordCompleted = async function (totalAmount = 0) {
  this.totalCompletedBookingsAllTime += 1;
  this.totalRevenueAllTime += totalAmount;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyStat = this.dailyBookings.find(
    (stat) => stat.date.getTime() === today.getTime()
  );
  
  if (dailyStat) {
    dailyStat.completedCount += 1;
    dailyStat.revenue += totalAmount;
  }
  
  this.lastUpdated = Date.now();
  await this.save();
};

// Method to record cancelled booking
statisticsSchema.methods.recordCancelled = async function () {
  this.totalCancelledBookingsAllTime += 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyStat = this.dailyBookings.find(
    (stat) => stat.date.getTime() === today.getTime()
  );
  
  if (dailyStat) {
    dailyStat.cancelledCount += 1;
  }
  
  this.lastUpdated = Date.now();
  await this.save();
};

module.exports = mongoose.model("Statistics", statisticsSchema);
