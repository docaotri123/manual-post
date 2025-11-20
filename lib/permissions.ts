export type Role = 'super_admin' | 'admin' | 'editor' | 'viewer'

export const PERMISSIONS = {
  // Users Management
  users_view: ['super_admin'],
  users_create: ['super_admin'],
  users_delete: ['super_admin'],
  
  // Content Management
  content_view: ['super_admin', 'admin', 'editor', 'viewer'],
  content_create: ['super_admin', 'admin', 'editor'],
  content_delete: ['super_admin', 'admin'],
  
  // Images Management
  images_view: ['super_admin', 'admin', 'editor', 'viewer'],
  images_upload: ['super_admin', 'admin', 'editor'],
  images_delete: ['super_admin', 'admin'],
  
  // Post/Share
  post_share: ['super_admin', 'admin', 'editor', 'viewer'],
}

export const hasPermission = (role: Role, permission: keyof typeof PERMISSIONS): boolean => {
  return PERMISSIONS[permission].includes(role)
}

export const canAccessRoute = (role: Role, route: string): boolean => {
  const routePermissions: Record<string, keyof typeof PERMISSIONS> = {
    '/dashboard/users': 'users_view',
    '/dashboard/content': 'content_view',
    '/dashboard/images': 'images_view',
    '/dashboard/post': 'post_share',
  }
  
  const permission = routePermissions[route]
  return permission ? hasPermission(role, permission) : false
}
