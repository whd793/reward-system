FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY apps/event ./apps/event
COPY libs ./libs

RUN npm ci
RUN npm run build event

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER node

EXPOSE 3002

CMD ["node", "dist/apps/event/main"]