const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const { AttendanceSession, AttendanceRecord } =
    require('../models/AttendanceSession');

const Class = require('../models/Class');
const AppError = require('../utils/AppError');
const {
    isValidMongoId,
    isValidAttendanceStatus,
} = require('../utils/validators');

/* =========================
   START SESSION
========================= */

exports.startSession = async (req, res, next) => {
    try {
        const { classId } = req.body;

        if (!classId) {
            return next(new AppError('classId is required', 400));
        }

        if (!isValidMongoId(classId)) {
            return next(new AppError('Invalid classId format', 400));
        }

        const targetClass = await Class.findById(classId);

        if (!targetClass) {
            return next(new AppError('Class not found', 404));
        }

        if (targetClass.teacher.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', 403));
        }

        const existingSession = await AttendanceSession.findOne({
            classId,
            status: 'Active',
        });

        if (existingSession) {
            return next(
                new AppError('Active session already exists', 400)
            );
        }

        const session = await AttendanceSession.create({
            classId,
            teacherId: req.user._id,
            status: 'Active',
        });

        res.status(201).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   END SESSION
========================= */

exports.endSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId || !isValidMongoId(sessionId)) {
            return next(new AppError('Invalid sessionId format', 400));
        }

        const session = await AttendanceSession.findById(sessionId);

        if (!session) {
            return next(new AppError('Session not found', 404));
        }

        if (session.teacherId.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', 403));
        }

        if (session.status === 'Ended') {
            return next(
                new AppError('Session already ended', 400)
            );
        }

        session.status = 'Ended';
        await session.save();

        res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   MARK ATTENDANCE
========================= */

exports.markAttendance = async (req, res, next) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return next(new AppError('sessionId required', 400));
        }

        if (!isValidMongoId(sessionId)) {
            return next(new AppError('Invalid sessionId format', 400));
        }

        const session = await AttendanceSession.findById(sessionId);

        if (!session || session.status !== 'Active') {
            return next(new AppError('Session not active', 400));
        }

        const targetClass = await Class.findById(session.classId);

        if (!targetClass) {
            return next(new AppError('Class not found', 404));
        }

        const isEnrolled = targetClass.students.some((id) =>
            id.equals(req.user._id)
        );

        if (!isEnrolled) {
            return next(
                new AppError('Not enrolled in this class', 403)
            );
        }

        const existingRecord = await AttendanceRecord.findOne({
            sessionId,
            studentId: req.user._id,
        });

        if (existingRecord) {
            return next(
                new AppError('Already marked attendance', 400)
            );
        }

        const record = await AttendanceRecord.create({
            sessionId,
            studentId: req.user._id,
            status: 'Present',
        });

        res.status(201).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   MANUAL OVERRIDE
========================= */

exports.manualOverride = async (req, res, next) => {
    try {
        const { sessionId, studentId, status } = req.body;

        if (!sessionId || !studentId || !status) {
            return next(new AppError('Missing required fields', 400));
        }

        if (!isValidMongoId(sessionId)) {
            return next(new AppError('Invalid sessionId format', 400));
        }

        if (!isValidMongoId(studentId)) {
            return next(new AppError('Invalid studentId format', 400));
        }

        if (!isValidAttendanceStatus(status)) {
            return next(new AppError('Status must be Present or Absent', 400));
        }

        const session = await AttendanceSession.findById(sessionId);

        if (!session) {
            return next(new AppError('Session not found', 404));
        }

        if (session.teacherId.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', 403));
        }

        const record = await AttendanceRecord.findOneAndUpdate(
            { sessionId, studentId },
            { status },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   GET REPORTS
========================= */

exports.getReports = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const { format } = req.query;

        if (!classId || !isValidMongoId(classId)) {
            return next(new AppError('Invalid classId format', 400));
        }

        const targetClass = await Class.findById(classId);

        if (!targetClass) {
            return next(new AppError('Class not found', 404));
        }

        if (targetClass.teacher.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized to view this class reports', 403));
        }

        const sessions = await AttendanceSession.find({ classId }).lean();

        const sessionIds = sessions.map((s) => s._id);

        const records = await AttendanceRecord.find({
            sessionId: { $in: sessionIds },
        })
            .populate('studentId', 'name email')
            .populate('sessionId', 'date')
            .lean();

        const formattedData = records.map((record) => ({
            studentName: record.studentId?.name || 'Unknown',
            studentEmail: record.studentId?.email || 'N/A',
            date: record.sessionId?.date ? new Date(record.sessionId.date).toISOString() : 'N/A',
            status: record.status,
        }));

        // ================= CSV EXPORT =================
        if (format === 'csv') {
            const fields = [
                'studentName',
                'studentEmail',
                'date',
                'status',
            ];

            try {
                const json2csv = new Parser({ fields });
                const csv = json2csv.parse(formattedData);

                res.header('Content-Type', 'text/csv');
                res.attachment('attendance-report.csv');
                return res.send(csv);
            } catch (csvError) {
                return next(new AppError('Error generating CSV', 500));
            }
        }

        // ================= PDF EXPORT =================
        if (format === 'pdf') {
            try {
                const doc = new PDFDocument();

                res.setHeader(
                    'Content-Type',
                    'application/pdf'
                );

                res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=attendance-report.pdf'
                );

                doc.pipe(res);

                doc.fontSize(18).text('Attendance Report', {
                    align: 'center',
                });

                doc.moveDown();

                formattedData.forEach((item, index) => {
                    doc
                        .fontSize(12)
                        .text(
                            `${index + 1}. ${item.studentName} | ${item.studentEmail
                            } | ${item.status} | ${item.date}`
                        );

                    doc.moveDown(0.5);
                });

                doc.end();

                return;
            } catch (pdfError) {
                return next(new AppError('Error generating PDF', 500));
            }
        }

        // ================= JSON EXPORT =================
        if (!format) {
            return res.status(200).json({
                success: true,
                results: formattedData.length,
                data: formattedData,
            });
        }

        return next(
            new AppError(
                'Invalid format. Use csv, pdf, or omit for JSON',
                400
            )
        );
    } catch (error) {
        next(error);
    }
};