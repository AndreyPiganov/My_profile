FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl


FROM base AS development

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]


FROM development AS build

RUN npm run build


FROM base AS production

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
