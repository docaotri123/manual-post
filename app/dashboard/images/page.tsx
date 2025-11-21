'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Trash2, Image as ImageIcon, Loader2, Search, LayoutGrid, List, Table, RefreshCw } from 'lucide-react'
import { getUsername } from '@/lib/auth'
import { hasPermission, type Role } from '@/lib/permissions'
import { createThumbnail, generateThumbnailFromUrl } from '@/lib/imageUtils'
import { useTenant } from '@/lib/tenantContext'

type ImageItem = {
  id: string
  name: string
  url: string
  thumbnail?: string
  uploadedAt: string
  createdBy?: 'ai' | 'human'
}

type Tenant = {
  id: string
  name: string
  code: string
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [canUpload, setCanUpload] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [filter, setFilter] = useState<'all' | 'ai' | 'human'>('all')
  const [selectedType, setSelectedType] = useState<'ai' | 'human'>('human')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a' | 'ai' | 'human'>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false)
  const { selectedTenantCode } = useTenant()

  const imagesWithoutThumbnail = images.filter(img => !img.thumbnail)

  const generateMissingThumbnails = async () => {
    if (imagesWithoutThumbnail.length === 0) return
    
    setGeneratingThumbnails(true)
    for (const image of imagesWithoutThumbnail) {
      try {
        const thumbnail = await generateThumbnailFromUrl(image.url)
        await fetch('/api/images', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: image.id, thumbnail })
        })
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${image.name}:`, error)
      }
    }
    
    // Reload images
    const url = selectedTenantCode ? `/api/images?tenantCode=${selectedTenantCode}` : '/api/images'
    const response = await fetch(url)
    const data = await response.json()
    setImages(Array.isArray(data) ? data : [])
    setGeneratingThumbnails(false)
  }
  
  useEffect(() => {
    const userRole = localStorage.getItem('role') as Role
    setCanUpload(hasPermission(userRole, 'images_upload'))
    setCanDelete(hasPermission(userRole, 'images_delete'))
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedTenantCode ? `/api/images?tenantCode=${selectedTenantCode}` : '/api/images'
    fetch(url)
      .then(res => res.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [selectedTenantCode])

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize smaller for Vercel
          const maxSize = 600
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, width, height)
          
          // Compress to 50% quality (smaller)
          resolve(canvas.toDataURL('image/jpeg', 0.5))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setLoading(true)
    for (const file of Array.from(files)) {
      const thumbnail = await createThumbnail(file)
      const compressedUrl = await compressImage(file)
      const now = new Date().toISOString()
      
      const imageData = {
        name: file.name,
        url: compressedUrl,
        thumbnail,
        uploadedAt: now,
        createdBy: selectedType,
        tenantCode: selectedTenantCode
      }
      
      await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageData)
      })
    }
    
    // Reload data from server
    const url = selectedTenantCode ? `/api/images?tenantCode=${selectedTenantCode}` : '/api/images'
    const response = await fetch(url)
    const data = await response.json()
    setImages(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const deleteImage = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (response.ok) {
        // Reload danh sách từ server
        const url = selectedTenantCode ? `/api/images?tenantCode=${selectedTenantCode}` : '/api/images'
        const imagesResponse = await fetch(url)
        const data = await imagesResponse.json()
        setImages(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
    setLoading(false)
  }

  const filteredImages = images
    .filter(image => {
      if (filter === 'all') return true
      return image.createdBy === filter
    })
    .filter(image => 
      image.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        case 'a-z':
          return a.name.localeCompare(b.name)
        case 'z-a':
          return b.name.localeCompare(a.name)
        case 'ai':
          return (a.createdBy === 'ai' ? -1 : 1)
        case 'human':
          return (a.createdBy === 'human' ? -1 : 1)
        default:
          return 0
      }
    })

  const aiCount = images.filter(img => img.createdBy === 'ai').length
  const humanCount = images.filter(img => img.createdBy === 'human').length

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

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Quản lý Hình</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Tổng: {images.length} | AI: {aiCount} | Người: {humanCount}
              {imagesWithoutThumbnail.length > 0 && (
                <span className="text-orange-600 font-medium"> | Thiếu thumbnail: {imagesWithoutThumbnail.length}</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
          {imagesWithoutThumbnail.length > 0 && canUpload && (
            <Button 
              onClick={generateMissingThumbnails} 
              disabled={generatingThumbnails}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {generatingThumbnails ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Tạo Thumbnail ({imagesWithoutThumbnail.length})
            </Button>
          )}
            {canUpload && (
              <Button onClick={() => setShowUploadModal(true)} className="bg-purple-600 hover:bg-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2.5 border border-zinc-200 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="newest">📅 Mới nhất</option>
          <option value="oldest">📅 Cũ nhất</option>
          <option value="a-z">🔤 A → Z</option>
          <option value="z-a">🔤 Z → A</option>
          <option value="ai">🤖 AI trước</option>
          <option value="human">👤 Người trước</option>
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2.5 border border-zinc-200 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Tất cả ({images.length})</option>
          <option value="ai">AI ({aiCount})</option>
          <option value="human">Người ({humanCount})</option>
        </select>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Hình Ảnh</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                  <span className="text-2xl">&times;</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Loại hình ảnh</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-zinc-50 ${selectedType === 'human' ? 'border-green-500 bg-green-50' : 'border-zinc-200'}">
                    <input
                      type="radio"
                      value="human"
                      checked={selectedType === 'human'}
                      onChange={(e) => setSelectedType(e.target.value as 'human')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">👤 Người tạo</span>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-zinc-50 ${selectedType === 'ai' ? 'border-purple-500 bg-purple-50' : 'border-zinc-200'}">
                    <input
                      type="radio"
                      value="ai"
                      checked={selectedType === 'ai'}
                      onChange={(e) => setSelectedType(e.target.value as 'ai')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">🤖 AI tạo</span>
                  </label>
                </div>
              </div>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:bg-zinc-50">
                <Upload className="w-10 h-10 text-zinc-400 mb-2" />
                <p className="text-sm text-zinc-600">Click để upload hoặc kéo thả file</p>
                <p className="text-xs text-zinc-400 mt-1">PNG, JPG, JPEG</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleUpload(e)
                    setShowUploadModal(false)
                  }}
                />
              </label>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="relative aspect-square bg-zinc-100">
              <img
                src={image.thumbnail || image.url}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                  image.createdBy === 'ai' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {image.createdBy === 'ai' ? 'AI' : 'Người'}
                </span>
              </div>
            </div>
            <CardContent className="p-2 sm:p-3">
              <p className="text-xs sm:text-sm font-medium truncate">{image.name}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                {new Date(image.uploadedAt).toLocaleDateString('vi-VN')}
              </p>
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2 h-8 text-xs"
                  onClick={() => deleteImage(image.id)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin-slow" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                  Xóa
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredImages.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img src={image.thumbnail || image.url} alt={image.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{image.name}</h3>
                    <p className="text-sm text-zinc-500">{new Date(image.uploadedAt).toLocaleDateString('vi-VN')}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      image.createdBy === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {image.createdBy === 'ai' ? '🤖 AI' : '👤 Người'}
                    </span>
                  </div>
                  {canDelete && (
                    <Button variant="ghost" size="icon" onClick={() => deleteImage(image.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Hình</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tên</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Loại</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
                      {canDelete && <th className="px-4 py-3 text-right text-sm font-semibold">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImages.map((image) => (
                      <tr key={image.id} className="border-b hover:bg-zinc-50">
                        <td className="px-4 py-3">
                          <img src={image.thumbnail || image.url} alt={image.name} className="w-12 h-12 object-cover rounded" />
                        </td>
                        <td className="px-4 py-3 font-medium">{image.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            image.createdBy === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {image.createdBy === 'ai' ? 'AI' : 'Người'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{new Date(image.uploadedAt).toLocaleDateString('vi-VN')}</td>
                        {canDelete && (
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" onClick={() => deleteImage(image.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="md:hidden space-y-3">
            {filteredImages.map((image) => (
              <Card key={image.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img src={image.url} alt={image.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold text-sm">{image.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          image.createdBy === 'ai' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {image.createdBy === 'ai' ? 'AI' : 'Người'}
                        </span>
                      </div>
                    </div>
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => deleteImage(image.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{new Date(image.uploadedAt).toLocaleDateString('vi-VN')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">
            {searchTerm ? `Không tìm thấy "${searchTerm}"` :
             filter === 'all' ? 'Chưa có hình ảnh nào' : 
             filter === 'ai' ? 'Chưa có hình ảnh AI tạo' : 
             'Chưa có hình ảnh người tạo'}
          </p>
        </div>
      )}
    </div>
  )
}
