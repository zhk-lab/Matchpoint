# Matchpoint(寻星) V1

轻量化的 `Matchpoint(寻星)` V1 后端与网页演示，聚焦以下核心能力：

- 用户注册/登录
- 个人主页
- 师兄师姐资料入库（结构化）
- 检索增强聊天（带引用来源）
- 中央聊天网页演示

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

### 0) 准备 PostgreSQL

启动前请先确保本机已经安装并运行 PostgreSQL。

- 当前仓库没有内置 Docker 配置，也没有内存数据库模式
- `PRISMA_DATABASE_URL` 必须指向一个可连接的 PostgreSQL 实例，否则服务无法启动

### 1) 安装依赖

```bash
corepack pnpm install
```

安装完成后会自动生成 Prisma Client。

### 2) 配置环境变量

复制 `sample.env` 为 `.env`，至少配置：

- `PRISMA_DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `AI_API_KEY`（可选；未配置时聊天会使用本地 fallback）

### 3) 生成 Prisma Client 并同步数据库

```bash
corepack pnpm prisma db push
```

如果你修改了 `src/**/*.prisma`，也可以手动执行一次：

```bash
corepack pnpm build-prisma
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
