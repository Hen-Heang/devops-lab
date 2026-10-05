FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node app.js server.js ./
USER node
EXPOSE 3000 9464
CMD ["node", "server.js"]
