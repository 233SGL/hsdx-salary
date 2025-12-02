
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Megaphone, Save, CheckCircle } from 'lucide-react';

export const StylingSettings: React.FC = () => {
  const { settings, updateSettings, isSaving } = useData();
  const { hasPermission } = useAuth();
  
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [showSuccess, setShowSuccess] = useState(false);

  const canEdit = hasPermission('MANAGE_SYSTEM') || hasPermission('EDIT_WEIGHTS');

  const handleSave = async () => {
      await updateSettings({ announcement });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!canEdit) {
      return <div>权限不足</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">定型工段设置</h1>
            <p className="text-slate-500">管理该工段的公共显示内容</p>
        </div>

        {showSuccess && (
          <div className="p-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-3">
              <CheckCircle size={20} />
              <span className="font-medium">设置已保存</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                    <Megaphone size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">车间公告 / 跑马灯</h3>
                    <p className="text-sm text-slate-500">配置车间大屏底部的滚动通知内容</p>
                </div>
            </div>
            <div className="p-6">
                <textarea 
                    className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                    value={announcement}
                    onChange={e => setAnnouncement(e.target.value)}
                    placeholder="输入公告内容..."
                />
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
                    >
                        <Save size={18} /> 保存配置
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
