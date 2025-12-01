<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 薪酬管理系统（React + Vite）

本项目为鹤山定型工段薪酬管理系统的前端代码，使用 React、TypeScript、Vite 与 Tailwind CSS 构建。
## Supabase 直连数据库（已配置完成）

本项目现在使用 Node.js 后端通过 Session Pooler 直连 Supabase Postgres 数据库。

### 架构说明
- **前端**：React + Vite（端口 5173 / 动态）
- **后端**：Express + pg（端口 3000）
- **数据库**：Supabase Postgres（通过 Session Pooler 连接）

### 初次设置步骤

1. **创建数据库表**（仅需执行一次）
   - 打开 Supabase 控制台 → SQL Editor
   - 复制 `init-db.sql` 的内容并执行
   - 这会创建 `employees`, `workshops`, `settings`, `system_users`, `monthly_data` 表

2. **安装依赖**
   ```bat
   npm install
   ```

3. **启动应用**
   ```bat
   npm start
   ```
   这会同时启动后端服务器（3000端口）和前端开发服务器（默认 5173，可通过 `VITE_DEV_PORT` 指定）

   或者分别启动：
   ```bat
   npm run server  # 仅后端（3000端口）
   npm run dev     # 仅前端（使用 vite.config.ts 中的端口，默认 5173）
   ```

4. **访问应用**
   打开浏览器访问 Vite 输出的 `Local:` 地址（默认 `http://localhost:5173`，若端口被占用会提示新的端口）

### 环境配置

后端配置在 `.env.server`（已配置，包含数据库连接信息）：
```
DATABASE_URL=postgresql://postgres.nihciliplwxvviaoemyf:LQYGiWHwOTDVf5CL@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
PORT=3000
```

前端调用的 API 地址默认会根据当前页面自动推断：
- 如果运行在 `localhost:5173 / 4173 / 3001` 等开发端口，会自动指向 `http://localhost:3000/api`
- 如果使用生产环境或自定义端口，则默认指向与前端同源的 `/api`

若需要覆盖默认行为，可在根目录创建 `.env` 或 `.env.local` 添加：
```
VITE_API_BASE=https://your-domain.com/api
```

### API 端点

后端提供以下 REST API：
- `GET /api/health` - 健康检查
- `GET /api/employees` - 获取所有员工
- `POST /api/employees` - 创建员工
- `PUT /api/employees/:id` - 更新员工
- `GET /api/workshops` - 获取车间
- `GET /api/settings` - 获取设置
- `PUT /api/settings` - 更新设置
- `GET /api/users` - 获取系统用户
- `GET /api/monthly-data/:year/:month` - 获取月度数据
- `POST /api/monthly-data` - 保存月度数据

### 测试连接

```bat
curl http://localhost:3000/api/health
```
应返回：`{"connected":true,"ok":true}`

### 注意事项
- `.env.server` 包含数据库密码，不要提交到 Git
- 前端通过动态 `API_BASE` 调用后端（默认指向 `http://localhost:3000/api`，也可通过 `VITE_API_BASE` 覆盖）
- 数据库密码只存在后端，前端看不到

**前置条件：** 安装 Node.js（建议 LTS）。

1. 安装依赖：
   `npm install`
2. 启动开发环境：
   `npm run dev`

访问终端输出的本地地址即可使用。

## 重要说明（登录策略）

从 v1.1 起，登录状态不再持久化到浏览器存储，刷新或重新打开页面需要重新登录（会话级）。

## 技术栈

- React 19
- TypeScript 5
- Vite 6
- Tailwind CSS（PostCSS 构建，无 CDN）

## 目录结构（部分）

```
components/      // UI 组件
contexts/        // Auth/Data 上下文
pages/           // 页面视图
services/        // 计算与数据服务
```

## 文档

详见 `API_DOCUMENTATION.md` 获取 API 与类型说明。
