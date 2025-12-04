// Helper function to get the first accessible route based on permissions
export const getDefaultRoute = (permissions: string[]): string => {
    // Define routes and their required permissions
    const routes = [
        { path: '/dashboard', permission: 'VIEW_DASHBOARD' },
        { path: '/production-data', permission: 'VIEW_PRODUCTION' },
        { path: '/attendance', permission: 'VIEW_ATTENDANCE' },
        { path: '/calculator', permission: 'VIEW_CALCULATOR' },
        { path: '/simulation', permission: 'VIEW_SIMULATION' },
        { path: '/weaving', permission: 'VIEW_DASHBOARD' }, // Assuming weaving also needs VIEW_DASHBOARD
        { path: '/employees', permission: 'VIEW_EMPLOYEES' },
        { path: '/settings', permission: 'MANAGE_SYSTEM' },
    ];

    // Find the first route the user has permission to access
    for (const route of routes) {
        if (permissions.includes(route.permission)) {
            return route.path;
        }
    }

    // Fallback to login if no permissions match
    return '/login';
};
