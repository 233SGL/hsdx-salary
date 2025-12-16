# 鹤山积分管理系统 - 部署指南

> 本文档适合零基础用户阅读，每一步都有详细说明。

---

## 📋 目录

1. [项目简介](#项目简介)
2. [本地开发](#本地开发)
3. [Zeabur 云部署（推荐）](#zeabur-云部署推荐)
4. [Docker 部署](#docker-部署)
5. [传统服务器部署](#传统服务器部署)
6. [常见问题](#常见问题)

---

## 项目简介

### 系统架构

```
用户浏览器
    │
    ▼
┌────────────────────────────────────┐
│        Zeabur / 云服务器            │
│  ┌──────────────────────────────┐  │
│  │     Node.js 服务器            │  │
│  │  • 提供网页文件 (前端)         │  │
│  │  • 提供数据接口 (后端 API)     │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────┐
│     PostgreSQL 数据库               │
│     (Supabase 或 自建)              │
└────────────────────────────────────┘
```

### 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Vite | 用户界面 |
| 后端 | Node.js + Express | API 服务 |
| 数据库 | PostgreSQL | 数据存储 |

---

## 本地开发

> 适合开发者在自己电脑上运行和修改代码。

### 第一步：安装 Node.js

1. 访问 <https://nodejs.org/>
2. 下载 **LTS 版本**（推荐 22.x）
3. 双击安装，一路点"下一步"
4. 安装完成后，打开命令行验证：
   ```bash
   node --version
   # 应显示 v22.x.x
   ```

### 第二步：下载代码

```bash
# 方式1：使用 Git
git clone https://github.com/你的用户名/hrjf.git

# 方式2：直接下载 ZIP 并解压
```

### 第三步：安装依赖

打开命令行，进入项目目录：

```bash
cd hrjf
npm install
```

> 💡 **什么是依赖？** 就是项目运行需要的第三方库，类似于手机 App 需要的插件。

### 第四步：配置数据库连接

在项目根目录创建 `.env.server` 文件：

```env
DATABASE_URL=postgresql://用户名:密码@服务器地址:5432/数据库名
PORT=3000
```

> ⚠️ **重要**：这个文件包含密码，**不要上传到 Git**！

### 第五步：启动

```bash
npm start
```

然后打开浏览器访问：<http://localhost:5173>

---

## Zeabur 云部署（推荐）

> **Zeabur** 是一个云平台，可以自动部署你的应用，无需自己管理服务器。
> 
> ⚠️ **重要提示**：Zeabur 目前只支持从 **GitHub** 导入代码，不支持 Gitee！

### 准备工作

1. 注册 [GitHub 账号](https://github.com)
2. 将代码推送到 GitHub（见下方说明）
3. 注册 [Zeabur 账号](https://zeabur.com)

### 步骤 1：将代码推送到 GitHub

如果你的代码在 Gitee 上，需要先同步到 GitHub：

```bash
# 添加 GitHub 远程仓库
git remote add github https://github.com/你的用户名/hrjf.git

# 推送到 GitHub
git push github main
```

### 步骤 2：在 Zeabur 创建项目

1. 登录 [Zeabur 控制台](https://dash.zeabur.com)
2. 点击 **Create Project**（创建项目）
3. 选择一个区域（推荐选择离你近的）

![创建项目](https://docs.zeabur.com/assets/images/create-project-xxx.png)

### 步骤 3：添加服务

1. 在项目中点击 **Add Service**（添加服务）
2. 选择 **Git**
3. 选择你的 GitHub 仓库

Zeabur 会自动检测到 `Dockerfile`，开始构建部署。

### 步骤 4：配置环境变量 ⭐重要

> 这是最关键的一步！数据库连接信息需要在这里配置。

1. 点击你的服务
2. 进入 **Variables**（变量）标签
3. 点击 **Add Variable**（添加变量）
4. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://用户名:密码@主机:5432/数据库名` | **必填**，数据库连接地址 |

**如何获取 DATABASE_URL？**

如果你使用 Supabase：
1. 登录 [Supabase](https://supabase.com)
2. 进入项目 → Settings → Database
3. 复制 Connection String (Session Pooler)
4. 将 `[YOUR-PASSWORD]` 替换为你的数据库密码

示例：
```
postgresql://postgres.abc123:MyPassword@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### 步骤 5：等待部署完成

- 构建通常需要 2-5 分钟
- 状态变为 **Running** 表示部署成功

### 步骤 6：绑定域名

1. 进入 **Networking**（网络）标签
2. 点击 **Generate Domain**（生成域名）
3. 你会获得一个类似 `xxx.zeabur.app` 的域名
4. 或者绑定你自己的域名

### 验证部署

访问你的域名，例如：
```
https://你的应用.zeabur.app
```

检查 API 是否正常：
```
https://你的应用.zeabur.app/api/health
```

应该返回：
```json
{"connected":true,"ok":1}
```

---

## Docker 部署

> 适合有自己服务器的用户。

### 步骤 1：安装 Docker

- Windows/Mac: 下载 [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: 
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```

### 步骤 2：构建镜像

在项目目录下运行：

```bash
docker build -t heshan-hr:latest .
```

> 💡 这会根据 `Dockerfile` 创建一个应用镜像，大约需要 3-5 分钟。

### 步骤 3：运行容器

```bash
docker run -d \
  --name heshan-hr \
  -p 8080:8080 \
  -e DATABASE_URL="postgresql://用户名:密码@主机:5432/数据库名" \
  heshan-hr:latest
```

**参数说明**：
- `-d`：后台运行
- `--name heshan-hr`：容器名称
- `-p 8080:8080`：端口映射（访问服务器的 8080 端口）
- `-e DATABASE_URL="..."`：设置环境变量（**必须填写你的数据库地址**）

### 步骤 4：访问应用

打开浏览器访问：<http://服务器IP:8080>

---

## 传统服务器部署

> 适合使用传统云服务器（如阿里云 ECS、腾讯云等）的用户。

### 步骤 1：连接服务器

使用 SSH 连接你的服务器：

```bash
ssh root@你的服务器IP
```

### 步骤 2：安装 Node.js

```bash
# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

### 步骤 3：上传代码

```bash
# 在服务器上
git clone https://github.com/你的用户名/hrjf.git /var/www/heshan-hr
cd /var/www/heshan-hr
```

### 步骤 4：安装依赖并构建

```bash
npm install
npm run build
```

### 步骤 5：配置环境变量

```bash
# 创建环境变量文件
cat > .env.server << EOF
DATABASE_URL=postgresql://用户名:密码@主机:5432/数据库名
PORT=8080
NODE_ENV=production
EOF
```

### 步骤 6：使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name heshan-hr

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤 7：配置 Nginx（可选）

如果需要使用 80 端口或配置 HTTPS：

```bash
sudo apt install nginx
```

创建配置文件 `/etc/nginx/sites-available/heshan-hr`：

```nginx
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/heshan-hr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 常见问题

### Q1：部署后无法访问

**检查清单**：
1. ✅ 环境变量 `DATABASE_URL` 是否正确配置？
2. ✅ 数据库是否允许外部连接？
3. ✅ 防火墙是否开放了对应端口？

### Q2：API 返回 500 错误

这通常是数据库连接问题：

```bash
# 检查日志
# Zeabur: 在控制面板的 Logs 标签查看
# Docker: docker logs heshan-hr
# PM2: pm2 logs heshan-hr
```

### Q3：前端页面显示空白

可能是构建失败，检查 `dist` 目录是否存在。

### Q4：如何更新部署？

**Zeabur**：推送代码到 GitHub，自动重新部署

**Docker**：
```bash
docker stop heshan-hr
docker rm heshan-hr
docker build -t heshan-hr:latest .
docker run -d --name heshan-hr -p 8080:8080 -e DATABASE_URL="..." heshan-hr:latest
```

**PM2**：
```bash
git pull
npm run build
pm2 restart heshan-hr
```

---

## 相关资源

| 文档 | 说明 |
|------|------|
| [数据库迁移指南](./database/migration/MIGRATION_GUIDE.md) | 从 Supabase 迁移到其他数据库 |
| [更新日志](./docs/CHANGELOG.md) | 版本更新记录 |

---

## 需要帮助？

如果遇到问题，请提供以下信息：
1. 错误截图或日志
2. 使用的部署方式
3. 操作系统版本

---

*文档版本: 2.0*  
*更新日期: 2025-12-11*
