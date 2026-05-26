/**
 * Request validation middleware
 */

const AppError = require('../utils/AppError');
const {
    isValidEmail,
    isValidPassword,
    isValidMongoId,
} = require('../utils/validators');

// Validate registration input
const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
        return next(new AppError('Name must be at least 3 characters', 400));
    }

    if (!email || !isValidEmail(email)) {
        return next(new AppError('Valid email is required', 400));
    }

    if (!password || !isValidPassword(password)) {
        return next(
            new AppError(
                'Password must be at least 6 characters with uppercase, lowercase, and a number',
                400
            )
        );
    }

    if (!role || !['Teacher', 'Student'].includes(role)) {
        return next(new AppError('Role must be Teacher or Student', 400));
    }

    next();
};

// Validate login input
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
        return next(new AppError('Valid email is required', 400));
    }

    if (!password || password.trim() === '') {
        return next(new AppError('Password is required', 400));
    }

    next();
};

// Validate MongoDB ObjectId
const validateMongoId = (idField) => {
    return (req, res, next) => {
        const id = req.params[idField] || req.body[idField];

        if (!id || !isValidMongoId(id)) {
            return next(new AppError(`Invalid ${idField} format`, 400));
        }

        next();
    };
};

module.exports = {
    validateRegister,
    validateLogin,
    validateMongoId,
};
