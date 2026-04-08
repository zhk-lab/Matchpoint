<p align="center">
  <img src="./logo.jpg" alt="Matchpoint(寻星) logo" width="280" />
</p>

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

### 5) 常用开发命令

```bash
# 查看当前开发服务是否仍占用端口
corepack pnpm status:dev

# 干净关闭开发服务（适合 Windows 下 watch 子进程残留的情况）
corepack pnpm stop:dev

# 先清理旧进程，再启动开发服务
corepack pnpm start:dev:clean

# 一键写入 20 条模拟学长学姐数据（画像 + 经验）
corepack pnpm seed:mock
```

说明：

- 正常关闭仍然建议在运行中的终端里按 `Ctrl + C`
- 如果浏览器还能打开 `http://localhost:3000`，说明端口上还有残留进程，执行 `corepack pnpm stop:dev` 即可

## API 路径

- 基础前缀：`/api/v1`
- 鉴权：`/api/v1/auth/*`
- 个人主页：`/api/v1/profile/*`
- 资料库：`/api/v1/knowledge/*`
- 聊天：`/api/v1/chat/*`
