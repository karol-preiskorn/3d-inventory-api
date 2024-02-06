/**
 * @file /tests/types.js
 * @module /tests
 * @description This file contains tests for the '/logs' endpoint of the API. It includes tests for retrieving an array of logs and retrieving a specific log by ID.
 * @version 2024-01-31 C2RLO - add valueAttributeType remove deviceCategory
 * @version 2024-01-30 C2RLO - Initial
 */


// Predefined type of value for Attributes values
export const valueAttributeType = [
  { type: 'String', length: 256, description: 'String', default: true },
  { type: 'Number', length: 8, description: 'Integers', default: false },
  { type: 'Object', length: '', description: 'JSON', default: false },
]

// TODO: add description and convert to insert db or read distict form db
// Predefined attributes for Devices, Connections and Models
export const valueAttributeCategory = [
  { component: 'Devices', name: 'Type', type: 'String', value: 'Bridge', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'CoolAir', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Desktop', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Firewall', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Getaway', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Hubs', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Load Balancer', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Modem', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Multiplexer', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'PDU System', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Power', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Printer', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Repeaters', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Router', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Server', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Switch', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Terminal', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'Transceiver', description: '' },
  { component: 'Devices', name: 'Type', type: 'String', value: 'UPS System', description: '' },
  { component: 'Connections', name: 'LAN', description: '' },
  { component: 'Connections', name: 'WAN', description: '' },
  { component: 'Models', name: 'Model Name/Number', description: 'The specific identifier for the device.'},
  { component: 'Models', name: 'Manufacturer', description: 'The company that produced the device.' },
  { component: 'Models', name: 'Form Factor', description: 'The physical size and shape of the device, e.g., rack - mounted, blade server, tower, etc.' },
  { component: 'Models', name: 'Processor(CPU)', description: 'Information about the central processing unit, including the number of cores, clock speed, and architecture.' },
  { component: 'Models', name: 'Memory(RAM)', description: 'The amount and type of random access memory.' },
  { component: 'Models', name: 'Storage', description: 'Details about storage capacity, type(HDD, SSD), and RAID configuration.' },
  { component: 'Models', name: 'Network Interfaces', description: 'The number and type of network interfaces(Ethernet, Fiber Channel, etc.).' },
  { component: 'Models', name: 'Power Supply', description: 'The power requirements and configuration for the device.' },
  { component: 'Models', name: 'Cooling System', description: 'Information about the cooling mechanism in place, whether its air- cooled or liquid - cooled.' },
  { component: 'Models', name: 'Operating System', description: 'The software environment that the device runs on.' },
  { component: 'Models', name: 'Management Interface', description: 'How the device is managed and configured, whether through a web interface, command line, or a dedicated management tool.' },
  { component: 'Models', name: 'Redundancy Features', description: 'Any built -in redundancy for critical components like power supplies or cooling systems.' },
  { component: 'Models', name: 'Physical Dimensions and Weight',  description: 'The size and weight of the device.' },
  { component: 'Models', name: 'Environmental Considerations', description: 'Operating temperature range, humidity levels, and other environmental factors.' },
  { component: 'Models', name: 'Compliance and Certification', description: 'Any industry or regulatory certifications the device complies with.'},
  { component: 'Models', name: 'Warranty and Support', description: 'Information about the warranty period and available support options..' },
  { component: 'Models', name: 'Security Features', description: 'Any security measures in place, such as hardware - based encryption or secure boot.' },
  { component: 'Models', name: 'Scalability', description: 'The ability to scale resources, such as adding more CPUs, memory, or storage.' },
  { component: 'Models', name: 'Interoperability', description: 'Compatibility with other devices and systems in the data center.' },
  { component: 'Models', name: 'Remote Management', description: 'Capabilities for remote monitoring and administration.' },
]

// configuration structure application
export const components = [
  { component: 'Logs', collection: 'logs', attributes: false },
  { component: 'Devices', collection: 'devices', attributes: true },
  { component: 'Models', collection: 'models', attributes: true },
  { component: 'Attributes', collection: 'attributes', attributes: false },
  { component: 'AttributesDictionary', collection: 'attributes-dictionary', attributes: false },
  { component: 'Connections', collection: 'connections', attributes: true },
  { component: 'Users', collection: 'users', attributes: false },
  { component: 'Roles', collection: 'roles', attributes: false },
  { component: 'Permissions', collection: 'permissions', attributes: false },
]
