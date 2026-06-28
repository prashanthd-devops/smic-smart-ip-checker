FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY public/ ./public/
COPY protected/ ./protected/

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server/server.js"]