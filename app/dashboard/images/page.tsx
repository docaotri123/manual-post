'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import { getUsername, getRole } from '@/lib/auth'
import { hasPermission, type Role } from '@/lib/permissions'

type ImageItem = {
  id: string
  name: string
  url: string
  uploadedAt: string
  createdBy?: 'ai' | 'human'
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [canUpload, setCanUpload] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [filter, setFilter] = useState<'all' | 'ai' | 'human'>('all')
  const [selectedType, setSelectedType] = useState<'ai' | 'human'>('human')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('date')
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    const role = getRole() as Role
    setCanUpload(hasPermission(role, 'images_upload'))
    setCanDelete(hasPermission(role, 'images_delete'))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setImages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

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
      const compressedUrl = await compressImage(file)
      const now = new Date().toISOString()
      
      const imageData = {
        name: file.name,
        url: compressedUrl,
        uploadedAt: now,
        createdBy: selectedType
      }
      
      await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageData)
      })
    }
    
    // Reload data from server
    const response = await fetch('/api/images')
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
        const imagesResponse = await fetch('/api/images')
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
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'type':
          return (a.createdBy || 'human').localeCompare(b.createdBy || 'human')
        default:
          return 0
      }
    })

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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">Quản lý Hình</h1>
        
        {/* Search & Sort - Mobile/Desktop */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'type')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sắp xếp theo ngày</option>
            <option value="name">Sắp xếp theo tên</option>
            <option value="type">Sắp xếp theo loại</option>
          </select>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Tất cả ({images.length})
          </button>
          <button
            onClick={() => setFilter('human')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${filter === 'human' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Người tạo ({images.filter(img => img.createdBy === 'human').length})
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${filter === 'ai' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            AI tạo ({images.filter(img => img.createdBy === 'ai').length})
          </button>
        </div>
      </div>
      
      {canUpload && (
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Upload Hình Ảnh</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="mb-3 sm:mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại hình ảnh:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'ai' | 'human')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="human">Người tạo</option>
              <option value="ai">AI tạo</option>
            </select>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-zinc-300 rounded-lg cursor-pointer hover:bg-zinc-50 active:bg-zinc-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400 mb-2" />
              <p className="text-xs sm:text-sm text-zinc-600 text-center px-2">Click để upload hoặc kéo thả file</p>
              <p className="text-xs text-zinc-400">PNG, JPG, JPEG</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleUpload}
            />
          </label>
        </CardContent>
      </Card>
      )}

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="relative aspect-square bg-zinc-100">
              <img
                src={image.url}
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

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">
            {filter === 'all' ? 'Chưa có hình ảnh nào' : 
             filter === 'ai' ? 'Chưa có hình ảnh AI tạo' : 
             'Chưa có hình ảnh người tạo'}
          </p>
        </div>
      )}
    </div>
  )
}
