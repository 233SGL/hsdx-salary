
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  Users, 
  Settings, 
  LogOut,
  X,
  Database,
  CalendarDays,
  Factory
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext'; 
import { UserRole } from '../types';

export const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  const { user, logout, role, hasPermission } = useAuth();
  const { isSaving } = useData(); 

  const canEditYield = hasPermission('EDIT_YIELD');
  const canEditMoney = hasPermission('EDIT_MONEY');
  const canEditWeights = hasPermission('EDIT_WEIGHTS');
  const canViewProduction = canEditYield || canEditMoney || canEditWeights;

  const menuItems = [
    { icon: LayoutDashboard, label: '数据大盘', to: '/', visible: true },
    { icon: Factory, label: '生产录入', to: '/production-data', visible: canViewProduction },
    { icon: CalendarDays, label: '每日工时', to: '/attendance', visible: true },
    { icon: Calculator, label: '薪酬计算', to: '/calculator', visible: true },
    { icon: Users, label: '员工档案', to: '/employees', visible: hasPermission('MANAGE_EMPLOYEES') },
    { icon: Settings, label: '系统设置', to: '/settings', visible: hasPermission('MANAGE_SYSTEM') },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static flex flex-col
        `}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center font-bold text-white">
              H
            </div>
            <span className="font-bold text-lg tracking-wide">薪酬管理系统</span>
          </div>
          <button onClick={toggle} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src={user?.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700" />
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.filter(i => i.visible !== false).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => window.innerWidth < 1024 && toggle()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Database Status Indicator */}
        <div className="px-4 py-4 space-y-2">
           <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded text-xs text-emerald-400 border border-slate-800">
              <Database size={12} />
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>数据库已连接</span>
              </div>
           </div>
           
           {isSaving && (
             <div className="flex items-center gap-2 px-3 py-1 text-xs text-blue-400 animate-pulse">
                <span className="w-2 h-2 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                正在保存数据...
             </div>
           )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>
    </>
  );
};
