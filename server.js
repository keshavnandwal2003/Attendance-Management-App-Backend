require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

// Validate required environment variables
if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI environment variable is not defined');
    process.exit(1);
}


// Routes
const authRoutes = require('./src/routes/authRoutes');
const classRoutes = require('./src/routes/classRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');

// Error Handler
const errorHandler = require('./src/middlewares/errorMiddleware');
const AppError = require('./src/utils/AppError');

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   SECURITY MIDDLEWARE
========================= */

// Helmet (secure headers)
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

// Body parser
app.use(express.json({ limit: '10kb' }));

//Mongo Sanitizer
app.use((req, res, next) => {

    if (req.body) {
        req.body = mongoSanitize.sanitize(req.body);
    }

    next();
});

//Hpp
app.use(hpp());

// CORS (secure configuration)
// const allowedOrigins = process.env.CLIENT_URL
//     ? process.env.CLIENT_URL.split(',').map(url => url.trim())
//     : ['http://localhost:3000'];

// app.use(
//     cors({
//         origin: allowedOrigins,
//         credentials: true,
//     })
// );
app.use(cors());

// Cookie Parser
app.use(cookieParser());

// Logging (DEV only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/* =========================
   RATE LIMITING
========================= */

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP
    message: {
        success: false,
        message: 'Too many requests, try again later',
    },
});

// app.use('/api', limiter);

/* =========================
   SWAGGER DOCUMENTATION
========================= */

app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs, {
        swaggerOptions: {
            url: '/api/v1/swagger.json',
        },
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Attendance Management API Docs',
    })
);

app.get('/api/v1/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

/* =========================
   ROUTES
========================= */

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running successfully 🚀',
        docsUrl: '/api/v1/docs',
    });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res, next) => {
    next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   DATABASE CONNECTION
========================= */

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const server = app.listen(PORT, () => {
            console.log(
                `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
            );
            console.log(`📚 API Documentation available at: /api/v1/docs`);
        });

        // Handle graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`${signal} signal received: closing HTTP server`);
            server.close(() => {
                console.log('HTTP server closed');
                mongoose.connection.close(false, () => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err.message);
            server.close(() => process.exit(1));
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err.message);
            process.exit(1);
        });
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

connectDB();