# 积分计算系统交接说明

> 📅 编写日期：2025年12月11日

---

## 一、系统现状

### 1.1 当前线上地址

| 项目 | 地址 |
|------|------|
| **系统访问地址** | https://hsdx-salary.zeabur.app/ |
| **源代码仓库** | https://gitee.com/HR_17/hrjf.git |

### 1.2 使用的云服务

| 服务 | 账号类型 | 状态 |
|------|----------|------|
| **Supabase** (数据库) | 个人账号免费额度 |正常 |
| **Zeabur** (网站托管) | 个人账户免费额度 | 正常 |
| **Gitee** (代码仓库) | 江门鸿荣纺织企业账户 | 正常 |

---

## 二、交接方式（二选一）

### 方式 A：Gitee 账户移交

如果接手人有 Gitee 账号，我可以将账号所有权移交给他。

**操作步骤：**
1. 我邀请接手人加入企业账户
2. 我将企业账户转移给接手人
3. 确认后，接手人变更为企业账户所有人

### 方式 B：新建 GitHub 仓库（推荐）

如果不使用企业 Gitee 账户，推荐创建 GitHub 仓库。

**为什么推荐 GitHub？**
- Zeabur 网站托管平台**支持从 GitHub 导入代码**
- GitHub 是全球最大的代码托管平台，更方便协作

**操作步骤：**
1. 注册 [GitHub 账号](https://github.com)
2. 创建新仓库
3. 将源代码上传到新仓库
4. 在 Zeabur 中连接新的 GitHub 仓库
5. 确认后我将删除企业 Gitee 账户，不再占用公司名

---

## 三、数据库迁移指南

### 3.1 为什么需要迁移？

当前使用的是我个人的 Supabase 账号

| 选项 | 费用 | 建议 |
|------|------|------|
| **Supabase 付费版** | 不同存储空间价格不同 | 数据量大时推荐 |
| **新建免费 Supabase** | 免费 | 数据量小可选 |
| **自建 PostgreSQL** | 服务器费用 | 技术人员推荐 |

### 3.2 如何迁移数据库？

详细步骤请参阅：**[数据库迁移指南](./database/migration/MIGRATION_GUIDE.md)**

简要流程：

```
1. 从旧数据库导出数据
   └── 使用 migration-export-data.sql 脚本（可省略，旧数据库基本为测试数据）

2. 创建新数据库
   └── 在新的 Supabase 项目或 PostgreSQL 中执行 migration-full.sql

3. 导入数据到新数据库

4. 更新 Zeabur 环境变量
   └── 将 DATABASE_URL 改为新数据库地址
```

### 3.3 迁移所需文件

所有迁移脚本都在代码仓库的 `database/migration/` 目录中：

| 文件 | 用途 |
|------|------|
| `migration-full.sql` | 创建全部表结构 |
| `migration-export-data.sql` | 导出现有数据 |
| `MIGRATION_GUIDE.md` | 详细迁移说明 |

---

## 四、部署说明

### 4.1 Zeabur 平台操作

**登录地址**：https://dash.zeabur.com

**常用操作：**

| 操作 | 位置 |
|------|------|
| 查看运行状态 | 项目首页 |
| 修改环境变量 | 编辑原始环境变量 |
| 查看日志 | runtimeLogs 标签 |
| 手动重新部署 | 重新部署按钮 |

### 4.2 环境变量说明

在 Zeabur 中需要配置的环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接地址 | `postgresql://用户名:密码@主机:5432/数据库名` |

**如何修改？**
1. 进入 Zeabur 控制面板
2. 点击你的项目
3. 点击环境变量
4. 编辑原始环境变量
5. 再最后添加 DATABASE_URL=postgresql://用户名:密码@主机:5432/数据库名

### 4.3 完整部署文档

详细部署说明请参阅：**[部署指南](./docs/DEPLOYMENT_GUIDE.md)**

---

## 五、技术文档清单

代码仓库中包含以下文档：

| 文档路径 | 内容 |
|----------|------|
| `docs/DEPLOYMENT_GUIDE.md` | 部署指南（本地开发、Zeabur、Docker） |
| `docs/CHANGELOG.md` | 版本更新记录 |
| `database/migration/MIGRATION_GUIDE.md` | 数据库迁移指南 |
| `database/migration/migration-full.sql` | 数据库完整结构脚本 |
| `database/migration/migration-export-data.sql` | 数据导出脚本 |

---

## 六、紧急联系

如果遇到以下情况，请及时处理：

| 情况 | 解决方案 |
|------|----------|
| 网站无法访问 | 检查 Zeabur 服务状态，查看 Logs |
| 数据库连接失败 | 检查 DATABASE_URL 是否正确 |

---

## 七、交接确认清单

请接手人确认以下事项：

- [ ] 已获取代码仓库访问权限
- [ ] 已了解 Zeabur 控制面板操作
- [ ] 已阅读数据库迁移指南
- [ ] 已阅读部署指南

---

## 八、附录：快速操作指南

### 如何查看系统是否正常运行？

访问：https://hsdx-salary.zeabur.app/api/health

正常返回：
```json
{"connected":true,"ok":1}
```

### 如何重启系统？

1. 登录 Zeabur 控制面板
2. 找到项目
3. 点击右上角 **Redeploy**

### 如何查看错误日志？

1. 登录 Zeabur 控制面板
2. 点击项目
3. 进入 **日志** 标签

---

*如有疑问，请联系原开发人员。*
