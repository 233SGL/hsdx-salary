/**
 * ========================================
 * 鹤山积分管理系统 - 后端服务器
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

// 加载环境变量配置
dotenv.config({ path: '.env.server' });

const { Pool } = pg;
const app = express();

// 中间件配置
app.use(cors());        // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

/**
 * 数据库连接池配置
 * 使用 Supabase Session Pooler 连接
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/employees
 * 创建新员工
 * @body {id, name, gender, workshopId, department, position, joinDate, standardBaseScore, status, phone, expectedDailyHours}
 */
app.post('/api/employees', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO employees (id, name, gender, workshop_id, department, position, join_date, standard_base_score, status, phone, expected_daily_hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [req.body.id, req.body.name, req.body.gender, req.body.workshopId, req.body.department, req.body.position, req.body.joinDate, req.body.standardBaseScore, req.body.status, req.body.phone, req.body.expectedDailyHours]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE employees SET name=$2, gender=$3, workshop_id=$4, department=$5, position=$6, join_date=$7, standard_base_score=$8, status=$9, phone=$10, expected_daily_hours=$11 WHERE id=$1 RETURNING *',
      [req.params.id, req.body.name, req.body.gender, req.body.workshopId, req.body.department, req.body.position, req.body.joinDate, req.body.standardBaseScore, req.body.status, req.body.phone, req.body.expectedDailyHours]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
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
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM system_users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// 月度数据 API
// ========================================

/**
 * GET /api/monthly-data/:year/:month
 * 获取指定年月的月度数据
 */
app.get('/api/monthly-data/:year/:month', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM monthly_data WHERE year = $1 AND month = $2',
      [req.params.year, req.params.month]
    );
    res.json(rows[0] || null);
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

// ========================================
// 启动服务器
// ========================================

/** 服务器端口，默认 3000 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`后端服务器已启动: http://localhost:${PORT}`);
  console.log(`API 端点地址: http://localhost:${PORT}/api/*`);
});
