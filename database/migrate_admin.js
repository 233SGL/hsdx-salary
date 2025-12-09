import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.server' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        const sqlPath = path.join(process.cwd(), 'database', 'admin_tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('执行数据库迁移...');
        await pool.query(sql);
        console.log('✅ 后台管理表创建成功！');

        // 验证表是否创建
        const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('audit_logs', 'login_history', 'active_sessions')
    `);
        console.log('已创建的表:', rows.map(r => r.table_name).join(', '));

    } catch (err) {
        console.error('❌ 迁移失败:', err.message);
    } finally {
        await pool.end();
    }
}

runMigration();
