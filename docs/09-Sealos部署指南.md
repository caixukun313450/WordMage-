# Sealos 部署 WordMage 步骤

你的 Sealos 控制台：https://hzh.sealos.run

---

## 第一步：推送 GitHub Actions（自动构建镜像）

在项目目录 PowerShell 执行：

```powershell
cd D:\WordMage\WordMage
git add .
git commit -m "添加 Docker 自动构建"
git push
```

然后打开 GitHub → 你的仓库 `WordMage-` → **Actions** 标签，等绿色 ✓ 构建完成（约 3–5 分钟）。

### 把镜像设为公开（重要）

1. GitHub → 右上角头像 → **Your packages**
2. 找到 **wordmage** 包
3. **Package settings** → **Change visibility** → **Public**

---

## 第二步：在 Sealos 部署

### 1. 打开应用管理

在 Sealos 桌面点击 **应用管理**（紫色火箭图标）

### 2. 新建应用

点 **创建应用** / **新建应用**

### 3. 填写基本信息

| 字段 | 填什么 |
|------|--------|
| 应用名称 | `wordmage` |
| 镜像名 | `ghcr.io/caixukun313450/wordmage:latest` |
| CPU | `0.5` 核 |
| 内存 | `1 GB`（Java 至少需要 512MB，建议 1G） |
| 副本数 | `1` |

### 4. 网络配置

- 点击 **网络配置** 或 **端口**
- 添加端口：**8080**
- 开启 **公网访问** / **外网访问**
- 打开后会自动分配固定域名，形如：`https://wordmage-xxx.hzh.sealos.run`

### 5. 环境变量

在 **环境变量** 里添加：

| 名称 | 值 |
|------|-----|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `ZHIPU_API_KEY` | 你的智谱 API Key |

### 6. 创建并等待

点 **创建** / **部署**，等状态变为 **运行中**（约 1–2 分钟）

### 7. 访问

在应用详情页复制 **公网地址**，浏览器打开即可。

---

## 费用说明

- 你账户有 **5 元** 体验余额
- WordMage 这种小应用，按量计费大约 **几毛钱/天**
- 不用时在应用管理里 **暂停** 或 **删除**，避免继续扣费

---

## 常见问题

| 问题 | 解决 |
|------|------|
| 镜像拉取失败 | 确认 GitHub Packages 已设为 Public |
| 启动后崩溃 | 内存调到 1GB |
| 演示模式 | 检查 `ZHIPU_API_KEY` 环境变量 |
| 更新代码 | push 到 GitHub → Actions 构建完 → Sealos 点重新部署 |
