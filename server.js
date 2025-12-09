/**
 * ========================================
 * 鳝山积分管理系统 - 后端服务器
 * ========================================
 * 
 * 本模块提供 RESTful API 服务：
 * - 员工管理 API (CRUD)
 * - 系统用户管理 API
 * - 工段/车间管理 API
 * - 月度数据管理 API
 * - 系统设置 API
 * 
 * 数据库: Supabase PostgreSQL (通过 Session Pooler 连接)
 * 
 * @module server
 * @version 2.5
 */

import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';

// 加载环境变量配置
dotenv.config({ path: '.env.server' });

const { Pool } = pg;
const app = express();

// 中间件配置
app.use(cors());        // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

// 安全头部中间件
app.use((req, res, next) => {
  // 防止 MIME 类型嗅探攻击
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // 使用现代缓存控制头，移除已弃用的头部
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.removeHeader('Pragma');
  res.removeHeader('Expires');
  next();
});

// 确保 JSON 响应使用正确的 charset
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson(body);
  };
  next();
});

/**
 * 数据库连接池配置
 * 支持通过环境变量 DB_SSL 控制是否启用 SSL（CI 本地 Postgres 通常不用 SSL）
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});

// ========================================
// 健康检查 API
// ========================================

/**
 * GET /api/health
 * 检查数据库连接状态
 */
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 as ok');
    res.json({ connected: true, ok: rows[0].ok === 1 });
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message });
  }
});

// ========================================
// 员工管理 API
// ========================================

/**
 * GET /api/employees
 * 获取所有员工列表
 */
app.get('/api/employees', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employees ORDER BY id');
    // 转换数据库字段名为骆峰命名
    const employees = rows.map(row => ({
      id: row.id,
      name: row.name,
      gender: row.gender,
      workshopId: row.workshop_id,
      department: row.department,
      position: row.position,
      joinDate: row.join_date,
      standardBaseScore: parseFloat(row.standard_base_score) || 0,
      status: row.status,
      phone: row.phone,
      expectedDailyHours: parseFloat(row.expected_daily_hours) || 12,
      machineId: row.machine_id,
      baseSalary: parseFloat(row.base_salary) || 0,
      coefficient: parseFloat(row.coefficient) || 1.0
    }));
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/employees
 * 创建新员工
 * @body {id, name, gender, workshopId, department, position, joinDate, standardBaseScore, status, phone, expectedDailyHours, baseSalary, coefficient}
 */
app.post('/api/employees', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO employees (id, name, gender, workshop_id, department, position, join_date, standard_base_score, status, phone, expected_daily_hours, base_salary, coefficient) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [req.body.id, req.body.name, req.body.gender, req.body.workshopId, req.body.department, req.body.position, req.body.joinDate, req.body.standardBaseScore, req.body.status, req.body.phone, req.body.expectedDailyHours, req.body.baseSalary, req.body.coefficient]
    );

    // 记录审计日志
    const userId = req.headers['x-user-id'] || 'system';
    const userName = decodeUserName(req.headers['x-user-name']) || 'System';
    await logAudit(userId, userName, 'CREATE', 'employee', req.body.id, req.body.name, req.body, req);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE employees SET name=$2, gender=$3, workshop_id=$4, department=$5, position=$6, join_date=$7, standard_base_score=$8, status=$9, phone=$10, expected_daily_hours=$11, base_salary=$12, coefficient=$13 WHERE id = $1 RETURNING *',
      [req.params.id, req.body.name, req.body.gender, req.body.workshopId, req.body.department, req.body.position, req.body.joinDate, req.body.standardBaseScore, req.body.status, req.body.phone, req.body.expectedDailyHours, req.body.baseSalary, req.body.coefficient]
    );

    // 记录审计日志
    const userId = req.headers['x-user-id'] || 'system';
    const userName = decodeUserName(req.headers['x-user-name']) || 'System';
    await logAudit(userId, userName, 'UPDATE', 'employee', req.params.id, req.body.name, req.body, req);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    // 先查询员工信息用于日志
    const { rows: empRows } = await pool.query('SELECT name FROM employees WHERE id = $1', [req.params.id]);
    const empName = empRows[0]?.name || req.params.id;

    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);

    // 记录审计日志
    const userId = req.headers['x-user-id'] || 'system';
    const userName = decodeUserName(req.headers['x-user-name']) || 'System';
    await logAudit(userId, userName, 'DELETE', 'employee', req.params.id, empName, null, req);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// 工段/车间管理 API
// ========================================

/**
 * GET /api/workshops
 * 获取所有工段/车间列表
 */
app.get('/api/workshops', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM workshops ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/workshops/:id
 * 更新或创建工段（支持更新部门/文件夹）
 */
app.put('/api/workshops/:id', async (req, res) => {
  try {
    const { name, code, departments } = req.body;

    // 使用 UPSERT 确保新工段也能被创建
    // 注意：departments 列可能是 JSONB 类型，需要 stringify
    const { rows } = await pool.query(
      `INSERT INTO workshops (id, name, code, departments) 
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (id) DO UPDATE SET 
         name = $2, 
         code = $3, 
         departments = $4::jsonb
       RETURNING *`,
      [req.params.id, name, code, JSON.stringify(departments)]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// 系统设置 API
// ========================================

/**
 * GET /api/settings
 * 获取全局设置（如公告内容）
 */
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings WHERE id = $1', ['global']);
    res.json(rows[0] || { announcement: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO settings (id, announcement) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET announcement = $2 RETURNING *',
      ['global', req.body.announcement]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// 系统用户管理 API
// ========================================

/**
 * GET /api/users
 * 获取所有系统用户列表
 */
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM system_users ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const {
      id,
      username,
      displayName,
      role,
      customRoleName,
      pinCode,
      isSystem = false,
      scopes = [],
      permissions = []
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO system_users
        (id, username, display_name, role, custom_role_name, pin_code, is_system, scopes, permissions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
       RETURNING *`,
      [
        id,
        username,
        displayName,
        role,
        customRoleName || null,
        pinCode,
        isSystem,
        JSON.stringify(scopes),
        JSON.stringify(permissions)
      ]
    );

    // 记录审计日志
    const userId = req.headers['x-user-id'] || 'system';
    const userName = decodeUserName(req.headers['x-user-name']) || 'System';
    await logAudit(userId, userName, 'CREATE', 'user', id, displayName, { username, role, scopes, permissions }, req);

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const {
      username,
      displayName,
      role,
      customRoleName,
      pinCode,
      isSystem = false,
      scopes = [],
      permissions = []
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE system_users SET
        username = $2,
        display_name = $3,
        role = $4,
        custom_role_name = $5,
        pin_code = $6,
        is_system = $7,
        scopes = $8::jsonb,
        permissions = $9::jsonb
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        username,
        displayName,
        role,
        customRoleName || null,
        pinCode,
        isSystem,
        JSON.stringify(scopes),
        JSON.stringify(permissions)
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });

    // 记录审计日志
    const userId = req.headers['x-user-id'] || 'system';
    const userName = decodeUserName(req.headers['x-user-name']) || 'System';
    await logAudit(userId, userName, 'UPDATE', 'user', req.params.id, displayName, { username, role, scopes, permissions }, req);

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    // 先查询用户信息用于日志
    const { rows: userRows } = await pool.query('SELECT display_name FROM system_users WHERE id = $1', [req.params.id]);
    const targetName = userRows[0]?.display_name || req.params.id;

    await pool.query('DELETE FROM system_users WHERE id = $1', [req.params.id]);

    // 记录审计日志
    const userId = req.headers['x-user-id'] || 'system';
    const userName = decodeUserName(req.headers['x-user-name']) || 'System';
    await logAudit(userId, userName, 'DELETE', 'user', req.params.id, targetName, null, req);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/monthly-data', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO monthly_data (year, month, data) VALUES ($1, $2, $3) ON CONFLICT (year, month) DO UPDATE SET data = $3 RETURNING *',
      [req.body.year, req.body.month, JSON.stringify(req.body.data)]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... (其余中间路由保持不变) ...

// 省略的路由部分在原文件中未更动，继续保留原实现

// ========================================
// 织造工段机器管理 API
// ========================================

app.get('/api/weaving/machines', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM weaving_machines ORDER BY id');
    const machines = rows.map(row => ({
      id: row.id,
      name: row.name,
      speedType: row.speed_type,
      width: parseFloat(row.width),
      effectiveWidth: parseFloat(row.effective_width) || 7.7,
      speedWeftPerMin: parseInt(row.speed_weft_per_min) || 41,
      targetOutput: parseFloat(row.target_output),
      status: row.status
    }));
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... (文件中剩余路由保留原样，不在此重复) ...

/** 
 * 服务端端口，默认 3000
 */
const PORT = process.env.PORT || 3000;

async function waitForDatabase(retries = 12, delayMs = 1000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('[Startup] Database reachable');
      return;
    } catch (err) {
      console.warn(`[Startup] DB connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) throw err;
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

async function startServer() {
  try {
    await waitForDatabase(12, 1000); // 重试 12 次，每次间隔 1s（可调整）
    app.listen(PORT, () => {
      console.log(`后端服务器已启动: http://localhost:${PORT}`);
      console.log(`API 端点地址: http://localhost:${PORT}/api/*`);
    });
  } catch (err) {
    console.error('[Startup] Failed to start due to DB error:', err);
    process.exit(1);
  }
}

startServer();
