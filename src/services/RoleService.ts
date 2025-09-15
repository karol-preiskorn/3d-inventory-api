/**
 * @file /services/RoleService.ts
 * @description Role service for MongoDB operations and role management
 * @module services
 */

import { Collection, Db, MongoClient } from 'mongodb';
import { Role, RoleResponse, toRoleResponse, DEFAULT_ROLES } from '../models/Role';
import { UserRole, Permission } from '../middlewares/auth';
import { connectToCluster, connectToDb, closeConnection } from '../utils/db';
import getLogger from '../utils/logger';

const logger = getLogger('RoleService');

const COLLECTION_NAME = 'roles';

export class RoleService {
  private static instance: RoleService;

  private constructor() { }

  public static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }

    return RoleService.instance;
  }

  /**
   * Create a new role
   */
  async createRole(roleData: { name: UserRole; permissions: Permission[] }): Promise<RoleResponse> {
    let client: MongoClient | null = null;

    try {
      client = await connectToCluster();
      const db: Db = connectToDb(client);

      const collection: Collection<Role> = db.collection(COLLECTION_NAME);

      // Check if role already exists
      const existingRole = await collection.findOne({ name: roleData.name });

      if (existingRole) {
        throw new Error(`Role ${roleData.name} already exists`);
      }

      const newRole: Omit<Role, '_id'> = {
        name: roleData.name,
        displayName: roleData.name.charAt(0).toUpperCase() + roleData.name.slice(1),
        description: `${roleData.name} role with specific permissions`,
        permissions: roleData.permissions,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newRole as Role);

      if (!result.insertedId) {
        throw new Error('Failed to create role');
      }

      const createdRole = await collection.findOne({ _id: result.insertedId });

      if (!createdRole) {
        throw new Error('Failed to retrieve created role');
      }

      logger.info(`Role created successfully: ${roleData.name}`);

      return toRoleResponse(createdRole);

    } catch (error) {
      logger.error(`Error creating role: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: UserRole): Promise<RoleResponse | null> {
    let client: MongoClient | null = null;

    try {
      client = await connectToCluster();
      const db: Db = connectToDb(client);

      const collection: Collection<Role> = db.collection(COLLECTION_NAME);

      const role = await collection.findOne({ name });

      return role ? toRoleResponse(role) : null;

    } catch (error) {
      logger.error(`Error getting role by name: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<RoleResponse[]> {
    let client: MongoClient | null = null;

    try {
      client = await connectToCluster();
      const db: Db = connectToDb(client);

      const collection: Collection<Role> = db.collection(COLLECTION_NAME);

      const roles = await collection.find({}).toArray();

      return roles.map(toRoleResponse);

    } catch (error) {
      logger.error(`Error getting all roles: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Update role permissions
   */
  async updateRole(name: UserRole, permissions: Permission[]): Promise<RoleResponse> {
    let client: MongoClient | null = null;

    try {
      client = await connectToCluster();
      const db: Db = connectToDb(client);

      const collection: Collection<Role> = db.collection(COLLECTION_NAME);

      const result = await collection.findOneAndUpdate(
        { name },
        {
          $set: {
            permissions,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new Error('Role not found or update failed');
      }

      logger.info(`Role updated successfully: ${name}`);

      return toRoleResponse(result);

    } catch (error) {
      logger.error(`Error updating role: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Delete role
   */
  async deleteRole(name: UserRole): Promise<boolean> {
    let client: MongoClient | null = null;

    try {
      // Prevent deletion of default roles
      if (Object.values(UserRole).includes(name)) {
        throw new Error('Cannot delete default system roles');
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);

      const collection: Collection<Role> = db.collection(COLLECTION_NAME);

      const result = await collection.deleteOne({ name });

      if (result.deletedCount === 1) {
        logger.info(`Role deleted successfully: ${name}`);

        return true;
      }

      return false;

    } catch (error) {
      logger.error(`Error deleting role: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Initialize default roles (for first-time setup)
   */
  async initializeDefaultRoles(): Promise<void> {
    try {
      for (const [roleName, roleData] of Object.entries(DEFAULT_ROLES)) {
        try {
          const existingRole = await this.getRoleByName(roleName as UserRole);

          if (!existingRole) {
            await this.createRole({
              name: roleName as UserRole,
              permissions: roleData.permissions
            });
            logger.info(`Default role created: ${roleName}`);
          }
        } catch (error) {
          logger.warn(`Failed to create default role ${roleName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

    } catch (error) {
      logger.error(`Error initializing default roles: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Check if role has specific permission
   */
  async hasPermission(roleName: UserRole, permission: Permission): Promise<boolean> {
    try {
      const role = await this.getRoleByName(roleName);

      if (!role) {
        return false;
      }

      return role.permissions.includes(permission);

    } catch (error) {
      logger.error(`Error checking permission: ${error instanceof Error ? error.message : String(error)}`);

      return false;
    }
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleName: UserRole): Promise<Permission[]> {
    try {
      const role = await this.getRoleByName(roleName);

      return role ? role.permissions : [];

    } catch (error) {
      logger.error(`Error getting role permissions: ${error instanceof Error ? error.message : String(error)}`);

      return [];
    }
  }
}
