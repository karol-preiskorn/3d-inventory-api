# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=23.3.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

RUN apk add --no-cache g++ make py3-pip python3 cairo-dev pango-dev jpeg-dev giflib-dev

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm install

# Run the application as a non-root user.
COPY package.json package-lock.json ./
RUN npm install
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
RUN PATH="/usr/src/app/node_modules/.bin:$PATH" \
&& export PATH \
&& npm_config_python=/usr/bin/python3 \
&& export npm_config_python \
&& npm_config_devdir=/tmp/.gyp \
&& export RUN export PATH \
&& PATH="${PATH}:$(npm root -g)" \
&& export PATH \
&& NODE_PATH="$NODE_PATH:$(npm root -g)" \
&& export NODE_PATH

# CMD ["npm", "start"]

CMD ["npx", "ts-node", "src/index.ts"]
