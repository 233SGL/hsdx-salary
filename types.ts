// Role Definitions
export enum UserRole {
  ADMIN = 'ADMIN',
  VP_PRODUCTION = 'VP_PRODUCTION',
  SCHEDULING = 'SCHEDULING',
  SECTION_HEAD = 'SECTION_HEAD',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  GUEST = 'GUEST'
}

// Granular Permissions: View (Page Access) vs Edit (Action)
export type Permission =
  // --- Page Access (页面访问) ---
  | 'VIEW_DASHBOARD'
  | 'VIEW_PRODUCTION'
  | 'VIEW_ATTENDANCE'
  | 'VIEW_CALCULATOR'
  | 'VIEW_SIMULATION'
  | 'VIEW_EMPLOYEES'

  // --- Data Entry (数据录入) ---
  | 'EDIT_YIELD'       // 入库量
  | 'EDIT_UNIT_PRICE'  // 单价
  | 'EDIT_FIXED_PACK'  // 固定包
  | 'EDIT_KPI'         // KPI
  | 'EDIT_HOURS'       // 工时

  // --- Salary & Mgmt (薪酬与管理) ---
  | 'EDIT_BASE_SCORE'  // 基础分
  | 'EDIT_WEIGHTS'     // 权重
  | 'APPLY_SIMULATION' // 模拟应用到生产
  | 'MANAGE_ANNOUNCEMENTS' // 公告
  | 'MANAGE_EMPLOYEES' // 档案增删改
  | 'MANAGE_SYSTEM'    // 系统设置
  | 'VIEW_SENSITIVE'  // 敏感金额查看

  // --- Weaving Section (织造工段) ---
  // 页面访问权限
  | 'VIEW_WEAVING_DATA_ENTRY'   // 查看织造数据录入页
  | 'VIEW_WEAVING_CALCULATOR'   // 查看织造薪酬计算页
  | 'VIEW_WEAVING_EMPLOYEES'    // 查看织造人员档案页
  | 'VIEW_WEAVING_CONFIG'       // 查看织造工段配置页
  // 操作权限
  | 'EDIT_WEAVING_MONTHLY_DATA' // 编辑织造月度数据
  | 'EDIT_WEAVING_CONFIG'       // 编辑织造配置参数
  | 'MANAGE_WEAVING_EMPLOYEES'; // 管理织造人员档案

export const PERMISSION_LIST: { key: Permission, label: string, category: string }[] = [
  // 1. Page Access
  { key: 'VIEW_DASHBOARD', label: '查看数据大盘', category: '页面访问权限' },
  { key: 'VIEW_PRODUCTION', label: '查看生产录入页', category: '页面访问权限' },
  { key: 'VIEW_ATTENDANCE', label: '查看每日工时页', category: '页面访问权限' },
  { key: 'VIEW_CALCULATOR', label: '查看积分计算页', category: '页面访问权限' },
  { key: 'VIEW_SIMULATION', label: '查看模拟沙箱页', category: '页面访问权限' },
  { key: 'VIEW_EMPLOYEES', label: '查看员工档案页', category: '页面访问权限' },

  // 2. Production Data
  { key: 'EDIT_YIELD', label: '录入产量 (入库量)', category: '生产数据管理' },
  { key: 'EDIT_UNIT_PRICE', label: '调整单价', category: '生产数据管理' },
  { key: 'EDIT_FIXED_PACK', label: '调整固定积分包', category: '生产数据管理' },
  { key: 'EDIT_KPI', label: '调整 KPI', category: '生产数据管理' },
  { key: 'EDIT_HOURS', label: '修改每日工时', category: '生产数据管理' },

  // 3. Salary & Strategy
  { key: 'EDIT_BASE_SCORE', label: '评定员工基础分', category: '积分策略管理' },
  { key: 'EDIT_WEIGHTS', label: '调节分配权重', category: '积分策略管理' },
  { key: 'APPLY_SIMULATION', label: '应用模拟结果到生产', category: '积分策略管理' },
  { key: 'VIEW_SENSITIVE', label: '查看敏感积分数据', category: '积分策略管理' },

  // 4. System Admin
  { key: 'MANAGE_ANNOUNCEMENTS', label: '发布车间公告', category: '系统高级管理' },
  { key: 'MANAGE_EMPLOYEES', label: '员工档案增删改', category: '系统高级管理' },
  { key: 'MANAGE_SYSTEM', label: '系统设置与用户管理', category: '系统高级管理' },

  // 5. Weaving Section Page Access
  { key: 'VIEW_WEAVING_DATA_ENTRY', label: '查看织造数据录入', category: '织造工段访问' },
  { key: 'VIEW_WEAVING_CALCULATOR', label: '查看织造积分计算', category: '织造工段访问' },
  { key: 'VIEW_WEAVING_EMPLOYEES', label: '查看织造人员档案', category: '织造工段访问' },
  { key: 'VIEW_WEAVING_CONFIG', label: '查看织造工段配置', category: '织造工段访问' },

  // 6. Weaving Section Operations
  { key: 'EDIT_WEAVING_MONTHLY_DATA', label: '编辑织造月度数据', category: '织造工段管理' },
  { key: 'EDIT_WEAVING_CONFIG', label: '编辑织造工段配置', category: '织造工段管理' },
  { key: 'MANAGE_WEAVING_EMPLOYEES', label: '管理织造人员档案', category: '织造工段管理' },
];

export type EmployeeStatus = 'active' | 'probation' | 'leave' | 'terminated';

export interface Workshop {
  id: string;
  name: string;
  code: string;
  departments: string[];
}

export interface SystemUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  customRoleName?: string;
  permissions: Permission[];
  scopes: string[];
  pinCode: string;
  avatar?: string;
  isSystem?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  gender: 'male' | 'female';
  workshopId: string;
  department: string;
  position: string;
  joinDate: string;
  phone?: string;
  idCard?: string;
  standardBaseScore: number;
  status: EmployeeStatus;
  notes?: string;
  expectedDailyHours?: number;
  machineId?: string; // 织造工段专用：机台号 (H1-H11)
}

export interface SalaryRecord {
  employeeId: string;
  employeeName: string;
  workHours: number;
  dailyLogs?: Record<number, number>;
  expectedHours: number;
  baseScoreSnapshot: number;
  calculatedRealBase?: number;
  calculatedBonus?: number;
  calculatedTotal?: number;
}

export interface MonthlyParams {
  year: number;
  month: number;
  area: number;
  unitPrice: number;
  attendancePack: number;
  kpiScore: number;
  weightTime: number;
  weightBase: number;
}

export interface MonthlyData {
  id: string;
  params: MonthlyParams;
  records: SalaryRecord[];
}

export interface CalculationResult {
  records: (SalaryRecord & {
    workRatio: number;
    baseRatio: number;
    compositeWeight: number;
    realBase: number;
    bonus: number;
    finalScore: number;
  })[];
  totalPool: number;
  totalBasePayout: number;
  bonusPool: number;
  sumWorkHours: number;
  sumExpectedHours: number;
  sumStandardBase: number;
}

export interface GlobalSettings {
  announcement: string;
}

export interface StorageStats {
  usedKB: number;
  recordCount: number;
  employeeCount: number;
  lastBackup?: string;
}