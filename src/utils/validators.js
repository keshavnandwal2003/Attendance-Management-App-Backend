/**
 * Input validation utilities for the API
 */

const isValidEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password) => {
    // Must contain uppercase, lowercase, and a number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password) && password.length >= 6;
};

const isValidMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

const isValidClassCode = (code) => {
    return /^[A-Z0-9]{4,10}$/.test(code);
};

const isValidAttendanceStatus = (status) => {
    return ['Present', 'Absent'].includes(status);
};

const isValidSessionStatus = (status) => {
    return ['Active', 'Ended'].includes(status);
};

const isValidRole = (role) => {
    return ['Teacher', 'Student'].includes(role);
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidMongoId,
    isValidClassCode,
    isValidAttendanceStatus,
    isValidSessionStatus,
    isValidRole,
};
