const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const env = require("./config/env");
const routes = require("./routes/index"); // ← All routes: auth, notes, saved, search, admin, years
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const csrfProtection = require("./middleware/csrfProtection");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://studykarle.me",
  "https://www.studykarle.me",
  "https://studykarle.vercel.app",
];
// Merge in the env-driven allowlist (avoids duplicating defaults).
env.corsOrigins.forEach(function (origin) {
  if (allowedOrigins.indexOf(origin) === -1) {
    allowedOrigins.push(origin);
  }
});

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true, // ✅ REQUIRED for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // Expose caching / range headers so pdf.js can do partial (page-by-page)
    // loading and the browser can cache PDF previews across origins.
    exposedHeaders: [
      "Content-Range",
      "Accept-Ranges",
      "Content-Length",
      "ETag",
      "Cache-Control",
      "Last-Modified",
    ],
  })
);

app.options("*", cors());

// gzip/deflate all JSON API responses.
app.use(compression());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!env.isProduction) {
  app.use(morgan("dev"));
}

app.get("/api/health", function (req, res) {
  res.json({
    success: true,
    data: {
      status: "ok",
      env: env.nodeEnv,
    },
  });
});

app.use("/api", csrfProtection); // CSRF: require X-Requested-With on non-GET /api requests
app.use("/api", routes); // ← Mounts ALL routes: /api/auth, /api/notes, /api/admin, etc.

app.use(notFound);
app.use(errorHandler);

module.exports = app;
