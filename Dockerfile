# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

FROM node:lts

# Use production node environment by default.
ENV NODE_ENV=production
ENV PATH="/usr/src/app/node_modules/.bin:$PATH"
RUN apt update && \
	apt install -y g++ make vim && \
	apt clean && \
	rm -rf /var/lib/apt/lists/*


WORKDIR /usr/src/3d-inventory-api

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

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 8081:8080

# Run the application.
RUN PATH="/usr/src/3d-inventory-api/node_modules/.bin:$PATH" \
&& export PATH \
&& npm_config_python=/usr/bin/python3 \
&& export npm_config_python \
&& npm_config_devdir=/tmp/.gyp \
&& export RUN export PATH \
&& PATH="${PATH}:$(npm root -g)" \
&& export PATH \
&& NODE_PATH="$NODE_PATH:$(npm root -g)" \
&& export NODE_PATH

HEALTHCHECK CMD ["curl", "--fail", "http://localhost:8080"]

CMD ["npm", "start"]
