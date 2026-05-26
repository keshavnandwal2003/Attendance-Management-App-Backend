const express = require('express');
const router = express.Router();

const {
    startSession,
    endSession,
    markAttendance,
    manualOverride,
    getReports,
} = require('../controllers/attendanceController');

const {
    protect,
    authorize,
} = require('../middlewares/authMiddleware');

/* =========================
   GLOBAL AUTH MIDDLEWARE
========================= */

router.use(protect);

/* =========================
   ATTENDANCE ROUTES
========================= */

/**
 * @swagger
 * /api/v1/attendance/start:
 *   post:
 *     summary: Start an attendance session
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: string
 *                 example: 60d5ec49c1234567890abcde
 *     responses:
 *       201:
 *         description: Attendance session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session started successfully
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceSession'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can start sessions
 */
router.post(
    '/start',
    authorize('Teacher'),
    startSession
);

/**
 * @swagger
 * /api/v1/attendance/end/{sessionId}:
 *   put:
 *     summary: End an attendance session
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to end
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session ended successfully
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceSession'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can end sessions
 *       404:
 *         description: Session not found
 */
router.put(
    '/end/:sessionId',
    authorize('Teacher'),
    endSession
);

/**
 * @swagger
 * /api/v1/attendance/mark:
 *   post:
 *     summary: Mark attendance for a student
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: 60d5ec49c1234567890abcde
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *                 example: present
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attendance marked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session or student not found
 */
router.post(
    '/mark',
    authorize('Student', 'Teacher'),
    markAttendance
);

/**
 * @swagger
 * /api/v1/attendance/override:
 *   post:
 *     summary: Manually override attendance record
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - studentId
 *               - status
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: 60d5ec49c1234567890abcde
 *               studentId:
 *                 type: string
 *                 example: 60d5ec49c1234567890abcdf
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *                 example: present
 *               reason:
 *                 type: string
 *                 example: Medical leave
 *     responses:
 *       200:
 *         description: Attendance override successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attendance updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can override attendance
 *       404:
 *         description: Session or student not found
 */
router.post(
    '/override',
    authorize('Teacher'),
    manualOverride
);

/**
 * @swagger
 * /api/v1/attendance/reports/{classId}:
 *   get:
 *     summary: Get attendance reports for a class
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The class ID to get reports for
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report (YYYY-MM-DD)
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Attendance reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reports generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     classId:
 *                       type: string
 *                     totalSessions:
 *                       type: number
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           presentDays:
 *                             type: number
 *                           absentDays:
 *                             type: number
 *                           lateDays:
 *                             type: number
 *                           attendancePercentage:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can view reports
 *       404:
 *         description: Class not found
 */
router.get(
    '/reports/:classId',
    authorize('Teacher'),
    getReports
);

module.exports = router;