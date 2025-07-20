#!/usr/bin/env bash
# Build the Docker image for the DB schema

podman login registry.redhat.io
podman pull registry.access.redhat.com/ubi8/ubi-minimal:8.4
podman pull registry.access.redhat.com/ubi8/openjdk-11:1.18-2.1705602259

podman login ka
podman pull container-registry.oracle.com/java/serverjre:latest

podman build -t dbschema -f dbschema.dockerfile
