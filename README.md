# 3d-inventory-mongo-api

- [3d-inventory-mongo-api](#3d-inventory-mongo-api)
  - [Purposes](#purposes)
    - [Architecture](#architecture)
    - [Data Model](#data-model)
    - [API documentation](#api-documentation)
    - [Use MongoDB](#use-mongodb)
  - [Install node stack](#install-node-stack)
  - [Tools](#tools)
  - [Todo](#todo)

[![wakatime](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb.svg)](https://wakatime.com/badge/user/3bbeedbe-0c6a-4a01-b3cd-a85d319a03bf/project/018c29b5-69aa-44a9-823a-51170ee4eafb)[![GitHub latest commit](https://badgen.net/github/last-commit/karol-preiskorn/3d-inventory-mongo-api)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/commit/)[![GitHub issues](https://img.shields.io/github/issues/karol-preiskorn/3d-inventory-mongo-api.svg)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/issues/)[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)[![Npm package version](https://badgen.net/npm/v/express)](https://npmjs.com/package/express)[![GitHub license](https://badgen.net/github/license/karol-preiskorn/3d-inventory-mongo-api)](https://github.com/karol-preiskorn/3d-inventory-mongo-api/blob/master/LICENSE)[![GitHub stars](https://img.shields.io/github/stars/karol-preiskorn/3d-inventory-mongo-api.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/karol-preiskorn/3d-inventory-mongo-api/stargazers/)

## Purposes

Create REST mongo API for [3d-inventory](https://github.com/users/karol-preiskorn/3d-inventory-angular-ui) application in Angular.

### Architecture

![Architecture 3d-inventory Mongo API](/assets/architecture.drawio.png)

#### MEAN stack

- MongoDB is a NoSQL database that stores data in a flexible, JSON-like format.
- Express.js is a web application framework for Node.js that simplifies the process of building web servers and APIs.
- AngularJS is a JavaScript framework for building dynamic web applications on the client-side.
- Node.js is a JavaScript runtime that allows you to run JavaScript code on the server-side.

### Data Model

![Data Model](/assets/3d-inventory.png)

### API documentation

[Swagger](https://app.swaggerhub.com/apis/karol-preiskorn/3d-inventory-rest-api/0.0.6#/) API definition.

### Use MongoDB

We can use MongoDB or programming Mongo Atlas API.

<https://www.mongodb.com/developer/languages/typescript/>

#### Example of using a cursor async with promises

```javascript
new Promise(function (resolve, reject) {
  collection
    .find(query)
    .cursor()
    .on('data', function (doc) {
      // ...
    })
    .on('error', reject)
    .on('end', resolve)
}).then(function () {
  // ...
})
```

It is generic code that can be tucked away in a utility function so it doesn't
clutter application code and obstruct actual application logic.

In your example simplest utility function would be like

```js
function streamToPromise(stream) {
  return new Promise(function (resolve, reject) {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}
```

And then the application code is simply

```js
Promise.map(files, function (file) {
  var stream = API.getStream(file)
  stream.pipe(endPoint)
  return streamToPromise(stream)
})
```

##### Reference

- [Streams and promises](https://github.com/petkaantonov/bluebird/issues/332#issuecomment-58326173)
- [promise-streams](https://github.com/spion/promise-streams)

## Install node stack

```bash
npm install
npm start
```

## Tools

- https://github.com/variety/variety Schema Analyzer for MongoDB
- https://www.npmjs.com/package/mongodb-schema Infer a probabilistic schema for a MongoDB collection.
- https://dbschema.com/download.html

## Todo

- [ ] move to Typepscript
