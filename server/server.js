const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const { startArchiveScheduler } = require("./schedulers/archiveScheduler");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const driverRoutes = require("./routes/driverRoutes");
const customerRoutes = require("./routes/customerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const archiveRoutes = require("./routes/archiveRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const {
  apiLimiter,
  authLimiter,
  sanitizeInput,
} = require("./middleware/security");

const app = express();
const server = http.createServer(app);

// CORS origin configuration
const getAllowedOrigins = () => {
  const origins = [];
  if (process.env.CLIENT_URL) {
    // Support comma-separated origins for multiple deployments
    process.env.CLIENT_URL.split(",").forEach((url) =>
      origins.push(url.trim()),
    );
  }
  return origins;
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowed = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, curl, Vercel proxy, etc.)
    if (!origin || allowed.length === 0 || allowed.includes(origin)) {
      callback(null, true);
    } else {
      // In production, allow all origins to prevent misconfiguration blocks
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: corsOptions,
});

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(sanitizeInput);
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Make io accessible to routes
app.set("io", io);

// ===== MongoDB Connection (cached for Vercel serverless) =====
let isConnected = false;
let connectionPromise = null;

// Enable buffering with timeout so queries queue while connecting instead of failing immediately
mongoose.set("bufferCommands", true);
mongoose.set("bufferTimeoutMS", 20000);

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  // If disconnecting, wait a moment
  if (mongoose.connection.readyState === 3) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // If a connection attempt is already in progress, wait for it
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  connectionPromise = (async () => {
    try {
      const db = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 15000,
        heartbeatFrequencyMS: 10000,
      });
      isConnected = db.connections[0].readyState === 1;
      console.log("✅ MongoDB Connected Successfully");

      // Drop legacy unique index on email if it exists (migrated to phoneNumber)
      try {
        const userCollection = db.connection.collection("users");
        const indexes = await userCollection.indexes();
        const emailIndex = indexes.find((idx) => idx.key && idx.key.email);
        if (emailIndex) {
          await userCollection.dropIndex(emailIndex.name);
          console.log("✅ Dropped legacy email index");
        }
      } catch (indexErr) {
        // Index may not exist, ignore
      }

      startArchiveScheduler();
    } catch (err) {
      console.error("❌ MongoDB Connection Error:", err.message);
      isConnected = false;
    } finally {
      connectionPromise = null;
    }
  })();

  await connectionPromise;
};

// Handle connection state changes
mongoose.connection.on("connected", () => {
  isConnected = true;
});
mongoose.connection.on("disconnected", () => {
  isConnected = false;
});
mongoose.connection.on("error", () => {
  isConnected = false;
});

// Connect on startup (non-blocking for serverless)
connectDB();

// ===== Routes that do NOT need database =====

// Root route - API homepage
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚗 ELOCAB API Server",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      auth: "/api/auth",
      customers: "/api/customers",
      drivers: "/api/drivers",
      bookings: "/api/bookings",
      admin: "/api/admin",
      health: "/api/health",
    },
    documentation: "Visit https://github.com/SAMUEL-NTI-SARPONG/Working-Elocab",
    timestamp: new Date().toISOString(),
  });
});

// Health check route (no DB needed)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ELOCAB API is running",
    dbConnected: isConnected,
    timestamp: new Date().toISOString(),
  });
});

// ===== Middleware to ensure DB connection before API routes =====
app.use("/api", async (req, res, next) => {
  // Skip DB check for health endpoint
  if (req.path === "/health") return next();

  try {
    // If already connected, proceed immediately
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return next();
    }

    // Attempt connection (will reuse cached promise if in progress)
    await connectDB();

    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return next();
    }

    // Retry with increasing delays (up to 3 attempts)
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`⏳ DB retry attempt ${attempt}...`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      await connectDB();

      if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return next();
      }
    }

    return res.status(503).json({
      success: false,
      message:
        "Database is temporarily unavailable. Please try again in a moment.",
    });
  } catch (err) {
    console.error("DB connection middleware error:", err.message);

    // Even on error, if bufferCommands is enabled and connection is in progress, let it through
    if (mongoose.connection.readyState === 2) {
      return next();
    }

    res.status(503).json({
      success: false,
      message: "Database connection error. Please try again.",
    });
  }
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // User joins with their ID
  socket.on("join", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make connectedUsers accessible globally
global.connectedUsers = connectedUsers;

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/archive", archiveRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server only when NOT running on Vercel serverless
const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
  server.listen(PORT, () => {
    console.log(`🚗 ELOCAB Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel serverless
module.exports = app;
