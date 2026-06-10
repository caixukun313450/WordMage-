# WordMage 公网访问脚本（无需绑卡）
# 用法：先在本机启动 WordMage，再运行此脚本

$Port = 8080
$AppUrl = "http://localhost:$Port"

Write-Host "=== WordMage 公网隧道 ===" -ForegroundColor Cyan

# 检查本地服务是否运行
try {
    $null = Invoke-WebRequest -Uri "$AppUrl/api/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "[OK] WordMage 已在 $AppUrl 运行" -ForegroundColor Green
} catch {
    Write-Host "[!] WordMage 未运行，请先在 IntelliJ 启动项目，再重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 查找 cloudflared
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    $localPath = "$PSScriptRoot\cloudflared.exe"
    if (Test-Path $localPath) {
        $cloudflared = $localPath
    } else {
        Write-Host ""
        Write-Host "未找到 cloudflared，请先安装（无需绑卡）：" -ForegroundColor Yellow
        Write-Host "  方式1: winget install Cloudflare.cloudflared"
        Write-Host "  方式2: 下载 https://github.com/cloudflare/cloudflared/releases"
        Write-Host "         将 cloudflared.exe 放到 deploy 目录"
        exit 1
    }
} else {
    $cloudflared = $cloudflared.Source
}

Write-Host ""
Write-Host "正在创建公网隧道，请稍候..." -ForegroundColor Cyan
Write-Host "成功后会出现 https://xxxx.trycloudflare.com 地址，发给同学即可访问" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 可停止隧道（本机程序不受影响）" -ForegroundColor Gray
Write-Host ""

& $cloudflared tunnel --url $AppUrl
