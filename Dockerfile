# 多阶段构建 Dockerfile
# 阶段 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 阶段 2: 生产阶段
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 全局安装 serve 静态文件服务器
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动静态文件服务器
# -s: 单页应用模式，所有路由都返回 index.html
# -l: 监听端口
CMD ["serve", "-s", "dist", "-l", "3000"]

