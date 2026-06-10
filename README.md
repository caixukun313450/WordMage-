# WordMage 单词魔法师

面向小学生的 AI 情境故事英语学习 Web 原型。

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.9+

### 运行

```bash
cd WordMage
./mvnw spring-boot:run
```

Windows:

```cmd
cd WordMage
mvnw.cmd spring-boot:run
```

浏览器访问：http://localhost:8080

### 配置大模型 API（可选）

未配置 API Key 时自动进入**演示模式**，返回预设模板故事。

**智谱 AI（默认）：**

```bash
set ZHIPU_API_KEY=你的密钥
```

**通义千问：**

在 `application.properties` 中设置 `wordmage.llm.provider=qwen`，并配置：

```bash
set QWEN_API_KEY=你的密钥
```

## 功能概览

| 功能 | 说明 |
|------|------|
| 情境生成器 | 输入 1-5 个单词，大模型生成英文小故事 + 中文翻译 |
| 关键词高亮 | 故事中自动高亮输入单词 |
| 每日魔法单词 | 每天推荐 3 个词库单词 |
| 词库 | 200 个小学高频词，点击即可添加 |
| TTS 朗读 | 浏览器 SpeechSynthesis 朗读中英文 |
| 星星收集 | 每日首次生成故事获得 1 颗星 |
| 单词宝藏 | 累积 10 颗星解锁彩蛋 |
| 配对闯关 | 每生成 3 个故事触发单词配对小游戏 |
| 学习记录 | localStorage 保存历史，7 天复习列表与词频统计 |

## 项目结构

```
WordMage/
├── src/main/java/          # Spring Boot 后端（LLM 代理 API）
├── src/main/resources/
│   ├── static/             # 前端页面与静态资源
│   └── application.properties
└── docs/                   # 软件工程文档
```

## 文档

- [项目计划书](docs/01-项目计划书.md)
- [需求规格说明书](docs/02-需求规格说明书.md)
- [设计说明书](docs/03-设计说明书.md)
- [测试报告](docs/04-测试报告.md)
- [用户手册](docs/05-用户手册.md)
- [项目总结](docs/06-项目总结.md)
- [云服务器部署指南](docs/07-云服务器部署指南.md)

## 技术栈

- 后端：Spring Boot 4、Java 17
- 前端：HTML5、CSS3、原生 JavaScript
- 存储：localStorage（客户端）
- 大模型：智谱 AI GLM-4-Flash / 通义千问（可切换）
- 语音：Web Speech API
