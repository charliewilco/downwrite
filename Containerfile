FROM node:24-bookworm-slim AS base

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssl \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS deps

WORKDIR /src

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npm run prisma:generate

FROM base AS build

WORKDIR /src

COPY --from=deps /src/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY src/static ./src/static
RUN npm run build
RUN npm prune --omit=dev

FROM base

WORKDIR /app

COPY --from=build /src/package.json /src/package-lock.json ./
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/dist ./dist
COPY --from=build /src/prisma ./prisma
COPY --from=build /src/src/static ./src/static

ENV DOWNWRITE_ADDR=:7878
ENV NODE_ENV=production

EXPOSE 7878

CMD ["sh", "-c", "npm run prisma:deploy && npm run start"]
