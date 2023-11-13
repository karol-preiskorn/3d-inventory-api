# 3d-inventory-mogo-api

1. [3d-inventory-mogo-api](#3d-inventory-mogo-api)
   1. [Purposse](#purposse)
      1. [Architecture](#architecture)
   2. [Stack](#stack)
      1. [Nodejs](#nodejs)
      2. [Project API by Swagger 3+](#project-api-by-swagger-3)
      3. [MongoDB](#mongodb)
         1. [Example of using a Mongoose cursor async with promises](#example-of-using-a-mongoose-cursor-async-with-promises)
   3. [Install node stack](#install-node-stack)
      1. [Use typescript](#use-typescript)
   4. [Playgrounds](#playgrounds)

## Purposse

Create API for 3d-inventory application.

### Architecture

![Architecture](assets/architecture.drawio.png)


## Stack

MEANS stack

### Nodejs

    "bcryptjs": "^2.4.3",
    "cookie-session": "^2.0.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.6.3"

### Project API by Swagger 3+

```bash
podman pull docker://swaggerapi/swagger-editor
sudo podman run -d -p 80:8080 docker://swaggerapi/swagger-editor
```

### MongoDB

We can use MongoDB or programming Mongo Atlas API.

<https://www.mongodb.com/developer/languages/typescript/>

```bash
export MONGODB_VERSION=6.0-ubi8
podman pull mongodb/mongodb-community-server
docker run --name mongodb -d mongodb/mongodb-community-server:$MONGODB_VERSION
podman run -d -it -p 27017:27017
docker run --name mongodb -d -p 27017:27017 -v $(pwd)/data:/data/db mongodb/mongodb-community-server:$MONGODB_VERSION
```

#### Example of using a Mongoose cursor async with promises

```javascript
new Promise(function (resolve, reject) {
  collection.find(query).cursor()
    .on('data', function(doc) {
      // ...
    })
    .on('error', reject)
    .on('end', resolve);
})
.then(function () {
  // ...
});
```

It is generic code that can be tucked away in a utility function so it doesn't clutter application code and obstruct actual application logic.

In your example simplest utility function would be like

```
function streamToPromise(stream) {
    return new Promise(function(resolve, reject) {
        stream.on("end", resolve);
        stream.on("error", reject);
    });
}
```

And then the application code is simply

```
Promise.map(files, function(file) {
    var stream = API.getStream(file);
    stream.pipe(endPoint);
    return streamToPromise(stream);
});
```

Reference:

- [Mongoose cursors](http://mongoosejs.com/docs/api.html#query_Query-cursor)
- [Streams and promises](https://github.com/petkaantonov/bluebird/issues/332#issuecomment-58326173)
- [promise-streams](https://github.com/spion/promise-streams)


## Install node stack

```bash
npm install
```

### Use typescript

https://github.com/Microsoft/TypeScript-Node-Starter#typescript--node

## Playgrounds

```javascript
use('3d-inventory');

// Create a new document in the collection.
db.getCollection('models').insertOne({
  name: 'Model 10',
  dimension: {
    width: '1',
    height: '2',
    depth: '2'
  },
  texture: {
    front: '/assets/r710-2.5-nobezel__29341.png',
    back: '/assets/r710-2.5-nobezel__29341.png',
    side: '/assets/r710-2.5-nobezel__29341.png',
    top: '/assets/r710-2.5-nobezel__29341.png',
    botom: '/assets/r710-2.5-nobezel__29341.png'
  },
  type: 'CoolAir',
  category: 'Facility'
});
```
