# Building and running your application

## Use compose

When you're ready, start your application by running:

```bash
docker compose up --build
```

Your application will be available at http://localhost:8083

## Deploying your application to the cloud

### Local build and run

```bash
cp api.yaml .env dist/src && node dist/src/index.js
```

First, build your image, e.g.:

```docker
docker build -t 3d-inventory-api .
```

Then, push it to your registry, e.g.

```docker
docker image push docker.io/kpreiskorn/3d-inventory-mongo-api:latest
```

## Run docker container on remote host

```bash
docker run 3d-inventory-api
```

### Push secrets

## References

* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
* Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.
