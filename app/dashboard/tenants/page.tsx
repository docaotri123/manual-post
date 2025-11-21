'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Plus, Trash2, Loader2, Edit2, CheckCircle, XCircle } from 'lucide-react'
import { getUsername, getRole } from '@/lib/auth'
import { hasPermission, type Role } from '@/lib/permissions'
import { useRouter } from 'next/navigation'

type Tenant = {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive'
  createdAt: string
  createdBy: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const router = useRouter()

  useEffect(() => {
    const role = getRole() as Role
    const hasAccess = hasPermission(role, 'tenants_view')
    setCanManage(hasAccess)
    
    if (!hasAccess) {
      router.push('/dashboard/content')
      return
    }
    
    fetchTenants()
  }, [router])

  const fetchTenants = () => {
    setLoading(true)
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => setTenants(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  const addTenant = async () => {
    if (!name || !code) return
    
    setLoading(true)
    const now = new Date().toISOString()
    const newTenant = {
      name,
      code: code.toUpperCase().replace(/\s+/g, ''),
      status: 'active' as const,
      createdAt: now,
      createdBy: getUsername()
    }
    
    await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTenant)
    })
    
    setName('')
    setCode('')
    fetchTenants()
  }

  const toggleStatus = async (tenant: Tenant) => {
    setLoading(true)
    await fetch('/api/tenants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: tenant.id,
        status: tenant.status === 'active' ? 'inactive' : 'active'
      })
    })
    fetchTenants()
  }

  const deleteTenant = async (id: string) => {
    if (!confirm('Xóa tenant này? Tất cả data liên quan sẽ không thể truy cập!')) return
    
    setLoading(true)
    await fetch('/api/tenants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchTenants()
  }

  if (!canManage) {
    return null
  }

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-lg font-semibold">Đang xử lý...</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Quản lý Tenants</h1>
            <p className="text-sm text-zinc-500 mt-1">Quản lý các tổ chức/công ty sử dụng hệ thống</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tạo Tenant Mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tên Tenant</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Công ty ABC"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Mã Tenant</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: ABC123"
                className="uppercase"
              />
              <p className="text-xs text-zinc-500 mt-1">Mã ngắn gọn, chỉ dùng chữ và số</p>
            </div>
          </div>
          
          <Button onClick={addTenant} disabled={loading || !name || !code}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Tạo Tenant
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Danh sách Tenants ({tenants.length})</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className={tenant.status === 'active' ? 'border-green-200' : 'border-red-200'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      tenant.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {tenant.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Mã Tenant:</span>
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded font-bold text-blue-900">{tenant.code}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Tạo bởi:</span>
                  <span className="font-medium">{tenant.createdBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">Ngày tạo:</span>
                  <span className="text-xs">{new Date(tenant.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => toggleStatus(tenant)}
                  disabled={loading}
                >
                  {tenant.status === 'active' ? 'Tắt' : 'Bật'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTenant(tenant.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">Chưa có tenant nào</p>
        </div>
      )}
    </div>
  )
}
