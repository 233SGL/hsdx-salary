import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Factory, ShieldAlert, TrendingUp, Award, Activity, Settings2 } from 'lucide-react';

export const ProductionData: React.FC = () => {
  const { currentData, updateParams } = useData();
  const { hasPermission } = useAuth();

  // Permissions
  const canEditYield = hasPermission('EDIT_YIELD');
  const canEditUnitPrice = hasPermission('EDIT_UNIT_PRICE');
  const canEditFixedPack = hasPermission('EDIT_FIXED_PACK');
  const canEditKPI = hasPermission('EDIT_KPI');
  const canEditWeights = hasPermission('EDIT_WEIGHTS');
  
  const hasAccess = canEditYield || canEditUnitPrice || canEditFixedPack || canEditKPI || canEditWeights;

  if (!hasAccess) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <ShieldAlert size={48} className="mb-4" />
            <h2 className="text-xl font-semibold">权限不足：此页面仅限核心生产管理人员访问</h2>
        </div>
    );
  }

  const handleWeightChange = (type: 'time' | 'base', val: string) => {
    let v = parseInt(val) || 0;
    if (v > 100) v = 100;
    if (v < 0) v = 0;
    
    if (type === 'time') {
      updateParams({ weightTime: v, weightBase: 100 - v });
    } else {
      updateParams({ weightBase: v, weightTime: 100 - v });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Factory className="text-blue-600" /> 生产数据录入
        </h1>
        <p className="text-slate-500">核心参数配置：入库量、KPI指标与积分权重</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">产量与入库</h3>
                    <p className="text-xs text-slate-500">定型工段本月总入库数据</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">本月入库量 (m²)</label>
                    <input 
                        type="number" 
                        disabled={!canEditYield}
                        value={currentData.params.area}
                        onChange={e => updateParams({ area: parseFloat(e.target.value) || 0 })}
                        className="w-full text-2xl font-mono border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                    <span className="font-bold">提示：</span> 入库量直接决定总积分包大小，请核对后录入。
                </div>
            </div>
        </div>

        {/* Financial Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Award size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">单价与定分</h3>
                    <p className="text-xs text-slate-500">积分值及固定积分包设定</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">单价 (分/m²)</label>
                    <input 
                        type="number" 
                        disabled={!canEditUnitPrice}
                        value={currentData.params.unitPrice}
                        onChange={e => updateParams({ unitPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full text-2xl font-mono border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">固定积分包 (Adjustment)</label>
                    <input 
                        type="number" 
                        disabled={!canEditFixedPack}
                        value={currentData.params.attendancePack}
                        onChange={e => updateParams({ attendancePack: parseFloat(e.target.value) || 0 })}
                        className="w-full text-lg font-mono border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                </div>
            </div>
        </div>

        {/* KPI Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Activity size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">KPI 考核</h3>
                    <p className="text-xs text-slate-500">质量与安全考核得分</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">KPI 考核分 (Score)</label>
                    <input 
                        type="number" 
                        disabled={!canEditKPI}
                        value={currentData.params.kpiScore}
                        onChange={e => updateParams({ kpiScore: parseFloat(e.target.value) || 0 })}
                        className="w-full text-2xl font-mono border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                </div>
            </div>
        </div>

        {/* Weights Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Settings2 size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">分配权重</h3>
                    <p className="text-xs text-slate-500">调节修正积分池分配倾向</p>
                </div>
            </div>
            
            <div className={`p-6 rounded-xl border-2 ${canEditWeights ? 'border-purple-100 bg-purple-50/50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="text-center w-1/3">
                         <div className="text-sm font-bold text-amber-600 mb-2">工时权重</div>
                         <input 
                            type="number" 
                            disabled={!canEditWeights}
                            value={currentData.params.weightTime}
                            onChange={e => handleWeightChange('time', e.target.value)}
                            className="w-full text-center text-3xl font-bold bg-white border border-amber-200 rounded-lg py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                         />
                    </div>
                    <div className="text-2xl font-bold text-slate-400">+</div>
                    <div className="text-center w-1/3">
                         <div className="text-sm font-bold text-purple-600 mb-2">基础分权重</div>
                         <input 
                            type="number" 
                            disabled={!canEditWeights}
                            value={currentData.params.weightBase}
                            onChange={e => handleWeightChange('base', e.target.value)}
                            className="w-full text-center text-3xl font-bold bg-white border border-purple-200 rounded-lg py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                         />
                    </div>
                </div>
                <input 
                    type="range" min="0" max="100"
                    disabled={!canEditWeights}
                    value={currentData.params.weightTime}
                    onChange={e => handleWeightChange('time', e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
            </div>
        </div>
      </div>
    </div>
  );
};
