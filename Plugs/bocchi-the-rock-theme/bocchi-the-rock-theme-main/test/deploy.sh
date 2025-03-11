#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="测试应用"
DEPLOY_DIR="/var/www/app"
BACKUP_DIR="/var/backups"
LOG_FILE="/var/log/deploy.log"

# 日志函数
log() {
    local message=$1
    local level=${2:-INFO}
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] [${level}] ${message}" | tee -a "$LOG_FILE"
}

# 错误处理
set -e
trap 'log "部署失败: $?" ERROR' ERR

# 主函数
main() {
    log "开始部署 ${APP_NAME}..."

    # 检查必要条件
    if ! command -v node &> /dev/null; then
        log "Node.js 未安装" "ERROR"
        exit 1
    fi

    # 备份当前版本
    if [ -d "$DEPLOY_DIR" ]; then
        backup_name="backup_$(date +%Y%m%d_%H%M%S)"
        log "创建备份: ${backup_name}" "INFO"
        tar -czf "${BACKUP_DIR}/${backup_name}.tar.gz" -C "$DEPLOY_DIR" .
    fi

    # 部署新版本
    log "拉取最新代码..."
    git pull origin main

    log "安装依赖..."
    for cmd in "npm install" "npm run build"; do
        if ! eval "$cmd"; then
            log "命令失败: ${cmd}" "ERROR"
            exit 1
        fi
    done

    # 重启服务
    log "重启服务..."
    if pm2 restart "$APP_NAME"; then
        log "部署完成" "SUCCESS"
    else
        log "服务重启失败" "ERROR"
        exit 1
    fi
}

# 执行主函数
main "$@" 