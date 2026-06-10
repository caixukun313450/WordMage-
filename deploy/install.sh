#!/bin/bash
# WordMage 一键部署脚本（Ubuntu 22.04 / Oracle Cloud 等 Linux VPS）
set -e

APP_DIR="/opt/wordmage"
REPO_URL="${1:-}"

echo "=== WordMage 部署脚本 ==="

# 1. 安装 Docker
if ! command -v docker &> /dev/null; then
    echo ">>> 安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 2. 安装 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo ">>> 安装 Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# 3. 获取代码
if [ -n "$REPO_URL" ]; then
    rm -rf "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
else
    mkdir -p "$APP_DIR"
    echo ">>> 请将项目文件上传到 $APP_DIR（或使用 git clone 作为参数）"
    exit 1
fi

cd "$APP_DIR"

# 4. 配置 API Key
if [ ! -f .env ]; then
    echo ">>> 创建 .env 文件..."
    cp .env.example .env
    echo ""
    echo "请编辑 $APP_DIR/.env 填入 ZHIPU_API_KEY，然后重新运行："
    echo "  nano $APP_DIR/.env"
    echo "  cd $APP_DIR && docker compose up -d --build"
    exit 0
fi

# 5. 构建并启动
echo ">>> 构建并启动容器..."
docker compose up -d --build

# 6. 开放防火墙
if command -v ufw &> /dev/null; then
    ufw allow 8080/tcp || true
fi

echo ""
echo "=== 部署完成 ==="
echo "访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo '你的公网IP'):8080"
echo "查看日志: cd $APP_DIR && docker compose logs -f"
