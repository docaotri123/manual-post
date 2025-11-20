'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Trash2, Loader2, Shield, Edit2, AlertCircle } from 'lucide-react'
import { getUsername, getRole } from '@/lib/auth'
import { hasPermission, type Role } from '@/lib/permissions'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  username: string
  password: string
  role: 'super_admin' | 'admin' | 'editor' | 'viewer'
  email: string
  createdAt: string
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-700', icon: '👑' },
  { value: 'admin', label: 'Admin', color: 'bg-blue-100 text-blue-700', icon: '🔧' },
  { value: 'editor', label: 'Editor', color: 'bg-green-100 text-green-700', icon: '✏️' },
  { value: 'viewer', label: 'Viewer', color: 'bg-gray-100 text-gray-700', icon: '👁️' }
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<User['role']>('viewer')
  const [loading, setLoading] = useState(false)
  const [canManageUsers, setCanManageUsers] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const role = getRole() as Role
    const hasAccess = hasPermission(role, 'users_view')
    setCanManageUsers(hasAccess)
    
    if (!hasAccess) {
      router.push('/dashboard/post')
      return
    }
    setLoading(true)
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [router])

  const addUser = async () => {
    if (!username || !password || !email) return
    
    setLoading(true)
    const now = new Date().toISOString()
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      email,
      role,
      createdAt: now,
      createdBy: getUsername(),
      updatedAt: now
    } as any
    
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    
    setUsers([...users, newUser])
    setUsername('')
    setPassword('')
    setEmail('')
    setRole('viewer')
    setLoading(false)
  }

  const deleteUser = async (id: string) => {
    setLoading(true)
    await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    setUsers(users.filter(u => u.id !== id))
    setLoading(false)
  }

  const getRoleInfo = (roleValue: string) => {
    return ROLES.find(r => r.value === roleValue) || ROLES[3]
  }

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-zinc-600">Bạn không có quyền quản lý users</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin-slow" />
            <p className="text-lg font-semibold">Đang xử lý...</p>
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-bold text-zinc-900 mb-6">Quản lý Users</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thêm User Mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập password..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as User['role'])}
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Button onClick={addUser} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin-slow" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Thêm User
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const roleInfo = getRoleInfo(user.role)
          return (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-zinc-600" />
                      <CardTitle className="text-lg">{user.username}</CardTitle>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                      <span>{roleInfo.icon}</span>
                      {roleInfo.label}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUser(user.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-zinc-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-zinc-400 text-xs">
                    Tạo: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">Chưa có user nào</p>
        </div>
      )}
    </div>
  )
}
