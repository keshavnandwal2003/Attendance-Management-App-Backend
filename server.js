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

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

/* =========================
   VALIDATE ENV VARIABLES
========================= */

if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI environment variable is missing");
    process.exit(1);
}

/* =========================
   EXPRESS APP
========================= */

const app = express();

/* =========================
   DATABASE CONNECTION
========================= */

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("✅ MongoDB already connected");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        isConnected = conn.connections[0].readyState;

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
    }
};

connectDB();

/* =========================
   SECURITY MIDDLEWARE
========================= */

// Helmet
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

// Body Parser
app.use(express.json({ limit: "10kb" }));

// Mongo Sanitize
app.use((req, res, next) => {
    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }

    next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Cookie Parser
app.use(cookieParser());

// CORS
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

// Logging (Development only)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

/* =========================
   RATE LIMITING
========================= */

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests, try again later",
    },
});

app.use("/api", limiter);

/* =========================
   SWAGGER DOCUMENTATION
========================= */

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Attendance Management API",
            version: "1.0.0",
            description:
                "API documentation for Attendance Management System",
        },
        servers: [
            {
                url: process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : "http://localhost:5000",
            },
        ],
    },

    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger JSON
app.get("/api/v1/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// Swagger UI
app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
    })
);

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
    res.status(200).json({
        success: true,
        message: "API is running successfully 🚀",
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
   EXPORT APP FOR VERCEL
========================= */

if (process.env.NODE_ENV !== "production") {
    app.listen(5000, () => {
        console.log("Server running");
    });
}

module.exports = app;