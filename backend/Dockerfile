# syntax=docker/dockerfile:1
# JourneyMate API — Node 20 (Alpine)
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ \
 && ln -sf python3 /usr/bin/python
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000
RUN apk add --no-cache wget dumb-init
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
USER node
ENTRYPOINT ["dumb-init","--"]
CMD ["node","index.js"]
