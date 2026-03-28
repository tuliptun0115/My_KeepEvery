# 使用極簡的 Node.js 映像檔
FROM node:20-alpine AS base

# 1. 安裝依賴
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. 建置專案
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 注意：在 Docker 中建置時，若有用到環境變數需在此配置，
# 但我們主要使用 Runtime Env，所以直接 Build (Next.js 15 支援)
RUN npm run build

# 3. 執行環境
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# 建立非 root 被使用者
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 只複製必要的產出
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
ENV PORT 8080

# 啟動命令
CMD ["node", "server.js"]
