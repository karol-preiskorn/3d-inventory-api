/**
 * @file /routers/user-management.ts
 * @description User management routes with RBAC
 * @module routers
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { UserRole } from '../middlewares/auth';
//import getLogger from '../utils/logger';

// const logger = getLogger('user-management-routes');

const router = Router();

/**
 * @swagger
 * /user-management:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [admin, user, viewer]
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - User already exists
 */
router.post('/', requireAuth, requireRole(UserRole.ADMIN), UserController.createUser);

/**
 * @swagger
 * /user-management:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User Management]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', requireAuth, requireRole(UserRole.ADMIN), UserController.getAllUsers);

/**
 * @swagger
 * /user-management/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Management]
 *     security:
 *       - UserAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User profile not found
 */
router.get('/me', requireAuth, UserController.getCurrentUser);

/**
 * @swagger
 * /user-management/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [User Management]
 *     security:
 *       - UserAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot change own role
 */
router.put('/me', requireAuth, UserController.updateCurrentUser);

/**
 * @swagger
 * /user-management/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User Management]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own profile or admin required
 *       404:
 *         description: User not found
 */
router.get('/:id', requireAuth, UserController.getUserById);

/**
 * @swagger
 * /user-management/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [User Management]
 *     security:
 *       - UserAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [admin, user, viewer]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own profile or admin required
 *       404:
 *         description: User not found
 */
router.put('/:id', requireAuth, UserController.updateUser);

/**
 * @swagger
 * /user-management/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [User Management]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request - Cannot delete own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/:id', requireAuth, requireRole(UserRole.ADMIN), UserController.deleteUser);

export default router;
