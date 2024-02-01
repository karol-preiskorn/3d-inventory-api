/**
 * @file /tests/types.js
 * @module /tests
 * @description
 * @version 2024-01-31 C2RLO - add valueAttributeType remove deviceCategory
 * @version 2024-01-30 C2RLO - Initial
**/

export const valueAttributeType = [
  { type: 'String', length: 256, description: 'String' },
  { type: 'Number', length: 8, description: 'Integers' },
  { type: 'Object', length: '', description: '' },
]

// TODO: add description and convert to insert db
export const valueAttributeType = [
  { category: 'Devices', name: 'Bridge', description: '' },
  { category: 'Devices', name: 'CoolAir', description: '' },
  { category: 'Devices', name: 'Desktop', description: '' },
  { category: 'Devices', name: 'Firewall', description: '' },
  { category: 'Devices', name: 'Getaway', description: '' },
  { category: 'Devices', name: 'Hubs', description: '' },
  { category: 'Devices', name: 'Load Balancer', description: '' },
  { category: 'Devices', name: 'Modem', description: '' },
  { category: 'Devices', name: 'Multiplexer', description: '' },
  { category: 'Devices', name: 'PDU System', description: '' },
  { category: 'Devices', name: 'Power', description: '' },
  { category: 'Devices', name: 'Printer', description: '' },
  { category: 'Devices', name: 'Repeaters', description: '' },
  { category: 'Devices', name: 'Router', description: '' },
  { category: 'Devices', name: 'Server', description: '' },
  { category: 'Devices', name: 'Switch', description: '' },
  { category: 'Devices', name: 'Terminal', description: '' },
  { category: 'Devices', name: 'Transceiver', description: '' },
  { category: 'Devices', name: 'UPS System', description: '' },
]
export const deviceCategory = [
  {
    name: 'Connectivity',
    description: 'Data centers often have multiple fiber connections to the internet provided by multiple carriers.',
  },
  {
    name: 'Facility',
    description: 'Data center buildings may be specifically designed as a data center. For example, the height of ceilings will match requirements for racks and overhead systems. In some cases, a data center occupies a floor of an existing building.',
  },
  {
    name: 'Site',
    description: 'A data center requires a site with connections to grids, networks and physical <a href="https://simplicable.com/new/infrastructure">infrastructure</a>  such as roads. Proximity to markets, customers, employees and services also play a role in selecting an appropriate site. Locating data centers in cold climates can reduce cooling costs.',
  },
]

// ada structure application
export const components = [{ 'component': 'Logs', 'collection': 'logs' }, { 'component': 'Devices', 'collection': 'device' }, { 'component': 'Models', 'collection': 'models' }, { 'component': 'Attributes', 'collection': 'attributes' }, { 'component': 'AttributesDictionary', 'collection': 'attributes-dictionary' }, { 'component': 'Connections', 'collection': 'connections' }, { 'component': 'Users', 'collection': 'users' }, { 'component': 'Roles', 'collection': 'roles' }, { 'component': 'Permissions', 'collection': 'permissions' }]
