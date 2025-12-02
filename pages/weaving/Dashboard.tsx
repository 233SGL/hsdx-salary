import React from 'react';
import { HardHat, ArrowRight } from 'lucide-react';

export const WeavingDashboard = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">织造工段</h1>
        <p className="text-slate-600">织造工段生产数据管理和薪酬计算</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HardHat className="text-blue-600" size={24} />
            </div>
            <span className="text-sm text-slate-500">即将上线</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">生产数据录入</h3>
          <p className="text-slate-600 text-sm mb-4">记录织造工段每日生产数据，包括产量、工时等信息</p>
          <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700">
            了解更多 <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HardHat className="text-green-600" size={24} />
            </div>
            <span className="text-sm text-slate-500">即将上线</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">薪酬计算</h3>
          <p className="text-slate-600 text-sm mb-4">基于织造工段特定的计薪规则计算员工薪酬</p>
          <button className="flex items-center gap-2 text-green-600 text-sm font-medium hover:text-green-700">
            了解更多 <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HardHat className="text-purple-600" size={24} />
            </div>
            <span className="text-sm text-slate-500">即将上线</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">数据分析</h3>
          <p className="text-slate-600 text-sm mb-4">可视化织造工段生产数据和薪酬分析</p>
          <button className="flex items-center gap-2 text-purple-600 text-sm font-medium hover:text-purple-700">
            了解更多 <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
        <HardHat size={48} className="text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">织造工段模块开发中</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          织造工段模块正在积极开发中，敬请期待更多功能的上线。如有任何建议或需求，请联系系统管理员。
        </p>
      </div>
    </div>
  );
};