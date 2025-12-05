/**
 * ========================================
 * 织造工段 - 奖金核算页面
 * ========================================
 * 
 * 成网率奖 + 运转率奖 → 二次分配
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator,
  DollarSign,
  Users,
  Award,
  Loader2,
  Info,
  CheckCircle
} from 'lucide-react';

// ========================================
// 类型定义
// ========================================

interface WeavingConfig {
  netFormationBenchmark: number;
  operationRateBenchmark: number;
  targetEquivalentOutput: number;
  operatorQuota: number;
  avgTargetBonus: number;
  adminTeamSize: number;
  operationRateBonusUnit: number;
  leaderCoef: number;
  memberCoef: number;
  leaderBaseSalary: number;
  memberBaseSalary: number;
}

interface MonthlySummary {
  totalEquivalent: number;
  netFormationRate: number;
  operationRate: number;
  activeMachines: number;
  actualOperators: number;
  attendanceDays: number;
}

interface BonusResult {
  qualityBonusCoef: number;
  qualityBonusTotal: number;
  operationBonusTotal: number;
  totalBonusPool: number;
  totalCoef: number;
  leaderBonus: number;
  memberBonus: number;
  leaderTotalWage: number;
  memberTotalWage: number;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  baseSalary: number;
  coefficient: number;
}

// ========================================
// API 函数
// ========================================

const API_BASE = 'http://localhost:3000/api/weaving';

async function fetchConfig(): Promise<WeavingConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('获取配置失败');
  return res.json();
}

async function fetchMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
  const res = await fetch(`${API_BASE}/summary?year=${year}&month=${month}`);
  if (!res.ok) throw new Error('获取汇总失败');
  return res.json();
}

async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) throw new Error('获取员工失败');
  return res.json();
}

// ========================================
// 计算函数
// ========================================

function calculateBonus(summary: MonthlySummary, config: WeavingConfig): BonusResult {
  // 成网率质量奖系数
  const netFormationExcess = (summary.netFormationRate - config.netFormationBenchmark) / 100;
  const targetTotalOutput = config.targetEquivalentOutput * summary.activeMachines;
  const outputRate = targetTotalOutput > 0 ? summary.totalEquivalent / targetTotalOutput : 0;
  const actualOperators = summary.actualOperators || config.operatorQuota;
  const staffEfficiency = config.operatorQuota / actualOperators;
  
  const qualityBonusCoef = netFormationExcess > 0 
    ? (netFormationExcess * 100 / 30) * outputRate * staffEfficiency 
    : 0;
  const qualityBonusTotal = qualityBonusCoef * config.avgTargetBonus * config.adminTeamSize;

  // 运转率奖
  const operationExcess = summary.operationRate - config.operationRateBenchmark;
  const operationBonusTotal = operationExcess > 0 ? operationExcess * config.operationRateBonusUnit : 0;

  // 总奖金池
  const totalBonusPool = qualityBonusTotal + operationBonusTotal;

  // 二次分配
  const memberCount = config.adminTeamSize - 1;
  const totalCoef = config.leaderCoef + (config.memberCoef * memberCount);
  const leaderBonus = totalBonusPool / totalCoef * config.leaderCoef;
  const memberBonus = totalBonusPool / totalCoef * config.memberCoef;

  // 应发工资
  const attendanceRate = Math.min((summary.attendanceDays || 26) / 26, 1);
  const leaderBasePay = config.leaderBaseSalary * attendanceRate;
  const memberBasePay = config.memberBaseSalary * attendanceRate;
  const leaderTotalWage = leaderBasePay + leaderBonus;
  const memberTotalWage = memberBasePay + memberBonus;

  return {
    qualityBonusCoef,
    qualityBonusTotal,
    operationBonusTotal,
    totalBonusPool,
    totalCoef,
    leaderBonus,
    memberBonus,
    leaderTotalWage,
    memberTotalWage
  };
}

// ========================================
// 主组件
// ========================================

export const BonusCalculation: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  
  const [config, setConfig] = useState<WeavingConfig | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // 手动输入（用于 API 未返回时）
  const [manualInput, setManualInput] = useState({
    netFormationRate: 72,
    operationRate: 78,
    totalEquivalent: 65000,
    activeMachines: 10,
    actualOperators: 17,
    attendanceDays: 26
  });

  // 加载数据
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchConfig(),
      fetchMonthlySummary(year, month),
      fetchEmployees()
    ])
      .then(([configData, summaryData, employeesData]) => {
        setConfig(configData);
        setSummary(summaryData);
        setEmployees(employeesData);
        if (summaryData) {
          setManualInput({
            netFormationRate: summaryData.netFormationRate || 72,
            operationRate: summaryData.operationRate || 78,
            totalEquivalent: summaryData.totalEquivalent || 65000,
            activeMachines: summaryData.activeMachines || 10,
            actualOperators: summaryData.actualOperators || 17,
            attendanceDays: summaryData.attendanceDays || 26
          });
        }
        setLoading(false);
      })
      .catch(() => {
        // 使用默认配置
        setConfig({
          netFormationBenchmark: 68,
          operationRateBenchmark: 72,
          targetEquivalentOutput: 6450,
          operatorQuota: 24,
          avgTargetBonus: 4000,
          adminTeamSize: 3,
          operationRateBonusUnit: 500,
          leaderCoef: 1.3,
          memberCoef: 1.0,
          leaderBaseSalary: 3500,
          memberBaseSalary: 2500
        });
        setEmployees([
          { id: 'w1', name: '耿志友', position: 'admin_leader', baseSalary: 3500, coefficient: 1.3 },
          { id: 'w2', name: '赵红林', position: 'admin_member', baseSalary: 2500, coefficient: 1.0 },
          { id: 'w3', name: '夏旺潮', position: 'admin_member', baseSalary: 2500, coefficient: 1.0 }
        ]);
        setLoading(false);
      });
  }, [year, month]);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 计算结果
  const result = calculateBonus({
    totalEquivalent: manualInput.totalEquivalent,
    netFormationRate: manualInput.netFormationRate,
    operationRate: manualInput.operationRate,
    activeMachines: manualInput.activeMachines,
    actualOperators: manualInput.actualOperators,
    attendanceDays: manualInput.attendanceDays
  }, config);

  // 管理员班人员
  const adminEmployees = employees.filter(e => e.position.startsWith('admin'));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">奖金核算</h1>
          <p className="text-sm text-slate-500 mt-1">管理员班奖金计算与分配</p>
        </div>
        
        {/* 月份选择器 */}
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 输入参数 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-500" />
            本月数据
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">成网率 (%)</label>
              <input
                type="number"
                value={manualInput.netFormationRate}
                onChange={e => setManualInput(prev => ({ ...prev, netFormationRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">运转率 (%)</label>
              <input
                type="number"
                value={manualInput.operationRate}
                onChange={e => setManualInput(prev => ({ ...prev, operationRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">等效产量 (㎡)</label>
              <input
                type="number"
                value={manualInput.totalEquivalent}
                onChange={e => setManualInput(prev => ({ ...prev, totalEquivalent: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">有效机台</label>
                <input
                  type="number"
                  value={manualInput.activeMachines}
                  onChange={e => setManualInput(prev => ({ ...prev, activeMachines: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">操作工人数</label>
                <input
                  type="number"
                  value={manualInput.actualOperators}
                  onChange={e => setManualInput(prev => ({ ...prev, actualOperators: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">出勤天数</label>
              <input
                type="number"
                value={manualInput.attendanceDays}
                onChange={e => setManualInput(prev => ({ ...prev, attendanceDays: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 奖金计算 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            奖金计算
          </h2>
          <div className="space-y-4">
            {/* 成网率质量奖 */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-emerald-700">成网率质量奖</span>
                <span className="text-lg font-bold text-emerald-700">
                  ¥{result.qualityBonusTotal.toFixed(0)}
                </span>
              </div>
              <div className="text-xs text-emerald-600">
                奖励系数: {result.qualityBonusCoef.toFixed(3)}
              </div>
            </div>

            {/* 运转率奖 */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-amber-700">运转率奖</span>
                <span className="text-lg font-bold text-amber-700">
                  ¥{result.operationBonusTotal.toFixed(0)}
                </span>
              </div>
              <div className="text-xs text-amber-600">
                超标 {(manualInput.operationRate - config.operationRateBenchmark).toFixed(1)}% × {config.operationRateBonusUnit}元
              </div>
            </div>

            {/* 总奖金池 */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium opacity-90">总奖金池</span>
                <span className="text-2xl font-bold">
                  ¥{result.totalBonusPool.toFixed(0)}
                </span>
              </div>
            </div>

            {/* 提示 */}
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                成网率基准 {config.netFormationBenchmark}%，运转率基准 {config.operationRateBenchmark}%
              </span>
            </div>
          </div>
        </div>

        {/* 人员分配 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            二次分配
          </h2>
          <div className="space-y-4">
            <div className="text-sm text-slate-600 mb-4">
              总系数: {result.totalCoef.toFixed(1)} (班长{config.leaderCoef} + 班员{config.memberCoef}×{config.adminTeamSize - 1})
            </div>

            {/* 分配结果 */}
            {adminEmployees.length > 0 ? (
              adminEmployees.map(emp => {
                const isLeader = emp.position === 'admin_leader';
                const bonus = isLeader ? result.leaderBonus : result.memberBonus;
                const basePay = emp.baseSalary * Math.min(manualInput.attendanceDays / 26, 1);
                const totalWage = basePay + bonus;
                
                return (
                  <div key={emp.id} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{emp.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isLeader ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isLeader ? '班长' : '班员'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">系数 {emp.coefficient}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">基本工资</div>
                        <div className="font-mono text-slate-700">¥{basePay.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">奖金</div>
                        <div className="font-mono text-emerald-600">+{bonus.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">应发</div>
                        <div className="font-mono font-bold text-blue-600">¥{totalWage.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-800">班长</span>
                    <span className="text-xl font-bold text-purple-700">¥{result.leaderTotalWage.toFixed(0)}</span>
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    基本 {config.leaderBaseSalary} + 奖金 {result.leaderBonus.toFixed(0)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">班员 (每人)</span>
                    <span className="text-xl font-bold text-slate-700">¥{result.memberTotalWage.toFixed(0)}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    基本 {config.memberBaseSalary} + 奖金 {result.memberBonus.toFixed(0)}
                  </div>
                </div>
              </>
            )}

            {/* 确认按钮 */}
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all">
              <CheckCircle className="w-5 h-5" />
              确认本月核算
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusCalculation;
