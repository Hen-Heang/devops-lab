# Learning tag: review and pin the base digest for releases.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Compare a runtime containing all dependencies with the production target.
FROM deps AS all-deps
COPY --chown=node:node src/ ./src/
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]

# This stage installs only the dependencies needed at runtime.
FROM node:24-alpine AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=production-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
