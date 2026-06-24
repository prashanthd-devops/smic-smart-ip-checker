FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY scripts/ ./scripts/
COPY styles/ ./styles/
COPY assets/ ./assets/
COPY index.html ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/server.js"]