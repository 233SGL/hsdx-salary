/**
 * 后台管理 - 仪表盘页面
 * 显示系统概览、在线用户、最近操作日志
 */
import React, { useState, useEffect } from 'react';
import {
    Users, Activity, Database, FileText,
    RefreshCw, Clock, Shield, TrendingUp
} from 'lucide-react';

const API_BASE = '/api/admin';

interface Stats {
    activeEmployees: number;
    systemUsers: number;
    logsToday: number;
    onlineUsers: number;
}

interface OnlineUser {
    user_id: string;
    username: string;
    ip_address: string;
    last_activity: string;
}

interface AuditLog {
    id: number;
    user_id: string;
    username: string;
    action: string;
    target_type: string;
    target_name: string;
    created_at: string;
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, onlineRes, logsRes] = await Promise.all([
                fetch(`${API_BASE}/stats`),
                fetch(`${API_BASE}/users-online`),
                fetch(`${API_BASE}/audit-logs?limit=10`)
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (onlineRes.ok) setOnlineUsers(await onlineRes.json());
            if (logsRes.ok) {
                const data = await logsRes.json();
                setRecentLogs(data.data || []);
            }
        } catch (err) {
            console.error('获取数据失败:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // 每30秒刷新一次
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // 解码URL编码的用户名
    const decodeUsername = (name: string) => {
        try {
            return decodeURIComponent(name);
        } catch {
            return name;
        }
    };

    const actionLabels: Record<string, string> = {
        'CREATE': '创建',
        'UPDATE': '更新',
        'DELETE': '删除',
        'LOGIN': '登录',
        'LOGOUT': '登出'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* 页面标题 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">后台管理</h1>
                    <p className="text-slate-500 text-sm mt-0.5">系统监控与管理</p>
                </div>
                <button
                    onClick={fetchData}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={16} /> 刷新
                </button>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="text-blue-600" />}
                    label="在职员工"
                    value={stats?.activeEmployees || 0}
                    color="blue"
                />
                <StatCard
                    icon={<Shield className="text-emerald-600" />}
                    label="系统用户"
                    value={stats?.systemUsers || 0}
                    color="emerald"
                />
                <StatCard
                    icon={<Activity className="text-amber-600" />}
                    label="今日操作"
                    value={stats?.logsToday || 0}
                    color="amber"
                />
                <StatCard
                    icon={<TrendingUp className="text-purple-600" />}
                    label="当前在线"
                    value={stats?.onlineUsers || 0}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 在线用户 */}
                <div className="card p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        在线用户
                    </h3>
                    {onlineUsers.length === 0 ? (
                        <p className="text-slate-400 text-sm">暂无在线用户</p>
                    ) : (
                        <div className="space-y-3">
                            {onlineUsers.map(user => (
                                <div key={user.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">{decodeUsername(user.username)}</div>
                                            <div className="text-xs text-slate-400">{user.ip_address}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        <Clock size={12} className="inline mr-1" />
                                        {formatTime(user.last_activity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 最近操作 */}
                <div className="card p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-primary-500" />
                        最近操作
                    </h3>
                    {recentLogs.length === 0 ? (
                        <p className="text-slate-400 text-sm">暂无操作记录</p>
                    ) : (
                        <div className="space-y-2">
                            {recentLogs.map(log => (
                                <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {actionLabels[log.action] || log.action}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            <span className="font-medium">{decodeUsername(log.username)}</span>
                                            {log.target_name && <span> {log.target_type}: {log.target_name}</span>}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">{formatTime(log.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 统计卡片组件
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    color: 'blue' | 'emerald' | 'amber' | 'purple';
}> = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200'
    };

    return (
        <div className={`card p-5 bg-gradient-to-br ${colors[color]} border`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                </div>
                <div className="p-3 bg-white/60 rounded-xl shadow-sm">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
