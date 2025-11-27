
// Role Definitions based on the handwritten notes
export enum UserRole {
  ADMIN = 'ADMIN', 
  VP_PRODUCTION = 'VP_PRODUCTION', 
  SCHEDULING = 'SCHEDULING', 
  SECTION_HEAD = 'SECTION_HEAD', 
  GENERAL_MANAGER = 'GENERAL_MANAGER', // Renamed from MANAGER
  GUEST = 'GUEST'
}

export type Permission = 'EDIT_YIELD' | 'EDIT_MONEY' | 'EDIT_HOURS' | 'EDIT_BASE_SCORE' | 'EDIT_WEIGHTS' | 'VIEW_SENSITIVE' | 'MANAGE_EMPLOYEES' | 'MANAGE_SYSTEM';

export const PERMISSION_LIST: {key: Permission, label: string, category: string}[] = [
    { key: 'EDIT_YIELD', label: '录入产量 (入库量)', category: '数据录入' },
    { key: 'EDIT_MONEY', label: '定薪权 (单价/KPI)', category: '数据录入' },
    { key: 'EDIT_HOURS', label: '工时管理', category: '数据录入' },
    { key: 'EDIT_BASE_SCORE', label: '评定基础分', category: '薪酬管理' },
    { key: 'EDIT_WEIGHTS', label: '权重调节', category: '薪酬管理' },
    { key: 'VIEW_SENSITIVE', label: '查看敏感薪资', category: '薪酬管理' },
    { key: 'MANAGE_EMPLOYEES', label: '员工档案管理', category: '系统权限' },
    { key: 'MANAGE_SYSTEM', label: '系统设置管理', category: '系统权限' },
];

export type EmployeeStatus = 'active' | 'probation' | 'leave' | 'terminated';

export interface SystemUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole; 
  customRoleName?: string; 
  permissions: Permission[]; 
  pinCode: string; 
  avatar?: string;
  isSystem?: boolean; 
}

export interface Employee {
  id: string;
  name: string;
  gender: 'male' | 'female';
  department: string;     
  position: string;       
  joinDate: string;       
  phone?: string;
  idCard?: string;        
  standardBaseScore: number; 
  status: EmployeeStatus;
  notes?: string;
  expectedDailyHours?: number; 
}

export interface SalaryRecord {
  employeeId: string;
  employeeName: string;
  workHours: number;      
  dailyLogs?: Record<number, number>; 
  expectedHours: number;  
  baseScoreSnapshot: number; 
  // Calculated fields
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
