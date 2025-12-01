
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, Permission, SystemUser } from '../types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: { name: string; avatar: string; permissions: Permission[]; role?: UserRole } | null;
  logout: () => void;
  hasPermission: (perm: Permission) => boolean;
  login: (user: SystemUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role metadata for UI
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '行政 (系统管理)',
  [UserRole.VP_PRODUCTION]: '生产副总 (定薪/KPI)',
  [UserRole.SCHEDULING]: '调度中心 (产量)',
  [UserRole.SECTION_HEAD]: '工段负责人 (工时)',
  [UserRole.GENERAL_MANAGER]: '总经理 (审批/查看)',
  [UserRole.GUEST]: '访客'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 每次打开应用都需要重新登录，不从 localStorage 恢复登录状态
  const [role, setRoleState] = useState<UserRole>(UserRole.GUEST);

  const [user, setUser] = useState<{ name: string; avatar: string; permissions: Permission[]; role?: UserRole } | null>(null);

  const loginUser = (systemUser: SystemUser) => {
    setRoleState(systemUser.role);
    const userObj = {
        name: systemUser.displayName,
        avatar: `https://ui-avatars.com/api/?name=${systemUser.displayName}&background=0ea5e9&color=fff`,
        permissions: systemUser.permissions || [],
        role: systemUser.role
    };
    setUser(userObj);
    // 不再保存到 localStorage，会话仅在内存中维持
  };

  const logout = () => {
    setRoleState(UserRole.GUEST);
    setUser(null);
    // 不需要清理 localStorage，因为没有保存登录信息
  };

  const hasPermission = (perm: Permission): boolean => {
      if (!user) return false;
      // Explicit check based on permissions array
      if (user.permissions.includes(perm)) return true;
      // Fallback for Admin role
      if (role === UserRole.ADMIN) return true;
      return false;
  };

  return (
    <AuthContext.Provider value={{ role, setRole: setRoleState, user, logout, hasPermission, login: loginUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
