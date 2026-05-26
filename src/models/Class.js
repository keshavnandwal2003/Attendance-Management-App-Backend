const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Class name is required'],
            trim: true,
            minlength: [3, 'Class name must be at least 3 characters'],
            maxlength: [100, 'Class name cannot exceed 100 characters'],
        },

        code: {
            type: String,
            required: [true, 'Class code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [4, 'Class code must be at least 4 characters'],
            maxlength: [10, 'Class code cannot exceed 10 characters'],
            match: [
                /^[A-Z0-9]+$/,
                'Class code can only contain uppercase letters and numbers',
            ],
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Teacher ID is required'],
            validate: {
                validator: mongoose.Types.ObjectId.isValid,
                message: 'Invalid teacher ID',
            },
        },

        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                validate: {
                    validator: mongoose.Types.ObjectId.isValid,
                    message: 'Invalid student ID',
                },
            },
        ],
    },
    { timestamps: true }
);

// Prevent duplicate students
classSchema.path('students').validate(function (students) {
    const uniqueStudents = [...new Set(students.map(String))];
    return uniqueStudents.length === students.length;
}, 'Duplicate students are not allowed');

module.exports = mongoose.model('Class', classSchema);