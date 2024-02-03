/**
 * @file /tests/types.js
 * @module /tests
 * @description
 * @version 2024-01-31 C2RLO - add valueAttributeType remove deviceCategory
 * @version 2024-01-30 C2RLO - Initial
 */

export const valueAttributeType = [
  { type: 'String', length: 256, description: 'String' },
  { type: 'Number', length: 8, description: 'Integers' },
  { type: 'Object', length: '', description: 'JSON' },
]

// TODO: add description and convert to insert db or read distict form db
export const valueAttributeCategory = [
  { component: 'Device', name: 'Bridge', description: '' },
  { component: 'Device', name: 'CoolAir', description: '' },
  { component: 'Device', name: 'Desktop', description: '' },
  { component: 'Device', name: 'Firewall', description: '' },
  { component: 'Device', name: 'Getaway', description: '' },
  { component: 'Device', name: 'Hubs', description: '' },
  { component: 'Device', name: 'Load Balancer', description: '' },
  { component: 'Device', name: 'Modem', description: '' },
  { component: 'Device', name: 'Multiplexer', description: '' },
  { component: 'Device', name: 'PDU System', description: '' },
  { component: 'Device', name: 'Power', description: '' },
  { component: 'Device', name: 'Printer', description: '' },
  { component: 'Device', name: 'Repeaters', description: '' },
  { component: 'Device', name: 'Router', description: '' },
  { component: 'Device', name: 'Server', description: '' },
  { component: 'Device', name: 'Switch', description: '' },
  { component: 'Device', name: 'Terminal', description: '' },
  { component: 'Device', name: 'Transceiver', description: '' },
  { component: 'Device', name: 'UPS System', description: '' },
]

// ada structure application
export const components =
  [{ 'component': 'Logs', 'collection': 'logs' },
    { 'component': 'Devices', 'collection': 'device' },
    { 'component': 'Models', 'collection': 'models' },
    { 'component': 'Attributes', 'collection': 'attributes' },
    { 'component': 'AttributesDictionary', 'collection': 'attributes-dictionary' },
    { 'component': 'Connections', 'collection': 'connections' },
    { 'component': 'Users', 'collection': 'users' },
    { 'component': 'Roles', 'collection': 'roles' },
    { 'component': 'Permissions', 'collection': 'permissions' }]
