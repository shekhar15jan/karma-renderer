# Karma Visual Rendering Engine
# Node + TypeScript + React (SSR markup) + ELK (graph layout) + Puppeteer (export)

FROM node:22-slim AS runner

WORKDIR /app

# Puppeteer needs shared libraries that are not present on slim images.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation fonts-noto-cjk \
      ca-certificates curl \
      libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm1 \
      fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json && npm prune --omit=dev --no-audit --no-fund

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server/index.js"]
