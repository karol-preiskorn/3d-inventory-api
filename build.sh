#!/bin/bash
docker rm -f 3d-inventory-api 2>/dev/null
docker build -t 3d-inventory-api .
docker tag 3d-inventory-api docker.io/kpreiskorn/3d-inventory-api:latest
docker run -d --name 3d-inventory-api 3d-inventory-api
