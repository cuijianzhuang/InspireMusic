#!/bin/bash

# InspireMusic Docker 一键启动脚本

set -e

echo "🚀 正在启动 InspireMusic..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: 未检测到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 检查 docker-compose.yml 是否存在
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 错误: 未找到 docker-compose.yml 文件"
    exit 1
fi

# 停止并删除旧容器（如果存在）
echo "🧹 清理旧容器..."
docker-compose down 2>/dev/null || true

# 构建并启动
echo "🔨 构建镜像..."
docker-compose build

echo "🚀 启动容器..."
docker-compose up -d

# 等待容器启动
echo "⏳ 等待服务启动..."
sleep 3

# 检查容器状态
if docker-compose ps | grep -q "Up"; then
    echo "✅ InspireMusic 启动成功！"
    echo "🌐 访问地址: http://localhost:3000"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
else
    echo "❌ 启动失败，请查看日志: docker-compose logs"
    exit 1
fi

