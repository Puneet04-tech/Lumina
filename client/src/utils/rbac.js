export const rbacConfig = {
  roles: {
    viewer: {
      name: 'Viewer',
      description: 'Can only view dashboards',
      permissions: ['view_dashboard', 'download_data'],
    },
    analyst: {
      name: 'Analyst',
      description: 'Can upload and analyze data',
      permissions: [
        'view_dashboard',
        'download_data',
        'upload_file',
        'create_dashboard',
        'edit_dashboard',
        'delete_own_dashboard',
      ],
    },
    admin: {
      name: 'Admin',
      description: 'Full system access',
      permissions: [
        'view_dashboard',
        'download_data',
        'upload_file',
        'create_dashboard',
        'edit_dashboard',
        'delete_dashboard',
        'manage_users',
        'system_settings',
        'view_analytics',
      ],
    },
  },
};

export const hasPermission = (userRole, permission) => {
  const role = rbacConfig.roles[userRole];
  if (!role) return false;
  return role.permissions.includes(permission);
};

export const canEditDashboard = (userRole, dashboardCreatorId, currentUserId) => {
  if (userRole === 'admin') return true;
  if (userRole === 'analyst' && dashboardCreatorId === currentUserId) return true;
  return false;
};

export const canDeleteDashboard = (userRole, dashboardCreatorId, currentUserId) => {
  if (userRole === 'admin') return true;
  if (userRole === 'analyst' && dashboardCreatorId === currentUserId) return true;
  return false;
};
