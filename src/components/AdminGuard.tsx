/**
 * 后台管理安全验证组件
 * 访问后台管理页面时需要二次验证
 */
import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

// 验证缓存有效期（毫秒）：30分钟
const VERIFICATION_DURATION = 30 * 60 * 1000;

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { user } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 检查是否已验证（基于 sessionStorage）
    useEffect(() => {
        const verifiedAt = sessionStorage.getItem('admin_verified_at');
        if (verifiedAt) {
            const elapsed = Date.now() - parseInt(verifiedAt);
            if (elapsed < VERIFICATION_DURATION) {
                setIsVerified(true);
            } else {
                sessionStorage.removeItem('admin_verified_at');
            }
        }
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 调用后端验证API
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    password
                })
            });

            const data = await res.json();

            if (res.ok && data.verified) {
                sessionStorage.setItem('admin_verified_at', String(Date.now()));
                setIsVerified(true);
            } else {
                setError(data.error || '验证失败，请检查密码');
            }
        } catch (err) {
            setError('网络错误，请重试');
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    if (isVerified) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center animate-fade-in-up">
            <div className="card p-8 max-w-md w-full text-center">
                {/* 安全图标 */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield size={40} className="text-amber-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">安全验证</h2>
                <p className="text-slate-500 mb-6">
                    访问敏感页面需要验证，请输入<strong>管理员账户</strong>密码
                </p>

                {/* 警告提示 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start gap-2 text-left">
                    <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-700">
                        <strong>安全提醒：</strong>此验证每30分钟需重新进行。请勿将管理权限授予非必要人员。
                    </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="text-left">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            当前账号: <span className="text-primary-600 font-bold">{user?.name}</span>
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="请输入管理员密码"
                                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                autoFocus
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        {loading ? '验证中...' : '确认身份'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminGuard;
