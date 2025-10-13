FROM node:22-alpine AS base
FROM base AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate

COPY . .

RUN npm run build

FROM base AS runner

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main.js"]