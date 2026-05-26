const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/* =====================================
   PROTECT MIDDLEWARE (CLEAN VERSION)
===================================== */

const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token safely
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('No token provided', 401));
        }

        // Verify token (errors handled globally)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        req.user = user;
        next();

    } catch (error) {
        // ONLY pass error to global handler
        next(error);
    }
};

/* =====================================
   ROLE AUTHORIZATION
===================================== */

const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('Unauthorized access', 401));
            }

            const userRole = req.user.role?.toLowerCase();
            const allowedRoles = roles.map(r => r.toLowerCase());

            if (!allowedRoles.includes(userRole)) {
                return next(
                    new AppError(
                        `Role '${req.user.role}' is not authorized`,
                        403
                    )
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    protect,
    authorize,
};