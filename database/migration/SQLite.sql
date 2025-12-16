-- ========================================
-- 鹤山积分管理系统 - SQLite 迁移脚本
-- ========================================
-- 目标: SQLite (兼容版)
-- 版本: 1.0
-- ========================================

PRAGMA foreign_keys = ON; -- 开启外键约束支持

-- ========================================
-- 第一部分: 清理旧结构
-- ========================================

DROP VIEW IF EXISTS v_monthly_production;
DROP VIEW IF EXISTS v_machine_monthly_summary;

DROP TABLE IF EXISTS weaving_production_records;
DROP TABLE IF EXISTS weaving_monthly_data;
DROP TABLE IF EXISTS weaving_monthly_summary;
DROP TABLE IF EXISTS weaving_products;
DROP TABLE IF EXISTS weaving_machines;
DROP TABLE IF EXISTS weaving_employees;
DROP TABLE IF EXISTS weaving_config;
DROP TABLE IF EXISTS active_sessions;
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS monthly_data;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS system_users;
DROP TABLE IF EXISTS workshops;

-- ========================================
-- 第二部分: 基础表结构
-- ========================================

-- 1. 工段/车间表
CREATE TABLE IF NOT EXISTS workshops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    departments TEXT, -- JSON Array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 员工表（定型工段）
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    workshop_id TEXT REFERENCES workshops(id),
    department TEXT,
    position TEXT,
    join_date TEXT, -- SQLite日期存为字符串 YYYY-MM-DD
    standard_base_score REAL DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'probation', 'leave', 'terminated')),
    phone TEXT,
    expected_daily_hours REAL DEFAULT 12,
    machine_id TEXT,
    base_salary REAL DEFAULT 0,
    coefficient REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_workshop ON employees(workshop_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- 3. 系统用户表
CREATE TABLE IF NOT EXISTS system_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    custom_role_name TEXT,
    pin_code TEXT NOT NULL,
    is_system INTEGER DEFAULT 0, -- Boolean: 0=false, 1=true
    scopes TEXT DEFAULT '[]',    -- JSON Array
    permissions TEXT DEFAULT '[]', -- JSON Array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_users_username ON system_users(username);

-- 4. 系统设置表
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    announcement TEXT,
    config TEXT, -- JSON Object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 月度数据表（定型工段）
CREATE TABLE IF NOT EXISTS monthly_data (
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    data TEXT NOT NULL, -- JSON Object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_data_year_month ON monthly_data(year, month);

-- ========================================
-- 第三部分: 后台管理表
-- ========================================

-- 6. 操作日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- 替换 SERIAL
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    target_name TEXT,
    details TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 7. 登录历史表
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);

-- 8. 在线会话表
CREATE TABLE IF NOT EXISTS active_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON active_sessions(last_activity);

-- ========================================
-- 第四部分: 织造工段表
-- ========================================

-- 9. 织造工段员工表
CREATE TABLE IF NOT EXISTS weaving_employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')),
    position TEXT NOT NULL CHECK (position IN ('admin_leader', 'admin_member', 'operator')),
    coefficient REAL DEFAULT 1.0,
    join_date TEXT, -- YYYY-MM-DD
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'probation', 'leave', 'terminated')),
    notes TEXT,
    machine_id TEXT,
    team TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weaving_employees_position ON weaving_employees(position);

-- 10. 织造工段机台表
CREATE TABLE IF NOT EXISTS weaving_machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    speed_type TEXT NOT NULL CHECK (speed_type IN ('H2', 'H5')),
    width REAL NOT NULL DEFAULT 8.5,
    effective_width REAL DEFAULT 7.7,
    speed_weft_per_min INTEGER DEFAULT 41,
    target_output REAL NOT NULL DEFAULT 6450,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'threading', 'maintenance', 'idle')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. 网种/产品表
CREATE TABLE IF NOT EXISTS weaving_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weft_density REAL NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1, -- Boolean
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weaving_products_active ON weaving_products(is_active);

-- 12. 织造工段配置表
CREATE TABLE IF NOT EXISTS weaving_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    net_formation_benchmark REAL DEFAULT 68,
    operation_rate_benchmark REAL DEFAULT 72,
    target_equivalent_output REAL DEFAULT 6450,
    operator_quota REAL DEFAULT 24,
    avg_target_bonus REAL DEFAULT 4000,
    admin_team_size REAL DEFAULT 3,
    operation_rate_bonus_unit REAL DEFAULT 500,
    leader_coef REAL DEFAULT 1.3,
    member_coef REAL DEFAULT 1.0,
    leader_base_salary REAL DEFAULT 3500,
    member_base_salary REAL DEFAULT 2500,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. 织造工段月度汇总表
CREATE TABLE IF NOT EXISTS weaving_monthly_summary (
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_nets INTEGER DEFAULT 0,
    total_length REAL DEFAULT 0,
    total_area REAL DEFAULT 0,
    equivalent_output REAL DEFAULT 0,
    net_formation_rate REAL,
    operation_rate REAL,
    active_machines INTEGER,
    actual_operators INTEGER,
    calculation_snapshot TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (year, month)
);

-- 14. 织造工段月度核算数据表
CREATE TABLE IF NOT EXISTS weaving_monthly_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_area REAL DEFAULT 0,
    equivalent_output REAL DEFAULT 0,
    total_nets INTEGER DEFAULT 0,
    qualified_nets INTEGER DEFAULT 0,
    total_bonus REAL DEFAULT 0,
    per_sqm_bonus REAL DEFAULT 0,
    admin_team_bonus REAL DEFAULT 0,
    is_confirmed INTEGER DEFAULT 0,
    confirmed_at DATETIME,
    confirmed_by VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);

CREATE INDEX IF NOT EXISTS idx_weaving_monthly_data_year_month ON weaving_monthly_data(year, month);

-- 15. 生产记录表
CREATE TABLE IF NOT EXISTS weaving_production_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    production_date TEXT NOT NULL, -- YYYY-MM-DD
    start_time DATETIME,
    end_time DATETIME,
    machine_id TEXT NOT NULL REFERENCES weaving_machines(id),
    product_id TEXT REFERENCES weaving_products(id),
    length REAL NOT NULL,
    machine_width REAL,
    weft_density REAL,
    speed_type TEXT,
    actual_area REAL,
    output_coef REAL,
    width_coef REAL,
    speed_coef REAL,
    equivalent_output REAL,
    quality_grade TEXT DEFAULT 'A',
    is_qualified INTEGER DEFAULT 1, -- Boolean
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_production_date ON weaving_production_records(year, month, production_date);
CREATE INDEX IF NOT EXISTS idx_production_machine ON weaving_production_records(machine_id);

-- ========================================
-- 第五部分: 触发器 (Trigger)
-- ========================================

-- 注意：SQLite 需要为每个表单独定义更新 updated_at 的触发器

-- 1. Workshops 触发器
CREATE TRIGGER update_workshops_timestamp AFTER UPDATE ON workshops
BEGIN
    UPDATE workshops SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 2. Employees 触发器
CREATE TRIGGER update_employees_timestamp AFTER UPDATE ON employees
BEGIN
    UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 3. System Users 触发器
CREATE TRIGGER update_system_users_timestamp AFTER UPDATE ON system_users
BEGIN
    UPDATE system_users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 4. Settings 触发器
CREATE TRIGGER update_settings_timestamp AFTER UPDATE ON settings
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 5. Monthly Data 触发器
CREATE TRIGGER update_monthly_data_timestamp AFTER UPDATE ON monthly_data
BEGIN
    UPDATE monthly_data SET updated_at = CURRENT_TIMESTAMP WHERE year = OLD.year AND month = OLD.month;
END;

-- 6. Weaving Employees 触发器
CREATE TRIGGER weaving_employees_update_timestamp AFTER UPDATE ON weaving_employees
BEGIN
    UPDATE weaving_employees SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 7. Weaving Machines 触发器
CREATE TRIGGER update_weaving_machines_timestamp AFTER UPDATE ON weaving_machines
BEGIN
    UPDATE weaving_machines SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 8. Weaving Config 触发器
CREATE TRIGGER update_weaving_config_timestamp AFTER UPDATE ON weaving_config
BEGIN
    UPDATE weaving_config SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- 9. Weaving Monthly Summary 触发器
CREATE TRIGGER update_weaving_monthly_summary_timestamp AFTER UPDATE ON weaving_monthly_summary
BEGIN
    UPDATE weaving_monthly_summary SET updated_at = CURRENT_TIMESTAMP WHERE year = OLD.year AND month = OLD.month;
END;

-- 10. Weaving Monthly Data 触发器
CREATE TRIGGER update_weaving_monthly_data_timestamp AFTER UPDATE ON weaving_monthly_data
BEGIN
    UPDATE weaving_monthly_data SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- ========================================
-- 核心逻辑: 生产记录自动计算触发器 (SQLite版)
-- ========================================
-- SQLite 不支持 PL/pgSQL 函数，这里使用 AFTER INSERT 触发器进行级联更新
-- 警告：如果后端逻辑复杂，建议在 Application 层（代码层）处理此逻辑，而不是依赖数据库触发器

CREATE TRIGGER trg_calculate_equivalent_after_insert
AFTER INSERT ON weaving_production_records
BEGIN
    UPDATE weaving_production_records
    SET 
        -- 1. 获取机台宽度
        machine_width = (SELECT width FROM weaving_machines WHERE id = NEW.machine_id),
        -- 2. 获取机台速度类型
        speed_type = (SELECT speed_type FROM weaving_machines WHERE id = NEW.machine_id),
        -- 3. 获取/计算纬密 (优先用产品表，否则用默认)
        weft_density = COALESCE(
            (SELECT weft_density FROM weaving_products WHERE id = NEW.product_id),
            NEW.weft_density,
            13
        ),
        -- 4. 计算速度系数 (H5=0.56, 其它=1.0)
        speed_coef = CASE (SELECT speed_type FROM weaving_machines WHERE id = NEW.machine_id)
            WHEN 'H5' THEN 0.56 
            ELSE 1.0 
        END,
        -- 5. 计算面积
        actual_area = NEW.length * (SELECT width FROM weaving_machines WHERE id = NEW.machine_id),
        -- 6. 计算产量系数
        output_coef = COALESCE(
            (SELECT weft_density FROM weaving_products WHERE id = NEW.product_id),
            NEW.weft_density, 13
        ) / 13.0,
        -- 7. 计算宽度系数
        width_coef = 8.5 / (SELECT width FROM weaving_machines WHERE id = NEW.machine_id)
    WHERE id = NEW.id;

    -- 第二步：计算最终等效产量 (依赖上面的更新，但SQLite不支持在同一个UPDATE引用更新后的值，所以再次执行)
    UPDATE weaving_production_records
    SET equivalent_output = actual_area * output_coef * width_coef * speed_coef
    WHERE id = NEW.id;
END;

-- ========================================
-- 第六部分: 视图
-- ========================================

-- 月度生产汇总视图
CREATE VIEW v_monthly_production AS
SELECT 
    year,
    month,
    COUNT(*) as total_nets,
    SUM(length) as total_length,
    SUM(actual_area) as total_area,
    SUM(equivalent_output) as total_equivalent,
    SUM(CASE WHEN is_qualified = 1 THEN 1 ELSE 0 END) as qualified_nets, -- SQLite 兼容写法
    ROUND(CAST(SUM(CASE WHEN is_qualified = 1 THEN 1 ELSE 0 END) AS REAL) / NULLIF(COUNT(*), 0) * 100, 2) as net_formation_rate
FROM weaving_production_records
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- 机台月度汇总视图
CREATE VIEW v_machine_monthly_summary AS
SELECT 
    year,
    month,
    machine_id,
    COUNT(*) as net_count,
    SUM(length) as total_length,
    SUM(actual_area) as total_area,
    SUM(equivalent_output) as total_equivalent
FROM weaving_production_records
GROUP BY year, month, machine_id
ORDER BY year DESC, month DESC, machine_id;

-- ========================================
-- 第七部分: 初始数据
-- ========================================

INSERT OR IGNORE INTO workshops (id, name, code, departments) VALUES
    ('ws_styling', '定型工段', 'styling', '["定型一车间", "定型二车间", "后整理"]'),
    ('ws_weaving', '织造工段', 'weaving', '["织造一班", "织造二班"]');

INSERT OR IGNORE INTO settings (id, announcement) VALUES
    ('global', '安全生产，重在预防。进入车间请务必穿戴好劳保用品。');

INSERT OR IGNORE INTO system_users (id, username, display_name, role, pin_code, is_system, scopes, permissions) VALUES
    ('u1', 'admin', '系统管理员', 'ADMIN', '1234', 1, '["all"]', 
     '["VIEW_DASHBOARD", "VIEW_PRODUCTION", "VIEW_ATTENDANCE", "VIEW_CALCULATOR", "VIEW_SIMULATION", "VIEW_EMPLOYEES", "EDIT_YIELD", "EDIT_UNIT_PRICE", "EDIT_KPI", "EDIT_FIXED_PACK", "EDIT_HOURS", "EDIT_BASE_SCORE", "EDIT_WEIGHTS", "APPLY_SIMULATION", "VIEW_SENSITIVE", "MANAGE_ANNOUNCEMENTS", "MANAGE_EMPLOYEES", "MANAGE_SYSTEM"]');

INSERT OR IGNORE INTO weaving_config (id) VALUES ('default');

INSERT OR IGNORE INTO weaving_machines (id, name, speed_type, width, effective_width, speed_weft_per_min, target_output, status) VALUES
    ('H1', '1号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H2', '2号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H3', '3号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H4', '4号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H5', '5号机', 'H5', 4.25, 3.85, 23, 3600, 'running'),
    ('H6', '6号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H7', '7号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H8', '8号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H9', '9号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H10', '10号机', 'H2', 8.5, 7.7, 41, 6450, 'running'),
    ('H11', '11号机', 'H2', 8.5, 7.7, 41, 6450, 'running');

INSERT OR IGNORE INTO weaving_products (id, name, weft_density, description) VALUES
    ('22504', '22504标准网', 13, '基准产品，纬密13'),
    ('3616ssb-1', '3616ssb-1', 44.5, '高纬密产品'),
    ('7500', '7500网', 44.5, '高纬密产品');

INSERT OR IGNORE INTO weaving_employees (id, name, gender, position, coefficient, join_date, status, machine_id) VALUES
    ('w1', '耿志友', 'male', 'admin_leader', 1.3, '2020-01-01', 'active', 'admin'),
    ('w2', '赵红林', 'male', 'admin_member', 1.0, '2020-03-15', 'active', 'admin'),
    ('w3', '夏旺潮', 'male', 'admin_member', 1.0, '2021-06-01', 'active', 'admin');

-- 结束