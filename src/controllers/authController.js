const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

/* =========================
   HELPERS
========================= */

const formatUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});

/* =========================
   ACCESS TOKEN
========================= */
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

/* =========================
   REFRESH TOKEN
========================= */
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

/* =========================
   REGISTER
========================= */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return next(new AppError('All fields are required', 400));
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(new AppError('User already exists', 400));
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // STORE refresh token in DB (IMPORTANT FIX)
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                user: formatUser(user),
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Email and password are required', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new AppError('Invalid email or password', 401));
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new AppError('Invalid email or password', 401));
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // UPDATE refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Send refresh token in secure cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            data: {
                user: formatUser(user),
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   LOGOUT
========================= */
exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   REFRESH TOKEN
========================= */
exports.refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return next(new AppError('No refresh token', 401));
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || !user.refreshToken) {
            return next(new AppError('Invalid token', 401));
        }

        // Compare plain token (stored as plain text, not hashed)
        if (token !== user.refreshToken) {
            return next(new AppError('Invalid token', 401));
        }

        // ROTATE TOKENS
        const newAccessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);

        // Store new refresh token as plain text for consistency

        user.refreshToken = newRefreshToken;

        await user.save();

        // Send new cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });

    } catch (error) {
        return next(new AppError('Invalid refresh token', 401));
    }
};

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        res.status(200).json({
            success: true,
            message: 'Password reset link generated',
            resetURL, // remove in production
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return next(new AppError('Password is required', 400));
        }

        // Validate password strength - must match User schema requirements
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
            return next(new AppError('Password must contain uppercase, lowercase, and a number', 400));
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return next(new AppError('Invalid or expired token', 400));
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // IMPORTANT: this triggers bcrypt pre-save hook
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        next(error);
    }
};