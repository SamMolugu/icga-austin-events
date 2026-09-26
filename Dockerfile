FROM node:24-bookworm-slim AS deps
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY artifacts/event-platform/package.json artifacts/event-platform/package.json
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/db/package.json lib/db/package.json
COPY scripts/package.json scripts/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ENV PORT=5000
ENV BASE_PATH=/
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ARG VITE_CLERK_PROXY_URL=""
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PROXY_URL=$VITE_CLERK_PROXY_URL
RUN pnpm --filter @workspace/api-spec run codegen \
  && pnpm --filter @workspace/api-server run build \
  && pnpm --filter @workspace/event-platform run build

FROM build AS migrate
CMD ["pnpm", "--filter", "@workspace/db", "run", "push-force"]

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV CLIENT_DIST=/app/client
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build --chown=node:node /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=build --chown=node:node /app/artifacts/event-platform/dist/public ./client
COPY --from=build --chown=node:node /app/lib/api-zod ./lib/api-zod
COPY --from=build --chown=node:node /app/lib/db ./lib/db
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
