# Karma Visual Rendering Engine
# Node + TypeScript + React (SSR markup) + ELK (graph layout) + Puppeteer (export)
# + Remotion (video render, requires Chrome Headless Shell)

FROM node:22-slim AS runner

WORKDIR /app

# Puppeteer + Remotion need shared libraries that are not present on slim images.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      chromium \
      ffmpeg \
      fonts-liberation fonts-noto-cjk fonts-dejavu-core \
      ca-certificates curl \
      libxss1 libnss3 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm1 \
      libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libcups2 \
      libpango-1.0-0 libcairo2 \
 && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    CI=true

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Download Remotion's Chrome Headless Shell into node_modules/.remotion.
RUN npx remotion browser ensure

COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY src ./src
RUN npx tsc -p tsconfig.json && cp -r src/styles dist/styles && npm prune --omit=dev --no-audit --no-fund

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server/index.js"]
