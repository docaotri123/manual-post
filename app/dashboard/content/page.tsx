'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Save, Trash2, Loader2 } from 'lucide-react'
import { getUsername, getRole } from '@/lib/auth'
import { hasPermission, type Role } from '@/lib/permissions'

type Content = {
  id: string
  title: string
  text: string
  icon: string
  createdAt: string
}

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [icon, setIcon] = useState('📝')
  const [loading, setLoading] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  
  useEffect(() => {
    const role = getRole() as Role
    setCanCreate(hasPermission(role, 'content_create'))
    setCanDelete(hasPermission(role, 'content_delete'))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch('/api/contents')
      .then(res => res.json())
      .then(data => setContents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const saveContent = async () => {
    if (!title || !text) return
    
    setLoading(true)
    const now = new Date().toISOString()
    const contentData = {
      title,
      text,
      icon,
      createdAt: now,
      createdBy: getUsername(),
      updatedAt: now
    }
    
    const response = await fetch('/api/contents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentData)
    })
    
    const newContent = await response.json()
    setContents([...contents, newContent])
    setTitle('')
    setText('')
    setIcon('📝')
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
      <h1 className="text-3xl font-bold text-zinc-900 mb-6">Quản lý Content</h1>
      
      {canCreate && (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tạo Content Mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Icon</label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📝"
              className="w-20"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tiêu đề</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Nội dung</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập nội dung bài đăng..."
              className="w-full min-h-[200px] px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
          <Button onClick={saveContent} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin-slow" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu Content
          </Button>
        </CardContent>
      </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{content.icon}</span>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteContent(content.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 whitespace-pre-wrap line-clamp-4">
                {content.text}
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                {new Date(content.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
