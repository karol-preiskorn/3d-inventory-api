import { Request, Response } from 'express'
import sanitize from 'mongo-sanitize'
import { Collection, Db, InsertOneResult, UpdateResult, DeleteResult, ObjectId } from 'mongodb'
import { closeConnection, connectToCluster, connectToDb } from '../utils/db'
import getLogger from '../utils/logger'

const logger = getLogger('connections')
const proc = '[connections]'
const collectionName = 'connections'

export interface Connection {
  _id?: ObjectId;
  name?: string;
  sourceDeviceId?: ObjectId;
  targetDeviceId?: ObjectId;
  deviceIdFrom?: ObjectId;
  deviceIdTo?: ObjectId;
  protocol?: string;
  type?: string;
  status?: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  bandwidth?: string;
  description?: string;
  configuration?: any;
  createdAt?: Date;
  updatedAt?: Date;
  capacity?: number;
  notes?: string;
}

export interface ConnectionInput {
  name?: string;
  sourceDeviceId?: string;
  targetDeviceId?: string;
  deviceIdFrom?: string;
  deviceIdTo?: string;
  protocol?: string;
  type?: string;
  status?: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  bandwidth?: string;
  description?: string;
  configuration?: any;
  capacity?: number;
  notes?: string;
}

// Constants
const DEFAULT_LIMIT = 256
const MAX_LIMIT = 1000

// Get all connections
export async function getAllConnections(req: Request, res: Response) {
  let limit = DEFAULT_LIMIT

  if (req.query.limit) {
    const parsed = parseInt(req.query.limit as string, 10)

    if (!isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_LIMIT)
    }
  }

  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    
    // Build filter query from query parameters
    const filter: any = {}
    
    if (req.query.sourceDeviceId) {
      filter.sourceDeviceId = req.query.sourceDeviceId
    }
    if (req.query.targetDeviceId) {
      filter.targetDeviceId = req.query.targetDeviceId
    }
    if (req.query.protocol) {
      filter.protocol = req.query.protocol
    }
    if (req.query.status) {
      filter.status = req.query.status
    }
    // Support legacy field names
    if (req.query.deviceIdFrom) {
      filter.deviceIdFrom = new ObjectId(req.query.deviceIdFrom as string)
    }
    if (req.query.deviceIdTo) {
      filter.deviceIdTo = new ObjectId(req.query.deviceIdTo as string)
    }
    
    const results = await collection.find(filter).limit(limit).toArray()

    logger.info(`Retrieved ${results.length} connections`)
    res.status(200).json({
      data: results,
      count: results.length
    })
  } catch (error) {
    logger.error(`${proc} Error fetching connections: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getAllConnections',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Get connection by ID
export async function getConnectionById(req: Request, res: Response) {
  const { id } = req.params
  const query = { _id: new ObjectId(id) }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const connection = await collection.findOne(query)

    if (!connection) {
      logger.warn(`${proc} Connection not found: ${id}`)
      res.status(404).json({ message: 'Connection not found' })

      return
    }

    logger.info(`${proc} Retrieved connection: ${id}`)
    res.status(200).json(connection)
  } catch (error) {
    logger.error(`${proc} Error fetching connection ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionById',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Get connections from a specific device
export async function getConnectionsFrom(req: Request, res: Response) {
  const { id } = req.params
  const query = { deviceIdFrom: new ObjectId(id) }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const connections = await collection.find(query).toArray()

    if (!connections.length) {
      logger.info(`${proc} No connections found from device: ${id}`)
      res.status(404).json({ message: `No connections found from device: ${id}` })

      return
    }

    logger.info(`${proc} Retrieved ${connections.length} connections from device: ${id}`)
    res.status(200).json(connections)
  } catch (error) {
    logger.error(`${proc} Error fetching connections from device ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionsFrom',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Get connections to a specific device
export async function getConnectionsTo(req: Request, res: Response) {
  const { id } = req.params
  const query = { deviceIdTo: new ObjectId(id) }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const connections = await collection.find(query).toArray()

    if (!connections.length) {
      logger.info(`${proc} No connections found to device: ${id}`)
      res.status(404).json({ message: `No connections found to device: ${id}` })

      return
    }

    logger.info(`${proc} Retrieved ${connections.length} connections to device: ${id}`)
    res.status(200).json(connections)
  } catch (error) {
    logger.error(`${proc} Error fetching connections to device ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionsTo',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Get connection between two devices
export async function getConnectionBetweenDevices(req: Request, res: Response) {
  const { idFrom, idTo } = req.params

  if (!ObjectId.isValid(idFrom) || !ObjectId.isValid(idTo)) {
    logger.warn(`${proc} Invalid ObjectIds: ${idFrom}, ${idTo}`)
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'Both device IDs must be valid ObjectIds'
    })

    return
  }

  const query = {
    deviceIdFrom: new ObjectId(idFrom),
    deviceIdTo: new ObjectId(idTo)
  }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const connection = await collection.findOne(query)

    if (!connection) {
      logger.info(`${proc} No connection found between devices: ${idFrom} -> ${idTo}`)
      res.status(404).json({ message: 'Connection not found between specified devices' })

      return
    }

    logger.info(`${proc} Retrieved connection between devices: ${idFrom} -> ${idTo}`)
    res.status(200).json(connection)
  } catch (error) {
    logger.error(`${proc} Error fetching connection between devices ${idFrom} -> ${idTo}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getConnectionBetweenDevices',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Create new connection
export async function createConnection(req: Request, res: Response) {
  const { 
    name, 
    sourceDeviceId, 
    targetDeviceId, 
    deviceIdFrom, 
    deviceIdTo, 
    protocol,
    type,
    status = 'active',
    sourcePort,
    targetPort,
    label,
    bandwidth,
    description,
    configuration,
    capacity,
    notes
  } = req.body

  // Support both new and legacy field names
  const fromId = sourceDeviceId || deviceIdFrom
  const toId = targetDeviceId || deviceIdTo
  
  // Sanitize inputs
  const sanitizedName = sanitize(name || label || '')
  const sanitizedFromId = sanitize(fromId)
  const sanitizedToId = sanitize(toId)
  const sanitizedProtocol = sanitize(protocol || 'ethernet')

  // Validation
  if (!fromId || !toId) {
    logger.warn(`${proc} Missing required device IDs`)
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Source device and target device are required'
    })
    return
  }

  if (!ObjectId.isValid(sanitizedFromId) || !ObjectId.isValid(sanitizedToId)) {
    logger.warn(`${proc} Invalid ObjectIds`)
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Source device and target device must be valid ObjectId strings'
    })
    return
  }

  // Check for self-connection
  if (sanitizedFromId === sanitizedToId) {
    logger.warn(`${proc} Device cannot connect to itself`)
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Device cannot connect to itself'
    })
    return
  }

  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    
    // Check if devices exist
    const devicesCollection = db.collection('devices')
    const sourceDevice = await devicesCollection.findOne({ _id: new ObjectId(sanitizedFromId) })
    const targetDevice = await devicesCollection.findOne({ _id: new ObjectId(sanitizedToId) })

    if (!sourceDevice) {
      res.status(400).json({
        error: 'Invalid input data',
        message: 'Source device not found'
      })
      return
    }

    if (!targetDevice) {
      res.status(400).json({
        error: 'Invalid input data',
        message: 'Target device not found'
      })
      return
    }

    // Check for duplicate connections
    const connectionsCollection = db.collection(collectionName)
    const existingConnection = await connectionsCollection.findOne({
      $or: [
        {
          sourceDeviceId: sanitizedFromId,
          targetDeviceId: sanitizedToId,
          sourcePort: sourcePort,
          targetPort: targetPort
        },
        {
          deviceIdFrom: new ObjectId(sanitizedFromId),
          deviceIdTo: new ObjectId(sanitizedToId)
        }
      ]
    })

    if (existingConnection) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Connection already exists'
      })
      return
    }

    // Validate protocol if provided
    const validProtocols = ['ethernet', 'fiber', 'tcp', 'udp', 'http', 'https', 'serial', 'wireless']
    if (sanitizedProtocol && !validProtocols.includes(sanitizedProtocol)) {
      res.status(400).json({
        error: 'Invalid input data',
        message: 'Invalid protocol value'
      })
      return
    }

    // Validate type if provided
    const validTypes = ['ethernet', 'fiber', 'serial', 'wireless', 'power', 'usb']
    if (type && !validTypes.includes(type)) {
      res.status(400).json({
        error: 'Invalid input data',
        message: 'Invalid connection type value'
      })
      return
    }

    const newConnection: Connection = {
      name: sanitizedName,
      sourceDeviceId: sanitizedFromId,
      targetDeviceId: sanitizedToId,
      deviceIdFrom: new ObjectId(sanitizedFromId), // Keep legacy fields for backward compatibility
      deviceIdTo: new ObjectId(sanitizedToId),
      protocol: sanitizedProtocol,
      type: type || 'ethernet',
      status: status,
      sourcePort: sourcePort,
      targetPort: targetPort,
      label: label || sanitizedName,
      bandwidth: bandwidth,
      description: description,
      configuration: configuration,
      capacity: capacity,
      notes: notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result: InsertOneResult<Connection> = await connectionsCollection.insertOne(newConnection)

    if (!result.acknowledged) {
      res.status(500).json({ message: 'Failed to create connection' })
      return
    }

    const insertedConnection = { _id: result.insertedId, ...newConnection }

    logger.info(`${proc} Created connection: ${result.insertedId}`)
    res.status(201).json(insertedConnection)
  } catch (error) {
    logger.error(`${proc} Error creating connection: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'createConnection',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Update connection by ID
export async function updateConnection(req: Request, res: Response) {
  const { id } = req.params
  const { 
    name, 
    sourceDeviceId, 
    targetDeviceId, 
    deviceIdFrom, 
    deviceIdTo, 
    protocol,
    type,
    status,
    sourcePort,
    targetPort,
    label,
    bandwidth,
    description,
    configuration,
    capacity,
    notes
  } = req.body

  // Support both new and legacy field names
  const fromId = sourceDeviceId || deviceIdFrom
  const toId = targetDeviceId || deviceIdTo
  
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    
    // Check if connection exists
    const existingConnection = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingConnection) {
      logger.warn(`${proc} Connection not found for update: ${id}`)
      res.status(404).json({ message: 'Connection not found' })
      return
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updates.name = sanitize(name)
    if (label !== undefined) updates.label = sanitize(label)
    if (protocol !== undefined) updates.protocol = sanitize(protocol)
    if (type !== undefined) updates.type = sanitize(type)
    if (status !== undefined) updates.status = sanitize(status)
    if (sourcePort !== undefined) updates.sourcePort = sanitize(sourcePort)
    if (targetPort !== undefined) updates.targetPort = sanitize(targetPort)
    if (bandwidth !== undefined) updates.bandwidth = sanitize(bandwidth)
    if (description !== undefined) updates.description = sanitize(description)
    if (configuration !== undefined) updates.configuration = configuration
    if (capacity !== undefined) updates.capacity = capacity
    if (notes !== undefined) updates.notes = sanitize(notes)

    if (fromId && toId) {
      if (!ObjectId.isValid(fromId) || !ObjectId.isValid(toId)) {
        res.status(400).json({
          error: 'Invalid input data',
          message: 'Device IDs must be valid ObjectId strings'
        })
        return
      }

      // Check for self-connection
      if (fromId === toId) {
        res.status(400).json({
          error: 'Invalid input data',
          message: 'Device cannot connect to itself'
        })
        return
      }

      // Check if devices exist
      const devicesCollection = db.collection('devices')
      const sourceDevice = await devicesCollection.findOne({ _id: new ObjectId(fromId) })
      const targetDevice = await devicesCollection.findOne({ _id: new ObjectId(toId) })

      if (!sourceDevice || !targetDevice) {
        res.status(400).json({
          error: 'Invalid input data',
          message: 'Device not found'
        })
        return
      }

      updates.sourceDeviceId = fromId
      updates.targetDeviceId = toId
      updates.deviceIdFrom = new ObjectId(fromId)
      updates.deviceIdTo = new ObjectId(toId)
    }

    const result: UpdateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    logger.info(`${proc} Updated connection: ${id}`)
    res.status(200).json({
      message: 'Connection updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    logger.error(`${proc} Error updating connection ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'updateConnection',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Delete connection by ID
export async function deleteConnection(req: Request, res: Response) {
  const { id } = req.params
  const query = { _id: new ObjectId(id) }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: DeleteResult = await collection.deleteOne(query)

    if (result.deletedCount === 0) {
      logger.warn(`${proc} Connection not found for deletion: ${id}`)
      res.status(404).json({ message: 'Connection not found' })

      return
    }

    logger.info(`${proc} Deleted connection: ${id}`)
    res.status(200).json({
      message: 'Connection deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    logger.error(`${proc} Error deleting connection ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnection',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Delete connections from device
export async function deleteConnectionsFrom(req: Request, res: Response) {
  const { id } = req.params
  const query = { deviceIdFrom: new ObjectId(id) }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: DeleteResult = await collection.deleteMany(query)

    logger.info(`${proc} Deleted ${result.deletedCount} connections from device: ${id}`)
    res.status(200).json({
      message: `Deleted connections from device: ${id}`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    logger.error(`${proc} Error deleting connections from device ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnectionsFrom',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Delete connections to device
export async function deleteConnectionsTo(req: Request, res: Response) {
  const { id } = req.params
  const query = { deviceIdTo: new ObjectId(id) }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: DeleteResult = await collection.deleteMany(query)

    logger.info(`${proc} Deleted ${result.deletedCount} connections to device: ${id}`)
    res.status(200).json({
      message: `Deleted connections to device: ${id}`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    logger.error(`${proc} Error deleting connections to device ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnectionsTo',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Delete connections between devices
export async function deleteConnectionsBetweenDevices(req: Request, res: Response) {
  const { idFrom, idTo } = req.params

  if (!ObjectId.isValid(idFrom) || !ObjectId.isValid(idTo)) {
    logger.warn(`${proc} Invalid ObjectIds for deletion: ${idFrom}, ${idTo}`)
    res.status(400).json({
      error: 'Invalid ID format',
      message: 'Both device IDs must be valid ObjectIds'
    })

    return
  }

  const query = {
    deviceIdFrom: new ObjectId(idFrom),
    deviceIdTo: new ObjectId(idTo)
  }
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: DeleteResult = await collection.deleteMany(query)

    logger.info(`${proc} Deleted ${result.deletedCount} connections between devices: ${idFrom} -> ${idTo}`)
    res.status(200).json({
      message: `Deleted connections between devices: ${idFrom} -> ${idTo}`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    logger.error(`${proc} Error deleting connections between devices ${idFrom} -> ${idTo}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteConnectionsBetweenDevices',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Delete all connections
export async function deleteAllConnections(req: Request, res: Response) {
  // Production safety check
  if (process.env.NODE_ENV === 'production') {
    logger.warn(`${proc} Attempt to delete all connections in production environment`)
    res.status(403).json({
      error: 'Forbidden in production environment',
      message: 'This operation is not allowed in production'
    })

    return
  }

  if (req.query.confirm !== 'true') {
    logger.warn(`${proc} Missing confirmation for delete all connections`)
    res.status(400).json({
      error: 'Confirmation required',
      message: 'Add ?confirm=true to proceed with deleting all connections'
    })

    return
  }

  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    const result: DeleteResult = await collection.deleteMany({})

    logger.warn(`${proc} Deleted all ${result.deletedCount} connections`)
    res.status(200).json({
      message: 'All connections deleted successfully',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    logger.error(`${proc} Error deleting all connections: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'deleteAllConnections',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Update connection status only
export async function updateConnectionStatus(req: Request, res: Response) {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Status is required'
    })
    return
  }

  const validStatuses = ['active', 'inactive', 'error', 'maintenance', 'planned', 'failed', 'deprecated']
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      error: 'Invalid input data',
      message: 'Invalid status value'
    })
    return
  }

  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    
    const result: UpdateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: sanitize(status),
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      logger.warn(`${proc} Connection not found for status update: ${id}`)
      res.status(404).json({ message: 'Connection not found' })
      return
    }

    logger.info(`${proc} Updated connection status: ${id} -> ${status}`)
    res.status(200).json({
      message: 'Connection status updated successfully',
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    logger.error(`${proc} Error updating connection status ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'updateConnectionStatus',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Get all connections for a specific device
export async function getDeviceConnections(req: Request, res: Response) {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    res.status(400).json({
      error: 'Invalid Input',
      message: 'Invalid ObjectId format',
      field: 'id'
    })
    return
  }

  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const collection: Collection = db.collection(collectionName)
    
    // Find connections where the device is either source or target
    const connections = await collection.find({
      $or: [
        { sourceDeviceId: id },
        { targetDeviceId: id },
        { deviceIdFrom: new ObjectId(id) },
        { deviceIdTo: new ObjectId(id) }
      ]
    }).toArray()

    logger.info(`${proc} Retrieved ${connections.length} connections for device: ${id}`)
    res.status(200).json({
      data: connections,
      count: connections.length
    })
  } catch (error) {
    logger.error(`${proc} Error fetching connections for device ${id}: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getDeviceConnections',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}

// Get network topology
export async function getNetworkTopology(req: Request, res: Response) {
  const client = await connectToCluster()

  try {
    const db: Db = connectToDb(client)
    const connectionsCollection = db.collection(collectionName)
    const devicesCollection = db.collection('devices')
    
    // Get all connections
    const connections = await connectionsCollection.find({}).toArray()
    
    // Get all devices referenced in connections
    const deviceIds = new Set<string>()
    connections.forEach(conn => {
      if (conn.sourceDeviceId) deviceIds.add(conn.sourceDeviceId)
      if (conn.targetDeviceId) deviceIds.add(conn.targetDeviceId)
      if (conn.deviceIdFrom) deviceIds.add(conn.deviceIdFrom.toString())
      if (conn.deviceIdTo) deviceIds.add(conn.deviceIdTo.toString())
    })

    const devices = await devicesCollection.find({
      _id: { $in: Array.from(deviceIds).map(id => new ObjectId(id)) }
    }).toArray()

    // Format topology response
    const nodes = devices.map(device => ({
      id: device._id.toString(),
      name: device.name,
      type: device.type || 'device',
      position: device.position,
      status: device.status || 'unknown'
    }))

    const edges = connections.map(conn => ({
      id: conn._id.toString(),
      source: conn.sourceDeviceId || conn.deviceIdFrom?.toString(),
      target: conn.targetDeviceId || conn.deviceIdTo?.toString(),
      protocol: conn.protocol || 'unknown',
      type: conn.type || 'unknown',
      status: conn.status || 'unknown',
      label: conn.label || conn.name
    }))

    logger.info(`${proc} Retrieved network topology: ${nodes.length} nodes, ${edges.length} edges`)
    res.status(200).json({
      nodes,
      edges
    })
  } catch (error) {
    logger.error(`${proc} Error fetching network topology: ${error instanceof Error ? error.message : String(error)}`)
    res.status(500).json({
      module: 'connections',
      procedure: 'getNetworkTopology',
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    await closeConnection(client)
  }
}
