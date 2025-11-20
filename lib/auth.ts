export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('isLoggedIn') === 'true'
}

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()
    
    if (data.success) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', data.user.username)
      localStorage.setItem('role', data.user.role || 'viewer')
      return true
    }
    return false
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

export const logout = (): void => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
}

export const getUsername = (): string => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('username') || 'Admin'
}

export const getRole = (): string => {
  if (typeof window === 'undefined') return 'viewer'
  return localStorage.getItem('role') || 'viewer'
}