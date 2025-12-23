@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 正在启动 InspireMusic...

:: 检查 Docker 是否安装
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Docker，请先安装 Docker Desktop
    pause
    exit /b 1
)

:: 检查 Docker Compose 是否可用
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ 错误: 未检测到 Docker Compose
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker-compose
) else (
    set COMPOSE_CMD=docker compose
)

:: 检查 docker-compose.yml 是否存在
if not exist "docker-compose.yml" (
    echo ❌ 错误: 未找到 docker-compose.yml 文件
    pause
    exit /b 1
)

:: 停止并删除旧容器（如果存在）
echo 🧹 清理旧容器...
%COMPOSE_CMD% down 2>nul

:: 构建并启动
echo 🔨 构建镜像...
%COMPOSE_CMD% build

echo 🚀 启动容器...
%COMPOSE_CMD% up -d

:: 等待容器启动
echo ⏳ 等待服务启动...
timeout /t 3 /nobreak >nul

:: 检查容器状态
%COMPOSE_CMD% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ InspireMusic 启动成功！
    echo 🌐 访问地址: http://localhost:3000
    echo.
    echo 常用命令:
    echo   查看日志: %COMPOSE_CMD% logs -f
    echo   停止服务: %COMPOSE_CMD% down
    echo   重启服务: %COMPOSE_CMD% restart
) else (
    echo ❌ 启动失败，请查看日志: %COMPOSE_CMD% logs
)

pause

