const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.API_RATE_LIMIT_MAX) || 600,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for creating resources (bookings, customers, drivers)
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 creations per minute
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitizer middleware - strips potential XSS and injection patterns
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj, field = "") => {
    if (typeof obj === "string") {
      if (field === "password" || field === "confirmPassword") return obj;
      // Remove common XSS patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
        .replace(/javascript\s*:/gi, "")
        .replace(/data\s*:\s*text\/html/gi, "")
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Block MongoDB injection operators
        if (
          key.startsWith("$") ||
          key.includes(".") ||
          ["__proto__", "prototype", "constructor"].includes(key)
        )
          continue;
        sanitized[key] = sanitize(value, key);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = { apiLimiter, authLimiter, createLimiter, sanitizeInput };
