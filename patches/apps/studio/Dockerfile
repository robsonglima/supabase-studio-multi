# To be run in the root of the turbo monorepo
# Patched for multi-project self-hosted support

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update -qq && \
  apt-get install -y --no-install-recommends \
  git \
  python3 \
  ca-certificates \
  build-essential && \
  rm -rf /var/lib/apt/lists/* && \
  update-ca-certificates

RUN npm install -g pnpm@10.24.0

WORKDIR /app

FROM base AS turbo
COPY . .
RUN pnpm dlx turbo@2.8.13 prune studio --docker

FROM base AS deps
COPY --from=turbo /app/out/json ./
COPY --from=turbo /app/out/pnpm-lock.yaml ./
COPY ./patches/ ./patches
RUN pnpm install --frozen-lockfile

FROM deps AS dev
ARG PATCHES_HASH=0
RUN echo "Patches hash: $PATCHES_HASH"
COPY --from=turbo /app/out/full ./
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 8082
CMD ["pnpm", "dev:studio"]

# Compile Next.js — limit Node heap to avoid OOM on 7GB runners
FROM dev AS builder
ENV NODE_OPTIONS="--max-old-space-size=5500"
RUN pnpm --filter studio exec next build

FROM base AS production
COPY --from=builder /app/apps/studio/public ./apps/studio/public
COPY --from=builder /app/apps/studio/.next/standalone ./
COPY --from=builder /app/apps/studio/.next/static ./apps/studio/.next/static
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
HEALTHCHECK --interval=5s --timeout=5s --retries=3 CMD node -e "fetch('http://localhost:3000/api/platform/profile').then((r) => {if (r.status !== 200) throw new Error(r.status)})"
CMD ["node", "apps/studio/server.js"]
