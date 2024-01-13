# mongodb

export MONGODB_VERSION=6.0-ubi8
podman pull mongodb/mongodb-community-server
podman run --name mongodb -d mongodb/mongodb-community-server:$MONGODB_VERSION
podman run -d -it -p 27017:27017
podman run --name mongodb -d -p 27017:27017 -v $(pwd)/data:/data/db mongodb/mongodb-community-server:$MONGODB_VERSION
