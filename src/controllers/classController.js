const Class = require('../models/Class');
const crypto = require('crypto');
const AppError = require('../utils/AppError');
const { isValidMongoId } = require('../utils/validators');

/* =========================
   CREATE CLASS
========================= */

exports.createClass = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length < 3) {
            return next(new AppError('Class name must be at least 3 characters', 400));
        }

        if (req.user.role !== 'Teacher') {
            return next(new AppError('Only teachers can create classes', 403));
        }

        // Generate unique code with retry safety
        let code;
        let existingClass;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            if (attempts >= maxAttempts) {
                return next(new AppError('Unable to generate unique class code', 500));
            }
            code = crypto.randomBytes(3).toString('hex').toUpperCase();
            existingClass = await Class.findOne({ code });
            attempts++;
        } while (existingClass);

        const newClass = await Class.create({
            name: name.trim(),
            code,
            teacher: req.user._id,
        });

        res.status(201).json({
            success: true,
            data: newClass,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   JOIN CLASS
========================= */

exports.joinClass = async (req, res, next) => {
    try {
        const { classId: code } = req.params;

        if (!code || typeof code !== 'string' || code.trim() === '') {
            return next(new AppError('Class code is required', 400));
        }

        const targetClass = await Class.findOne({ code: code.toUpperCase() });

        if (!targetClass) {
            return next(new AppError('Invalid class code', 404));
        }

        if (req.user.role !== 'Student') {
            return next(new AppError('Only students can join classes', 403));
        }

        const alreadyJoined = targetClass.students.some((id) =>
            id.equals(req.user._id)
        );

        if (alreadyJoined) {
            return next(new AppError('You already joined this class', 400));
        }

        targetClass.students.push(req.user._id);
        await targetClass.save();

        res.status(200).json({
            success: true,
            message: 'Successfully joined class',
            data: targetClass,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   GET CLASSES
========================= */

exports.getClasses = async (req, res, next) => {
    try {
        let classes;

        if (req.user.role === 'Teacher') {
            classes = await Class.find({ teacher: req.user._id })
                .populate('students', 'name email')
                .lean();
        } else {
            classes = await Class.find({ students: req.user._id })
                .populate('teacher', 'name email')
                .lean();
        }

        res.status(200).json({
            success: true,
            results: classes.length,
            data: classes,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   DELETE CLASS
========================= */

exports.deleteClass = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id || !isValidMongoId(id)) {
            return next(new AppError('Invalid class ID format', 400));
        }

        const targetClass = await Class.findById(id);

        if (!targetClass) {
            return next(new AppError('Class not found', 404));
        }

        if (targetClass.teacher.toString() !== req.user._id.toString()) {
            return next(
                new AppError('Not authorized to delete this class', 403)
            );
        }

        await Class.deleteOne({ _id: id });

        res.status(200).json({
            success: true,
            message: 'Class deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};