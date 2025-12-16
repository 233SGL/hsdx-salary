/**
 * ========================================
 * 鹤山积分管理系统 - 认证上下文
 * ========================================
 * 
 * 本模块提供用户认证和权限管理功能：
 * - 用户登录/登出
 * - 角色管理
 * - 权限检查（新旧两套系统）
 * - 工段范围控制
 * 
 * - 工段范围控制
 * 
 * 注意：从 v2.6 起，支持持久化登录（记住我），
 * 刷新页面后会自动恢复登录状态。
 * 
 * @module contexts/AuthContext
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Permission, SystemUser, PageType, EditPermission, WorkshopScope } from '../types';
import { convertOldPermissionsToNew, pageExistsInWorkshop } from '../utils/permissionHelpers';
import { db } from '../services/db';

/**
 * 认证上下文类型定义
 * 定义所有可通过 useAuth() 访问的属性和方法
 */
interface AuthContextType {
  /** 当前用户角色 */
  role: UserRole;
  /** 设置角色（已弃用，保留接口兼容） */
  setRole: (role: UserRole) => void;
  /** 当前登录用户信息 */
  user: { id: string; username: string; name: string; avatar: string; permissions: Permission[]; role?: UserRole; scopes: string[]; newPermissions?: any } | null;
  /** 登出函数 */
  logout: () => void;

  // 旧权限检查（保留兼容）
  /** 检查是否有指定权限（旧系统） */
  hasPermission: (perm: Permission) => boolean;
  /** 检查是否有指定工段范围 */
  hasScope: (scope: string) => boolean;

  // 新权限检查
  /** 检查是否可查看指定页面 */
  canViewPage: (page: PageType, workshop?: WorkshopScope) => boolean;
  /** 检查是否有指定编辑权限 */
  canEdit: (permission: EditPermission) => boolean;
  /** 获取用户可访问的工段列表 */
  getAvailableScopes: () => WorkshopScope[];

  /** 登录函数 */
  login: (user: SystemUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 角色显示名称映射
 * 用于 UI 中显示可读的角色名称
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '行政 (系统管理)',
  [UserRole.VP_PRODUCTION]: '生产副总 (定薪/KPI)',
  [UserRole.SCHEDULING]: '调度中心 (产量)',
  [UserRole.SECTION_HEAD]: '工段负责人 (工时)',
  [UserRole.GENERAL_MANAGER]: '总经理 (审批/查看)',
  [UserRole.GUEST]: '访客'
};

/**
 * 认证上下文提供者组件
 * 包裹应用根组件，提供认证状态和方法
 */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always start as GUEST - require login on every app load
  const [role, setRoleState] = useState<UserRole>(UserRole.GUEST);

  // Always start with no user - require login on every app load
  const [user, setUser] = useState<{ id: string; username: string; name: string; avatar: string; permissions: Permission[]; scopes: string[]; newPermissions?: any } | null>(null);

  // 发送心跳信号用于在线状态追踪
  const sendHeartbeat = async (userId: string, username: string) => {
    try {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem('session_id', sessionId);
      }

      await fetch('/api/admin/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, username })
      });
    } catch (err) {
      console.error('心跳发送失败:', err);
    }
  };

  // 清除会话
  const clearSession = async () => {
    const sessionId = sessionStorage.getItem('session_id');
    if (sessionId) {
      try {
        await fetch(`/api/admin/session/${sessionId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('清除会话失败:', err);
      }
    }
  };

  // ========================================
  // 3. 持久化登录逻辑
  // ========================================

  // 登录
  const loginUser = (systemUser: SystemUser) => {
    setRoleState(systemUser.role);
    const userObj = {
      id: systemUser.id,
      username: systemUser.username,
      name: systemUser.displayName,
      avatar: `https://ui-avatars.com/api/?name=${systemUser.displayName}&background=0ea5e9&color=fff`,
      permissions: systemUser.permissions || [],
      role: systemUser.role,
      scopes: systemUser.scopes || [],
      newPermissions: systemUser.newPermissions
    };
    setUser(userObj);

    // 保存会话信息到 sessionStorage (用于审计)
    sessionStorage.setItem('user_id', systemUser.id);
    sessionStorage.setItem('user_name', systemUser.displayName);

    // [NEW] 保存到 localStorage 实现持久化登录
    localStorage.setItem('auth_user_id', systemUser.id);
    localStorage.setItem('auth_login_time', Date.now().toString()); // 记录登录时间

    // 立即发送第一次心跳
    sendHeartbeat(systemUser.id, systemUser.displayName);
  };

  // 定期发送心跳（每2分钟）
  React.useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      sendHeartbeat(user.id, user.name);
    }, 2 * 60 * 1000); // 2分钟

    return () => clearInterval(interval);
  }, [user]);

  // 登出
  const logout = async () => {
    // 先清除远程会话
    await clearSession();
    setRoleState(UserRole.GUEST);
    setUser(null);

    // 清除所有存储
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('admin_verified_at');
    localStorage.removeItem('auth_user_id'); // 清除持久化凭证
    localStorage.removeItem('auth_login_time'); // 清除时间戳
  };

  // 自动恢复会话
  React.useEffect(() => {
    const restoreSession = async () => {
      const storedUserId = localStorage.getItem('auth_user_id');
      const storedTime = localStorage.getItem('auth_login_time');

      if (!storedUserId || user) return;

      // check expiration (1 hour = 1 * 60 * 60 * 1000 ms)
      const SESSION_DURATION = 1 * 60 * 60 * 1000;
      if (storedTime) {
        const loginTime = parseInt(storedTime, 10);
        if (Date.now() - loginTime > SESSION_DURATION) {
          console.log('登录会话已过期，请重新登录');
          // Clear expired session
          localStorage.removeItem('auth_user_id');
          localStorage.removeItem('auth_login_time');
          return;
        }
      } else {
        // If no timestamp found but id exists (legacy), force re-login for security
        // or treat as new valid session. Safe choice: remove it.
        localStorage.removeItem('auth_user_id');
        return;
      }

      try {
        await db.connect(); // 确保连接
        const users = await db.getSystemUsers();
        const foundUser = users.find(u => u.id === storedUserId);

        if (foundUser) {
          console.log('自动恢复登录会话:', foundUser.displayName);
          // 这里不直接调用 loginUser 以避免递归或重复副作用，而是手动设置状态
          setRoleState(foundUser.role);
          const userObj = {
            id: foundUser.id,
            username: foundUser.username,
            name: foundUser.displayName,
            avatar: `https://ui-avatars.com/api/?name=${foundUser.displayName}&background=0ea5e9&color=fff`,
            permissions: foundUser.permissions || [],
            role: foundUser.role,
            scopes: foundUser.scopes || [],
            newPermissions: foundUser.newPermissions
          };
          setUser(userObj);

          // 补全 sessionStorage
          sessionStorage.setItem('user_id', foundUser.id);
          sessionStorage.setItem('user_name', foundUser.displayName);

          sendHeartbeat(foundUser.id, foundUser.displayName);
        } else {
          // 用户不存在（可能被删除），清除残留
          localStorage.removeItem('auth_user_id');
          localStorage.removeItem('auth_login_time');
        }
      } catch (err) {
        console.error('恢复会话失败:', err);
      }
    };

    restoreSession();
  }, []); // 仅组件挂载时执行

  const hasPermission = (perm: Permission): boolean => {
    if (!user) return false;
    if (user.permissions && user.permissions.includes(perm)) return true;
    if (role === UserRole.ADMIN) return true;
    return false;
  };

  const hasScope = (scope: string): boolean => {
    if (!user) return false;
    if (user.scopes && user.scopes.includes('all')) return true;
    return user.scopes && user.scopes.includes(scope);
  };

  // ========================================
  // 新权限检查方法
  // ========================================

  const canViewPage = (page: PageType, workshop?: WorkshopScope): boolean => {
    if (!user) return false;
    if (role === UserRole.ADMIN) return true;  // 管理员全权限

    // 如果用户有 newPermissions，使用新系统
    if (user.newPermissions) {
      const newPerms = user.newPermissions;

      // 检查页面类型权限
      if (!newPerms.pages.includes(page)) return false;

      // 如果指定了工段，检查工段范围
      if (workshop) {
        if (!newPerms.scopes.includes(workshop) && !newPerms.scopes.includes('all')) {
          return false;
        }
        // 检查页面在该工段是否存在
        if (!pageExistsInWorkshop(page, workshop)) return false;
      }

      return true;
    }

    // 否则回退到旧系统（自动转换）
    const converted = convertOldPermissionsToNew(user.permissions || [], user.scopes || []);
    if (!converted.pages.includes(page)) return false;

    if (workshop) {
      if (!user.scopes.includes(workshop) && !user.scopes.includes('all')) {
        return false;
      }
      if (!pageExistsInWorkshop(page, workshop)) return false;
    }

    return true;
  };

  const canEdit = (permission: EditPermission): boolean => {
    if (!user) return false;
    if (role === UserRole.ADMIN) return true;

    // 如果用户有 newPermissions，使用新系统
    if (user.newPermissions) {
      return user.newPermissions.edits.includes(permission);
    }

    // 回退到旧系统（自动转换）
    const converted = convertOldPermissionsToNew(user.permissions || [], user.scopes || []);
    return converted.edits.includes(permission);
  };

  const getAvailableScopes = (): WorkshopScope[] => {
    if (!user) return [];
    if (role === UserRole.ADMIN) return ['all'];

    // 使用 scopes 字段（新旧系统共用）
    const scopes = user.scopes || [];
    return scopes.filter((s): s is WorkshopScope =>
      s === 'styling' || s === 'weaving' || s === 'all'
    );
  };

  return (
    <AuthContext.Provider value={{
      role,
      setRole: () => { },
      user,
      logout,
      hasPermission,
      hasScope,
      canViewPage,
      canEdit,
      getAvailableScopes,
      login: loginUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
