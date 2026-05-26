const express = require('express');
const router = express.Router();

const {
    createClass,
    joinClass,
    getClasses,
    deleteClass,
} = require('../controllers/classController');

const {
    protect,
    authorize,
} = require('../middlewares/authMiddleware');

/* =========================
   APPLY AUTH MIDDLEWARE
========================= */

// Protect all routes below
router.use(protect);

/* =========================
   CLASS ROUTES
========================= */

/**
 * @swagger
 * /api/v1/classes:
 *   post:
 *     summary: Create a new class
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Computer Science 101
 *               description:
 *                 type: string
 *                 example: Introduction to Computer Science
 *     responses:
 *       201:
 *         description: Class created successfully
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
 *                   example: Class created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can create classes
 */
router.post(
    '/',
    authorize('Teacher'),
    createClass
);

/**
 * @swagger
 * /api/v1/classes/{classId}/join:
 *   post:
 *     summary: Join an existing class
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The class ID to join
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classCode:
 *                 type: string
 *                 example: ABC123
 *     responses:
 *       200:
 *         description: Successfully joined the class
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
 *                   example: Successfully joined the class
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only students can join classes
 *       404:
 *         description: Class not found
 */
router.post(
    '/:classId/join',
    authorize('Student'),
    joinClass
);

/**
 * @swagger
 * /api/v1/classes:
 *   get:
 *     summary: Get all classes for user
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes retrieved successfully
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
 *                   example: Classes retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    authorize('Teacher', 'Student'),
    getClasses
);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The class ID to delete
 *     responses:
 *       200:
 *         description: Class deleted successfully
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
 *                   example: Class deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only teachers can delete classes
 *       404:
 *         description: Class not found
 */
router.delete(
    '/:id',
    authorize('Teacher'),
    deleteClass
);

module.exports = router;