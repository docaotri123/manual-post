export type Role = 'master_admin' | 'super_admin' | 'admin' | 'editor' | 'viewer'

export const PERMISSIONS = {
  // Tenant Management
  tenants_view: ['master_admin'],
  tenants_create: ['master_admin'],
  tenants_delete: ['master_admin'],
  
  // Users Management
  users_view: ['master_admin', 'super_admin'],
  users_create: ['master_admin', 'super_admin'],
  users_delete: ['master_admin', 'super_admin'],
  
  // Content Management
  content_view: ['master_admin', 'super_admin', 'admin', 'editor', 'viewer'],
  content_create: ['master_admin', 'super_admin', 'admin', 'editor'],
  content_delete: ['master_admin', 'super_admin', 'admin'],
  
  // Images Management
  images_view: ['master_admin', 'super_admin', 'admin', 'editor', 'viewer'],
  images_upload: ['master_admin', 'super_admin', 'admin', 'editor'],
  images_delete: ['master_admin', 'super_admin', 'admin'],
  
  // Post/Share
  post_share: ['master_admin', 'super_admin', 'admin', 'editor', 'viewer'],
  
  // History
  history_view: ['master_admin', 'super_admin', 'admin', 'editor', 'viewer'],
}

export const hasPermission = (role: Role, permission: keyof typeof PERMISSIONS): boolean => {
  return PERMISSIONS[permission].includes(role)
}

export const canAccessRoute = (role: Role, route: string): boolean => {
  const routePermissions: Record<string, keyof typeof PERMISSIONS> = {
    '/dashboard/tenants': 'tenants_view',
    '/dashboard/users': 'users_view',
    '/dashboard/content': 'content_view',
    '/dashboard/images': 'images_view',
    '/dashboard/post': 'post_share',
    '/dashboard/history': 'history_view',
  }
  
  const permission = routePermissions[route]
  return permission ? hasPermission(role, permission) : false
}
