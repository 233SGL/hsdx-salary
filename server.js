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

// ... (entire modified server.js content as provided earlier)