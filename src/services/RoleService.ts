/**
 * @file /services/RoleService.ts
 * @description Role service for MongoDB operations and role management
 * @module services
 */

import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { Permission, UserRole } from '../middlewares/auth';
import { DEFAULT_ROLES, Role, RoleResponse, toRoleResponse } from '../models/Role';
import { closeConnection, connectToCluster, connectToDb } from '../utils/db';
import getLogger from '../utils/logger';

const logger = getLogger('RoleService');
const COLLECTION_NAME = 'roles';

export class RoleService {
  private static instance: RoleService;

  private constructor() {}

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
      // Validate input
      if (!roleData.name || !Array.isArray(roleData.permissions)) {
        throw new Error('Invalid role data: name and permissions are required');
      }

      // Validate permissions
      const validPermissions = Object.values(Permission);
      const invalidPermissions = roleData.permissions.filter((p) => !validPermissions.includes(p));

      if (invalidPermissions.length > 0) {
        throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }

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
        permissions: [...new Set(roleData.permissions)], // Remove duplicates
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await collection.insertOne(newRole as Role);

      if (!result.acknowledged || !result.insertedId) {
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
      if (!name) {
        throw new Error('Role name is required');
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      const role = await collection.findOne({
        name,
        isActive: { $ne: false }, // Only get active roles (or undefined)
      });

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
   * Get role by ID
   */
  async getRoleById(id: string): Promise<RoleResponse | null> {
    let client: MongoClient | null = null;

    try {
      if (!ObjectId.isValid(id)) {
        throw new Error('Invalid role ID format');
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      const role = await collection.findOne({
        _id: new ObjectId(id),
        isActive: { $ne: false },
      });

      return role ? toRoleResponse(role) : null;
    } catch (error) {
      logger.error(`Error getting role by ID: ${error instanceof Error ? error.message : String(error)}`);
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
  async getAllRoles(includeInactive: boolean = false): Promise<RoleResponse[]> {
    let client: MongoClient | null = null;

    try {
      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      const query = includeInactive ? {} : { isActive: { $ne: false } };
      const roles = await collection.find(query).sort({ name: 1 }).toArray();

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
  async updateRole(
    name: UserRole,
    updateData: {
      permissions?: Permission[];
      displayName?: string;
      description?: string;
      isActive?: boolean;
    },
  ): Promise<RoleResponse> {
    let client: MongoClient | null = null;

    try {
      if (!name) {
        throw new Error('Role name is required');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Update data is required');
      }

      // Validate permissions if provided
      if (updateData.permissions) {
        const validPermissions = Object.values(Permission);
        const invalidPermissions = updateData.permissions.filter((p) => !validPermissions.includes(p));

        if (invalidPermissions.length > 0) {
          throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
        }
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      // Build update object
      const updateFields: Record<string, unknown> = { updatedAt: new Date() };

      if (updateData.permissions) {
        updateFields.permissions = [...new Set(updateData.permissions)]; // Remove duplicates
      }
      if (updateData.displayName !== undefined) {
        updateFields.displayName = updateData.displayName.trim();
      }
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description.trim();
      }
      if (updateData.isActive !== undefined) {
        updateFields.isActive = updateData.isActive;
      }

      const result = await collection.findOneAndUpdate({ name }, { $set: updateFields }, { returnDocument: 'after' });

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
   * Soft delete role (mark as inactive)
   */
  async deactivateRole(name: UserRole): Promise<boolean> {
    let client: MongoClient | null = null;

    try {
      // Prevent deactivation of default roles
      const defaultRoleNames = Object.keys(DEFAULT_ROLES) as UserRole[];

      if (defaultRoleNames.includes(name)) {
        throw new Error('Cannot deactivate default system roles');
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      const result = await collection.updateOne(
        { name },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      );

      if (result.modifiedCount === 1) {
        logger.info(`Role deactivated successfully: ${name}`);

        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error deactivating role: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Hard delete role (permanent deletion)
   */
  async deleteRole(name: UserRole): Promise<boolean> {
    let client: MongoClient | null = null;

    try {
      // Prevent deletion of default roles
      const defaultRoleNames = Object.keys(DEFAULT_ROLES) as UserRole[];

      if (defaultRoleNames.includes(name)) {
        throw new Error('Cannot delete default system roles');
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      // Check if role exists and is not used by any users (you might want to add this check)
      const role = await collection.findOne({ name });

      if (!role) {
        throw new Error('Role not found');
      }

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
      logger.info('Initializing default roles...');

      for (const [roleName, roleData] of Object.entries(DEFAULT_ROLES)) {
        try {
          const existingRole = await this.getRoleByName(roleName as UserRole);

          if (!existingRole) {
            await this.createRole({
              name: roleName as UserRole,
              permissions: roleData.permissions,
            });
            logger.info(`Default role created: ${roleName}`);
          } else {
            logger.info(`Default role already exists: ${roleName}`);
          }
        } catch (error) {
          logger.warn(`Failed to create default role ${roleName}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      logger.info('Default roles initialization completed');
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
      if (!roleName || !permission) {
        return false;
      }

      const role = await this.getRoleByName(roleName);

      if (!role || !role.isActive) {
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
      if (!roleName) {
        return [];
      }

      const role = await this.getRoleByName(roleName);

      return role && role.isActive ? role.permissions : [];
    } catch (error) {
      logger.error(`Error getting role permissions: ${error instanceof Error ? error.message : String(error)}`);

      return [];
    }
  }

  /**
   * Check if role exists and is active
   */
  async roleExists(name: UserRole): Promise<boolean> {
    try {
      const role = await this.getRoleByName(name);

      return !!role && role.isActive;
    } catch (error) {
      logger.error(`Error checking if role exists: ${error instanceof Error ? error.message : String(error)}`);

      return false;
    }
  }

  /**
   * Get roles count
   */
  async getRolesCount(includeInactive: boolean = false): Promise<number> {
    let client: MongoClient | null = null;

    try {
      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      const query = includeInactive ? {} : { isActive: { $ne: false } };

      return await collection.countDocuments(query);
    } catch (error) {
      logger.error(`Error getting roles count: ${error instanceof Error ? error.message : String(error)}`);

      return 0;
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }

  /**
   * Search roles by name or display name
   */
  async searchRoles(searchTerm: string, includeInactive: boolean = false): Promise<RoleResponse[]> {
    let client: MongoClient | null = null;

    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        return [];
      }

      client = await connectToCluster();
      const db: Db = connectToDb(client);
      const collection: Collection<Role> = db.collection(COLLECTION_NAME);
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      const query: Record<string, unknown> = {
        $or: [{ name: searchRegex }, { displayName: searchRegex }, { description: searchRegex }],
      };

      if (!includeInactive) {
        query.isActive = { $ne: false };
      }

      const roles = await collection.find(query).sort({ name: 1 }).toArray();

      return roles.map(toRoleResponse);
    } catch (error) {
      logger.error(`Error searching roles: ${error instanceof Error ? error.message : String(error)}`);

      return [];
    } finally {
      if (client) {
        await closeConnection(client);
      }
    }
  }
}

// Export singleton instance
export default RoleService.getInstance();
