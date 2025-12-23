# Docker 一键部署指南

本文档介绍如何使用 Docker 一键部署 InspireMusic 应用。

## 前置要求

- 已安装 Docker（版本 20.10+）
- 已安装 Docker Compose（版本 2.0+，或 Docker Desktop 内置）

## 技术说明

本 Docker 部署使用 Node.js 的 `serve` 静态文件服务器，支持单页应用（SPA）路由。

## 快速开始

### 方法一：使用 Docker Compose（推荐）

1. **克隆项目**（如果还没有）
   ```bash
   git clone <your-repo-url>
   cd InspireMusic
   ```

2. **一键启动**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   打开浏览器访问：http://localhost:3000

### 方法二：使用 Docker 命令

1. **构建镜像**
   ```bash
   docker build -t inspiremusic:latest .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 3000:3000 --name inspiremusic inspiremusic:latest
   ```

3. **访问应用**
   打开浏览器访问：http://localhost:3000

## 常用命令

### Docker Compose 命令

```bash
# 启动服务（后台运行）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

### Docker 命令

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs -f inspiremusic

# 停止容器
docker stop inspiremusic

# 启动容器
docker start inspiremusic

# 删除容器
docker rm inspiremusic

# 删除镜像
docker rmi inspiremusic:latest
```

## 自定义端口

如果需要修改端口，编辑 `docker-compose.yml` 文件：

```yaml
ports:
  - "8080:3000"  # 将 8080 改为你想要的端口，3000 是容器内部端口
```

然后重启服务：
```bash
docker-compose down
docker-compose up -d
```

## 生产环境部署

### 使用自定义域名

使用反向代理（如 Nginx、Caddy 或 Traefik）来处理域名和 HTTPS。

### 使用 HTTPS

推荐使用反向代理工具（如 Nginx、Caddy 或 Traefik）来处理 HTTPS。这些工具可以：
- 处理 SSL/TLS 证书
- 反向代理到 Docker 容器的 3000 端口
- 提供更高级的配置选项

### 使用环境变量

如需配置环境变量，可以在 `docker-compose.yml` 中添加：

```yaml
services:
  inspiremusic:
    # ... 其他配置
    environment:
      - NODE_ENV=production
```

## 故障排查

### 容器无法启动

1. 查看容器日志：
   ```bash
   docker-compose logs inspiremusic
   ```

2. 检查端口是否被占用：
   ```bash
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                 # Linux/Mac
   ```

### 应用无法访问

1. 确认容器正在运行：
   ```bash
   docker ps
   ```

2. 检查防火墙设置

3. 尝试访问容器内部：
   ```bash
   docker exec -it inspiremusic sh
   wget -qO- http://localhost:3000
   ```

### 构建失败

1. 清除 Docker 缓存重新构建：
   ```bash
   docker-compose build --no-cache
   ```

2. 检查网络连接（构建时需要下载依赖）

## 更新应用

1. **拉取最新代码**
   ```bash
   git pull
   ```

2. **重新构建并启动**
   ```bash
   docker-compose up -d --build
   ```

## 性能优化

### 使用构建缓存

Docker 会自动使用构建缓存，如果 `package.json` 没有变化，依赖安装步骤会被缓存，加快构建速度。

### 多阶段构建

当前 Dockerfile 已使用多阶段构建，最终镜像只包含运行所需的文件（Node.js + serve），体积更小。

### 静态文件服务器

使用 `serve` 包提供静态文件服务，支持：
- 单页应用（SPA）路由
- Gzip 压缩
- 缓存控制

## 注意事项

1. **数据持久化**：当前配置不包含数据持久化，所有数据存储在容器中，容器删除后数据会丢失。

2. **资源限制**：生产环境建议设置资源限制：
   ```yaml
   services:
     inspiremusic:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

3. **备份**：定期备份重要数据。

## 技术支持

如有问题，请提交 Issue 或联系维护者。

