'use strict';


/**
 * Delete connection
 * Delete connection beetween two devices. Two id and attributes from attributes.
 *
 * no response value expected for this operation
 **/
exports.connectionDELETE = function() {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Delete connections logs
 * Delete specific connections logs.
 *
 * id UUID ID of connection to fetch
 * no response value expected for this operation
 **/
exports.connectionDelete = function(id) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Get information about one Connection.
 * Connection between devices
 *
 * id UUID ID of attribute-dictionary to fetch logs
 * returns Connections
 **/
exports.connectionGet = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
}, {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Create new connection beetween two devices
 * Create connection beetween two devices. Two id and attributes from attributes.
 *
 * body List 
 * returns Connection
 **/
exports.connectionPOST = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Update new connection beetween two devices
 * Create connection beetween two devices. Two id and attributes from attributes.
 *
 * body List 
 * returns Connections
 **/
exports.connectionPUT = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
}, {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get information about Connections between Devices.
 * Get connection for device
 *
 * id UUID ID of attribute-dictionary to fetch logs
 * returns Connections
 **/
exports.connectionsDeviceGet = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
}, {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Server heartbeat operation. Get information about connection between Devices.
 * Get all connections between devices
 *
 * returns Connections
 **/
exports.connectionsGet = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
}, {
  "_id" : "91601de6-6e93-11ed-a1eb-0242ac120002",
  "name" : "device-A1",
  "deviceIdFrom" : "5f8abd81-0d35-47c4-8277-3d6bbbe185f0",
  "deviceIdTo" : "be5bb617-a614-435f-bf66-8768d0aba0c8"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

