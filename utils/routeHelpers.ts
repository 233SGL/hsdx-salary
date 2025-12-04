/**
 * ========================================
 * 鹤山积分管理系统 - 路由辅助工具
 * ========================================
 * 
 * 本模块提供路由相关的辅助函数：
 * - 根据用户权限获取默认跳转路由
 * 
 * @module utils/routeHelpers
 */

/**
 * 根据用户权限获取默认可访问的路由
 * 遍历路由列表，返回用户有权访问的第一个路由
 * 
 * @param permissions - 用户权限列表
 * @returns 默认路由路径
 */
export const getDefaultRoute = (permissions: string[]): string => {
    // 路由和对应所需权限的映射列表（按优先级排序）
    const routes = [
        { path: '/dashboard', permission: 'VIEW_DASHBOARD' },      // 数据大盘
        { path: '/production-data', permission: 'VIEW_PRODUCTION' }, // 生产数据
        { path: '/attendance', permission: 'VIEW_ATTENDANCE' },    // 每日工时
        { path: '/calculator', permission: 'VIEW_CALCULATOR' },    // 积分计算
        { path: '/simulation', permission: 'VIEW_SIMULATION' },    // 模拟沙箱
        { path: '/weaving', permission: 'VIEW_DASHBOARD' },        // 织造工段（复用VIEW_DASHBOARD权限）
        { path: '/employees', permission: 'VIEW_EMPLOYEES' },      // 员工档案
        { path: '/settings', permission: 'MANAGE_SYSTEM' },        // 系统设置
    ];

    // 查找用户有权限访问的第一个路由
    for (const route of routes) {
        if (permissions.includes(route.permission)) {
            return route.path;
        }
    }

    // 无匹配权限时回退到登录页
    return '/login';
};
