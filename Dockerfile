FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY . .

RUN npm run build

CMD ["node", "dist/src/main.js"]