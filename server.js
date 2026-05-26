require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");

/* =========================
   APP INIT
========================= */

const app = express();

/* =========================
   ENV CHECK
========================= */

if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing");
    process.exit(1);
}

/* =========================
   DATABASE (Vercel SAFE)
========================= */

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        isConnected = conn.connections[0].readyState;

        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
    }
};

connectDB();

/* =========================
   SECURITY MIDDLEWARE
========================= */

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }
    next();
});

app.use(hpp());

app.use(cookieParser());

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

/* =========================
   LOGGING
========================= */

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

/* =========================
   RATE LIMITING
========================= */

app.use(
    "/api",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            success: false,
            message: "Too many requests, try again later",
        },
    })
);

/* =========================
   SWAGGER JSON
========================= */

const swaggerSpec = require("./swagger");

app.get("/api/v1/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

/* =========================
   SWAGGER UI (CDN FIXED - VERCEL SAFE)
========================= */

app.get("/api/v1/docs", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css">
</head>

<body>
<div id="swagger-ui"></div>

<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>

<script>
window.onload = () => {
  window.ui = SwaggerUIBundle({
    url: "/api/v1/swagger.json",
    dom_id: "#swagger-ui",
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    layout: "BaseLayout"
  });
};
</script>

</body>
</html>
    `);
});

/* =========================
   ROUTES
========================= */

const authRoutes = require("./src/routes/authRoutes");
const classRoutes = require("./src/routes/classRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Attendance API running 🚀",
        docs: "/api/v1/docs",
    });
});

/* =========================
   404 HANDLER
========================= */

const AppError = require("./src/utils/AppError");

app.use((req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

const errorHandler = require("./src/middlewares/errorMiddleware");

app.use(errorHandler);

/* =========================
   EXPORT FOR VERCEL
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on Port ${PORT}...`);
})
module.exports = app;