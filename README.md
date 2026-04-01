# Matchpoint(寻星) (V1)

轻量化的 Matchpoint V1 后端与网页演示，聚焦以下核心能力：

- 用户注册/登录
- 个人主页
- 师兄师姐资料入库（结构化）
- 检索增强聊天（带引用来源）
- 中央聊天框网页演示

## 项目结构

```text
src/
  aipioneer/
    auth/
    profile/
    knowledge/
    chat/
    aipioneer.prisma
  common/prisma/
  app.module.ts
  app.prisma
  main.ts
web/
  index.html
  style.css
  app.js
prisma/
  schema.prisma
```

## 快速启动

### 1) 安装依赖

```bash
corepack pnpm install
```

### 2) 配置环境变量

复制 `sample.env` 为 `.env`，至少配置：

- `PRISMA_DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `AI_API_KEY`（可选；未配置时聊天会使用本地 fallback）

### 3) 生成 Prisma Client 并同步数据库

```bash
corepack pnpm build-prisma
corepack pnpm prisma db push
```

### 4) 启动服务

```bash
corepack pnpm start:dev
```

浏览器访问：`http://localhost:3000`

## API 路径

- 基础前缀：`/api/v1`
- 鉴权：`/api/v1/auth/*`
- 个人主页：`/api/v1/profile/*`
- 资料库：`/api/v1/knowledge/*`
- 聊天：`/api/v1/chat/*`
