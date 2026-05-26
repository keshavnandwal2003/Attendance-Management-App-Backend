const mongoose = require('mongoose');

/* =========================
   Attendance Session Schema
========================= */

const sessionSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class ID is required'],
            validate: {
                validator: mongoose.Types.ObjectId.isValid,
                message: 'Invalid Class ID',
            },
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Teacher ID is required'],
            validate: {
                validator: mongoose.Types.ObjectId.isValid,
                message: 'Invalid Teacher ID',
            },
        },

        status: {
            type: String,
            enum: {
                values: ['Active', 'Ended'],
                message: 'Status must be Active or Ended',
            },
            default: 'Active',
        },

        date: {
            type: Date,
            default: Date.now,
            validate: {
                validator: function (value) {
                    return value <= new Date();
                },
                message: 'Date cannot be in the future',
            },
        },
    },
    { timestamps: true }
);

/* =========================
   Attendance Record Schema
========================= */

const recordSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendanceSession',
            required: [true, 'Session ID is required'],
            validate: {
                validator: mongoose.Types.ObjectId.isValid,
                message: 'Invalid Session ID',
            },
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
            validate: {
                validator: mongoose.Types.ObjectId.isValid,
                message: 'Invalid Student ID',
            },
        },

        status: {
            type: String,
            required: [true, 'Attendance status is required'],
            enum: {
                values: ['Present', 'Absent'],
                message: 'Status must be Present or Absent',
            },
        },
    },
    { timestamps: true }
);

// Prevent duplicate attendance records
recordSchema.index(
    { sessionId: 1, studentId: 1 },
    { unique: true }
);

module.exports = {
    AttendanceSession: mongoose.model(
        'AttendanceSession',
        sessionSchema
    ),

    AttendanceRecord: mongoose.model(
        'AttendanceRecord',
        recordSchema
    ),
};