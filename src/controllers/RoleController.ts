/**
 * @file /controllers/RoleController.ts
 * @description Role management controller for RBAC operations
 * @module controllers
 */

import { Request, Response } from 'express';
import { RoleService } from '../services/RoleService';
import { UserRole, Permission } from '../middlewares/auth';
import getLogger from '../utils/logger';

const logger = getLogger('RoleController');

const roleService = RoleService.getInstance();

export class RoleController {
  /**
   * Get all roles (Admin only)
   */
  static async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await roleService.getAllRoles();

      res.status(200).json({
        message: 'Roles retrieved successfully',
        roles,
        count: roles.length
      });

    } catch (error) {
      logger.error(`Error getting all roles: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve roles'
      });
    }
  }

  /**
   * Get role by name (Admin only)
   */
  static async getRoleByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name || !Object.values(UserRole).includes(name as UserRole)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
        });

        return;
      }

      const role = await roleService.getRoleByName(name as UserRole);

      if (!role) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Role not found'
        });

        return;
      }

      res.status(200).json({
        message: 'Role retrieved successfully',
        role
      });

    } catch (error) {
      logger.error(`Error getting role by name: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve role'
      });
    }
  }

  /**
   * Create a new role (Admin only)
   */
  static async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name, permissions } = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Name and permissions array are required'
        });

        return;
      }

      // Validate role name
      if (!Object.values(UserRole).includes(name)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
        });

        return;
      }

      // Validate permissions
      const validPermissions = Object.values(Permission);

      const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p as Permission));

      if (invalidPermissions.length > 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`
        });

        return;
      }

      const newRole = await roleService.createRole({ name, permissions });

      logger.info(`Role created by ${req.user?.username}: ${name}`);

      res.status(201).json({
        message: 'Role created successfully',
        role: newRole
      });

    } catch (error) {
      logger.error(`Error creating role: ${error instanceof Error ? error.message : String(error)}`);

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message
        });

        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create role'
      });
    }
  }

  /**
   * Update role permissions (Admin only)
   */
  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      const { permissions } = req.body;

      if (!name || !Object.values(UserRole).includes(name as UserRole)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
        });

        return;
      }

      if (!permissions || !Array.isArray(permissions)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Permissions array is required'
        });

        return;
      }

      // Validate permissions
      const validPermissions = Object.values(Permission);

      const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p as Permission));

      if (invalidPermissions.length > 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: `Invalid permissions: ${invalidPermissions.join(', ')}`
        });

        return;
      }

      const updatedRole = await roleService.updateRole(name as UserRole, permissions);

      logger.info(`Role updated by ${req.user?.username}: ${name}`);

      res.status(200).json({
        message: 'Role updated successfully',
        role: updatedRole
      });

    } catch (error) {
      logger.error(`Error updating role: ${error instanceof Error ? error.message : String(error)}`);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Role not found'
        });

        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update role'
      });
    }
  }

  /**
   * Delete role (Admin only)
   */
  static async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name || !Object.values(UserRole).includes(name as UserRole)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
        });

        return;
      }

      const deleted = await roleService.deleteRole(name as UserRole);

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Role not found'
        });

        return;
      }

      logger.info(`Role deleted by ${req.user?.username}: ${name}`);

      res.status(200).json({
        message: 'Role deleted successfully'
      });

    } catch (error) {
      logger.error(`Error deleting role: ${error instanceof Error ? error.message : String(error)}`);

      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message
        });

        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete role'
      });
    }
  }

  /**
   * Get permissions for a specific role
   */
  static async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name || !Object.values(UserRole).includes(name as UserRole)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
        });

        return;
      }

      const permissions = await roleService.getRolePermissions(name as UserRole);

      res.status(200).json({
        message: 'Role permissions retrieved successfully',
        role: name,
        permissions
      });

    } catch (error) {
      logger.error(`Error getting role permissions: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve role permissions'
      });
    }
  }

  /**
   * Check if role has specific permission
   */
  static async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      const { permission } = req.query;

      if (!name || !Object.values(UserRole).includes(name as UserRole)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role name. Must be one of: ADMIN, USER, VIEWER'
        });

        return;
      }

      if (!permission || !Object.values(Permission).includes(permission as Permission)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Valid permission parameter is required'
        });

        return;
      }

      const hasPermission = await roleService.hasPermission(name as UserRole, permission as Permission);

      res.status(200).json({
        message: 'Permission check completed',
        role: name,
        permission,
        hasPermission
      });

    } catch (error) {
      logger.error(`Error checking permission: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check permission'
      });
    }
  }
}
