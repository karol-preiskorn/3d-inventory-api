/**
 * @file /routers/roles.ts
 * @description Role management routes with RBAC
 * @module routers
 */

import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { UserRole } from '../middlewares/auth';
//import getLogger from '../utils/logger';

//const logger = getLogger('role-routes');

const router = Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles (Admin only)
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', requireAuth, requireRole(UserRole.ADMIN), RoleController.getAllRoles);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [admin, user, viewer]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [
 *                     "read:devices", "write:devices", "delete:devices",
 *                     "read:models", "write:models", "delete:models",
 *                     "read:connections", "write:connections", "delete:connections",
 *                     "read:logs", "delete:logs", "admin:access"
 *                   ]
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Role already exists
 */
router.post('/', requireAuth, requireRole(UserRole.ADMIN), RoleController.createRole);

/**
 * @swagger
 * /roles/{name}:
 *   get:
 *     summary: Get role by name (Admin only)
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user, viewer]
 *         description: Role name
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       400:
 *         description: Bad request - invalid role name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Role not found
 */
router.get('/:name', requireAuth, requireRole(UserRole.ADMIN), RoleController.getRoleByName);

/**
 * @swagger
 * /roles/{name}:
 *   put:
 *     summary: Update role permissions (Admin only)
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user, viewer]
 *         description: Role name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [
 *                     "read:devices", "write:devices", "delete:devices",
 *                     "read:models", "write:models", "delete:models",
 *                     "read:connections", "write:connections", "delete:connections",
 *                     "read:logs", "delete:logs", "admin:access"
 *                   ]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Role not found
 */
router.put('/:name', requireAuth, requireRole(UserRole.ADMIN), RoleController.updateRole);

/**
 * @swagger
 * /roles/{name}:
 *   delete:
 *     summary: Delete role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user, viewer]
 *         description: Role name
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Bad request - cannot delete default roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Role not found
 */
router.delete('/:name', requireAuth, requireRole(UserRole.ADMIN), RoleController.deleteRole);

/**
 * @swagger
 * /roles/{name}/permissions:
 *   get:
 *     summary: Get permissions for a specific role
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user, viewer]
 *         description: Role name
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       400:
 *         description: Bad request - invalid role name
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:name/permissions', requireAuth, requireRole(UserRole.ADMIN), RoleController.getRolePermissions);

/**
 * @swagger
 * /roles/{name}/check:
 *   get:
 *     summary: Check if role has specific permission
 *     tags: [Roles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, user, viewer]
 *         description: Role name
 *       - in: query
 *         name: permission
 *         required: true
 *         schema:
 *           type: string
 *           enum: [
 *             "read:devices", "write:devices", "delete:devices",
 *             "read:models", "write:models", "delete:models",
 *             "read:connections", "write:connections", "delete:connections",
 *             "read:logs", "delete:logs", "admin:access"
 *           ]
 *         description: Permission to check
 *     responses:
 *       200:
 *         description: Permission check completed
 *       400:
 *         description: Bad request - invalid role name or permission
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:name/check', requireAuth, requireRole(UserRole.ADMIN), RoleController.checkPermission);

export default router;
