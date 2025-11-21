'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Save, Trash2, Loader2, LayoutGrid, List, Table, Edit, ArrowUpDown } from 'lucide-react'
import { getUsername } from '@/lib/auth'
import { hasPermission, type Role } from '@/lib/permissions'
import { useTenant } from '@/lib/tenantContext'

type Content = {
  id: string
  title: string
  text: string
  icon: string
  createdAt: string
}

type Tenant = {
  id: string
  name: string
  code: string
}

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [icon, setIcon] = useState('📝')
  const [loading, setLoading] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a' | 'shortest' | 'longest'>('newest')
  const { selectedTenantCode } = useTenant()
  
  useEffect(() => {
    const userRole = localStorage.getItem('role') as Role
    setCanCreate(hasPermission(userRole, 'content_create'))
    setCanDelete(hasPermission(userRole, 'content_delete'))
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedTenantCode ? `/api/contents?tenantCode=${selectedTenantCode}` : '/api/contents'
    fetch(url)
      .then(res => res.json())
      .then(data => setContents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [selectedTenantCode])

  const saveContent = async () => {
    if (!title || !text) return
    
    setLoading(true)
    
    if (editingContent) {
      // Update existing content
      const contentData = {
        id: editingContent.id,
        title,
        text,
        icon,
        updatedAt: new Date().toISOString()
      }
      
      await fetch('/api/contents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData)
      })
      
      setContents(contents.map(c => c.id === editingContent.id ? { ...c, ...contentData } : c))
      setEditingContent(null)
    } else {
      // Create new content
      const now = new Date().toISOString()
      const contentData = {
        title,
        text,
        icon,
        createdAt: now,
        createdBy: getUsername(),
        updatedAt: now,
        tenantCode: selectedTenantCode
      }
      
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData)
      })
      
      const newContent = await response.json()
      setContents([...contents, newContent])
    }
    
    setTitle('')
    setText('')
    setIcon('📝')
    setShowCreateModal(false)
    setLoading(false)
  }

  const deleteContent = async (id: string) => {
    setLoading(true)
    await fetch('/api/contents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    
    setContents(contents.filter(c => c.id !== id))
    setLoading(false)
  }

  const editContent = (content: Content) => {
    setEditingContent(content)
    setTitle(content.title)
    setText(content.text)
    setIcon(content.icon)
    setShowCreateModal(true)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingContent(null)
    setTitle('')
    setText('')
    setIcon('📝')
  }

  const sortedContents = [...contents].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'a-z':
        return a.title.localeCompare(b.title)
      case 'z-a':
        return b.title.localeCompare(a.title)
      case 'shortest':
        return a.text.length - b.text.length
      case 'longest':
        return b.text.length - a.text.length
      default:
        return 0
    }
  })

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin-slow" />
            <p className="text-lg font-semibold">Đang xử lý...</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Quản lý Content</h1>
          <p className="text-sm text-zinc-500 mt-1">Tổng: {contents.length} content</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">📅 Mới nhất</option>
            <option value="oldest">📅 Cũ nhất</option>
            <option value="a-z">🔤 A → Z</option>
            <option value="z-a">🔤 Z → A</option>
            <option value="shortest">📏 Ngắn nhất</option>
            <option value="longest">📏 Dài nhất</option>
          </select>
        </div>
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')}>
            <Table className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingContent ? 'Chỉnh sửa Content' : 'Tạo Content Mới'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <span className="text-2xl">&times;</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Icon</label>
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📝" className="w-20" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tiêu đề</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nội dung</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập nội dung bài đăng..."
                  className="w-full min-h-[200px] px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeModal}>Hủy</Button>
                <Button onClick={saveContent} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingContent ? 'Cập nhật' : 'Lưu Content'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedContents.map((content) => (
            <Card key={content.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{content.icon}</span>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {canCreate && (
                      <Button variant="ghost" size="icon" onClick={() => editContent(content)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 whitespace-pre-wrap line-clamp-4">{content.text}</p>
                <p className="text-xs text-zinc-400 mt-2">{new Date(content.createdAt).toLocaleDateString('vi-VN')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedContents.map((content) => (
            <Card key={content.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{content.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
                    <p className="text-sm text-zinc-600 line-clamp-2">{content.text}</p>
                    <p className="text-xs text-zinc-400 mt-2">{new Date(content.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex gap-1">
                    {canCreate && (
                      <Button variant="ghost" size="icon" onClick={() => editContent(content)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Icon</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tiêu đề</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nội dung</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
                      {(canCreate || canDelete) && <th className="px-4 py-3 text-right text-sm font-semibold">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedContents.map((content) => (
                      <tr key={content.id} className="border-b hover:bg-zinc-50">
                        <td className="px-4 py-3 text-2xl">{content.icon}</td>
                        <td className="px-4 py-3 font-medium">{content.title}</td>
                        <td className="px-4 py-3 text-sm text-zinc-600 max-w-md truncate">{content.text}</td>
                        <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{new Date(content.createdAt).toLocaleDateString('vi-VN')}</td>
                        {(canCreate || canDelete) && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1 justify-end">
                              {canCreate && (
                                <Button variant="ghost" size="icon" onClick={() => editContent(content)}>
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)}>
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {sortedContents.map((content) => (
              <Card key={content.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{content.icon}</span>
                      <h3 className="font-semibold">{content.title}</h3>
                    </div>
                    <div className="flex gap-1">
                      {canCreate && (
                        <Button variant="ghost" size="icon" onClick={() => editContent(content)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => deleteContent(content.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-3 mb-2">{content.text}</p>
                  <p className="text-xs text-zinc-400">{new Date(content.createdAt).toLocaleDateString('vi-VN')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
