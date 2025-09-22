/**
 * @file /controllers/UserController.ts
 * @description User management controller with RBAC operations
 * @module controllers
 */

import { Request, Response } from 'express';
import { UserRole } from '../middlewares/auth';
import { CreateUserRequest, UpdateUserRequest } from '../models/User';
import { UserService } from '../services/UserService';
//import { RoleService } from '../services/RoleService';
import getLogger from '../utils/logger';

const logger = getLogger('UserController');
const userService = UserService.getInstance();

//const roleService = RoleService.getInstance();

export class UserController {
  /**
   * Create a new user (Admin only)
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;

      // Validate required fields
      if (!userData.username || !userData.email || !userData.password || !userData.role) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: username, email, password, role',
        });

        return;
      }

      // Validate role
      if (!Object.values(UserRole).includes(userData.role)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role. Must be one of: ADMIN, USER, VIEWER',
        });

        return;
      }

      const newUser = await userService.createUser(userData);

      logger.info(`User created by ${req.user?.username}: ${userData.username}`);

      res.status(201).json({
        message: 'User created successfully',
        user: newUser,
      });
    } catch (error) {
      logger.error(`Error creating user: ${error instanceof Error ? error.message : String(error)}`);

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });

        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create user',
      });
    }
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        message: 'Users retrieved successfully',
        users,
        count: users.length,
      });
    } catch (error) {
      logger.error(`Error getting all users: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve users',
      });
    }
  }

  /**
   * Get user by ID (Admin/User can get own profile)
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestingUser = req.user;

      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required',
        });

        return;
      }

      // Check if user can access this profile
      if (requestingUser?.role !== UserRole.ADMIN && requestingUser?.id.toString() !== id) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own profile',
        });

        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });

        return;
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        user,
      });
    } catch (error) {
      logger.error(`Error getting user by ID: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user',
      });
    }
  }

  /**
   * Update user (Admin/User can update own profile)
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;
      const requestingUser = req.user;

      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required',
        });

        return;
      }

      // Check permissions
      const isAdmin = requestingUser?.role === UserRole.ADMIN;
      const isOwnProfile = requestingUser?.id.toString() === id;

      if (!isAdmin && !isOwnProfile) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own profile',
        });

        return;
      }

      // Non-admin users cannot change role
      if (!isAdmin && updateData.role) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Only administrators can change user roles',
        });

        return;
      }

      // Validate role if provided
      if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid role. Must be one of: ADMIN, USER, VIEWER',
        });

        return;
      }

      const updatedUser = await userService.updateUser(id, updateData);

      logger.info(`User updated by ${req.user?.username}: ${updatedUser.username}`);

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      logger.error(`Error updating user: ${error instanceof Error ? error.message : String(error)}`);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });

        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update user',
      });
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required',
        });

        return;
      }

      // Prevent self-deletion
      if (req.user?.id.toString() === id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'You cannot delete your own account',
        });

        return;
      }

      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });

        return;
      }

      logger.info(`User deleted by ${req.user?.username}: ${id}`);

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error(`Error deleting user: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete user',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });

        return;
      }

      const user = await userService.getUserById(userId.toString());

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User profile not found',
        });

        return;
      }

      res.status(200).json({
        message: 'Current user profile retrieved successfully',
        user,
      });
    } catch (error) {
      logger.error(`Error getting current user: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile',
      });
    }
  }

  /**
   * Update current user profile
   */
  static async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const updateData: UpdateUserRequest = req.body;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });

        return;
      }

      // Users cannot change their own role
      if (updateData.role) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You cannot change your own role',
        });

        return;
      }

      const updatedUser = await userService.updateUser(userId.toString(), updateData);

      logger.info(`User profile updated: ${updatedUser.username}`);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      logger.error(`Error updating current user: ${error instanceof Error ? error.message : String(error)}`);

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      });
    }
  }
}
