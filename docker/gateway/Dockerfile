FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY apps/gateway ./apps/gateway
COPY libs ./libs

RUN npm ci
RUN npm run build gateway

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER node

EXPOSE 3000

CMD ["node", "dist/apps/gateway/main"]