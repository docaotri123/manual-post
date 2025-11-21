'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, Copy, X, Check, Loader2, Shuffle, RotateCcw } from 'lucide-react'
import { addWatermark } from '@/lib/watermark'
import { getUsername } from '@/lib/auth'
import { useTenant } from '@/lib/tenantContext'

type Content = {
  id: string
  title: string
  text: string
  icon: string
}

type ImageItem = {
  id: string
  name: string
  url: string
  thumbnail?: string
  createdBy?: 'ai' | 'human'
}

type Tenant = {
  id: string
  name: string
  code: string
}

export default function PostPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const { selectedTenantCode } = useTenant()

  useEffect(() => {
    const contentsUrl = selectedTenantCode ? `/api/contents?tenantCode=${selectedTenantCode}` : '/api/contents'
    const imagesUrl = selectedTenantCode ? `/api/images?tenantCode=${selectedTenantCode}` : '/api/images'
    
    fetch(contentsUrl)
      .then(res => res.json())
      .then(data => setContents(data))
    
    fetch(imagesUrl)
      .then(res => res.json())
      .then(data => setImages(data))
  }, [selectedTenantCode])

  const toggleImage = async (id: string) => {
    const isSelected = selectedImages.includes(id)
    
    if (isSelected) {
      setSelectedImages(prev => prev.filter(i => i !== id))
      setPreviewWatermarks(prev => {
        const newPrev = { ...prev }
        delete newPrev[id]
        return newPrev
      })
    } else {
      setSelectedImages(prev => [...prev, id])
      
      // Add watermark preview
      const img = images.find(i => i.id === id)
      if (img) {
        const now = new Date()
        const watermarkText = `${now.getDate()}/${now.getMonth()+1} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
        const watermarked = await addWatermark(img.url, watermarkText)
        setPreviewWatermarks(prev => ({ ...prev, [id]: watermarked }))
      }
    }
  }

  const [showModal, setShowModal] = useState(false)
  const [watermarkedImages, setWatermarkedImages] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [previewWatermarks, setPreviewWatermarks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'zalo' | 'instagram' | 'other'>('facebook')

  const handleShare = async () => {
    setLoading(true)
    if (!selectedContent) {
      alert('Vui lòng chọn content')
      setLoading(false)
      return
    }

    const selectedImgUrls = images
      .filter(img => selectedImages.includes(img.id))
      .map(img => img.url)

    if (selectedImgUrls.length === 0) {
      alert('Vui lòng chọn ít nhất 1 hình')
      setLoading(false)
      return
    }

    // Add watermark to images
    const now = new Date()
    const watermarkText = `${now.getDate()}/${now.getMonth()+1} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
    const watermarked = await Promise.all(
      selectedImgUrls.map(url => addWatermark(url, watermarkText))
    )
    
    setWatermarkedImages(watermarked)
    
    // Auto copy content
    await navigator.clipboard.writeText(selectedContent.text)
    setCopied(true)
    
    // Auto copy all images to clipboard
    for (const imgUrl of watermarked) {
      try {
        const response = await fetch(imgUrl)
        const blob = await response.blob()
        const pngBlob = await convertToPng(blob)
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngBlob })
        ])
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err) {
        console.error('Copy image failed:', err)
      }
    }
    
    setShowModal(true)
    setLoading(false)
  }

  const convertToPng = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((pngBlob) => {
          resolve(pngBlob!)
        }, 'image/png')
      }
      img.src = URL.createObjectURL(blob)
    })
  }

  const copyToClipboard = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const pngBlob = await convertToPng(blob)
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ])
      alert('Đã copy hình!')
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const shareNative = async () => {
    if (!navigator.share) {
      alert('Trình duyệt không hỗ trợ tính năng share')
      return
    }

    try {
      // Convert watermarked images to File objects
      const files = await Promise.all(
        watermarkedImages.map(async (imgUrl, idx) => {
          const response = await fetch(imgUrl)
          const blob = await response.blob()
          return new File([blob], `image-${idx + 1}.jpg`, { type: 'image/jpeg' })
        })
      )

      // Share content + images via native share sheet
      await navigator.share({
        title: selectedContent!.title,
        text: selectedContent!.text,
        files: files
      })
      
      // Save to history after successful share
      try {
        await fetch('/api/posts-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: selectedContent!.id,
            contentTitle: selectedContent!.title,
            contentIcon: selectedContent!.icon,
            imageIds: selectedImages,
            imageCount: selectedImages.length,
            platform: selectedPlatform,
            postedAt: new Date().toISOString(),
            postedBy: getUsername(),
            tenantCode: selectedTenantCode
          })
        })
      } catch (err) {
        console.error('Failed to save history:', err)
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
        alert('Không thể share. Vui lòng thử lại.')
      }
    }
  }

  const copyContent = async () => {
    if (!selectedContent) return
    await navigator.clipboard.writeText(selectedContent.text)
    alert('Đã copy nội dung!')
  }

  const handleReset = () => {
    setSelectedContent(null)
    setSelectedImages([])
    setPreviewWatermarks({})
  }

  const handleRandomSelect = async () => {
    if (contents.length === 0 || images.length === 0) {
      alert('Cần có ít nhất 1 content và 1 hình!')
      return
    }

    // Random 1 content
    const randomContent = contents[Math.floor(Math.random() * contents.length)]
    setSelectedContent(randomContent)

    // Random 3-5 images with balanced AI/Human ratio
    const numImages = Math.floor(Math.random() * 3) + 3 // 3-5
    const aiImages = images.filter(img => img.createdBy === 'ai')
    const humanImages = images.filter(img => img.createdBy === 'human')
    
    const selectedImages: ImageItem[] = []
    const halfCount = Math.floor(numImages / 2)
    
    // Get half AI, half Human (or as close as possible)
    const shuffledAI = [...aiImages].sort(() => 0.5 - Math.random())
    const shuffledHuman = [...humanImages].sort(() => 0.5 - Math.random())
    
    selectedImages.push(...shuffledAI.slice(0, halfCount))
    selectedImages.push(...shuffledHuman.slice(0, halfCount))
    
    // If odd number, add one more from either type
    if (numImages % 2 !== 0) {
      const remaining = [...shuffledAI.slice(halfCount), ...shuffledHuman.slice(halfCount)]
      if (remaining.length > 0) {
        selectedImages.push(remaining[0])
      }
    }
    
    // If not enough images of one type, fill with the other
    while (selectedImages.length < numImages && selectedImages.length < images.length) {
      const allShuffled = [...images].sort(() => 0.5 - Math.random())
      const notSelected = allShuffled.find(img => !selectedImages.some(s => s.id === img.id))
      if (notSelected) selectedImages.push(notSelected)
      else break
    }
    
    const randomImageIds = selectedImages.map(img => img.id)
    
    // Clear old watermarks
    setPreviewWatermarks({})
    setSelectedImages(randomImageIds)

    // Add watermark preview for selected images
    const now = new Date()
    const watermarkText = `${now.getDate()}/${now.getMonth()+1} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
    const newWatermarks: Record<string, string> = {}
    
    for (const id of randomImageIds) {
      const img = images.find(i => i.id === id)
      if (img) {
        const watermarked = await addWatermark(img.url, watermarkText)
        newWatermarks[id] = watermarked
      }
    }
    
    setPreviewWatermarks(newWatermarks)
  }

  // Sort contents: selected first
  const sortedContents = [...contents].sort((a, b) => {
    if (selectedContent?.id === a.id) return -1
    if (selectedContent?.id === b.id) return 1
    return 0
  })

  // Sort images: selected first
  const sortedImages = [...images].sort((a, b) => {
    const aSelected = selectedImages.includes(a.id)
    const bSelected = selectedImages.includes(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  return (
    <div className="min-h-screen pb-24 lg:pb-0 relative">
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin-slow" />
            <p className="text-lg font-semibold">Đang xử lý...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="p-4 lg:p-6 bg-white border-b sticky top-[57px] lg:top-[61px] z-10 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Đăng bài</h1>
              <p className="text-sm lg:text-base text-zinc-600 mt-1">Chọn content và hình để chia sẻ</p>
            </div>
            <div className="flex gap-2">
              {(selectedContent || selectedImages.length > 0) && (
                <Button onClick={handleReset} variant="outline" className="flex-shrink-0">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
              <Button onClick={handleRandomSelect} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-shrink-0">
                <Shuffle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Random</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-md border">
          <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Copy className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-zinc-900">Content ({contents.length})</h3>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
            {sortedContents.map((content) => (
              <div
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={`p-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                  selectedContent?.id === content.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-zinc-50 border-2 border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{content.icon}</span>
                  <span className="text-base font-semibold truncate">{content.title}</span>
                </div>
              </div>
            ))}
            {contents.length === 0 && (
              <div className="text-center py-8">
                <Copy className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Chưa có content</p>
              </div>
            )}
          </div>
        </div>

        {selectedContent && (
          <div className="bg-white rounded-xl shadow-md border">
            <div className="p-4 bg-green-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-zinc-900">Nội dung đã chọn</h3>
              </div>
              <Button size="sm" variant="outline" onClick={copyContent} className="h-9">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <div className="p-4 max-h-48 overflow-y-auto">
              <p className="text-base leading-relaxed whitespace-pre-wrap text-zinc-700">{selectedContent.text}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border">
          <div className="p-4 bg-purple-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-zinc-900">Hình ảnh ({images.length})</h3>
              </div>
              {selectedImages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-sm px-3 py-1.5 rounded-full font-bold">
                    {selectedImages.length}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedImages([])} className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <X className="w-3 h-3 mr-1" />
                    Bỏ chọn
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-3 gap-3">
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => toggleImage(image.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all active:scale-95 ${
                    selectedImages.includes(image.id) ? 'ring-4 ring-blue-500' : 'ring-2 ring-zinc-200'
                  }`}
                >
                  <img src={previewWatermarks[image.id] || image.url} alt={image.name} className="w-full h-full object-cover" />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    image.createdBy === 'ai' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {image.createdBy === 'ai' ? 'AI' : 'Người'}
                  </div>
                  {selectedImages.includes(image.id) && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-xl">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {images.length === 0 && (
              <div className="text-center py-10">
                <Share2 className="w-14 h-14 text-zinc-300 mx-auto mb-3" />
                <p className="text-base text-zinc-500">Chưa có hình ảnh</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 h-[calc(100vh-120px)]">
        <div className="col-span-3 flex flex-col bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-zinc-900">Content ({contents.length})</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sortedContents.map((content) => (
              <div
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedContent?.id === content.id ? 'bg-blue-600 text-white shadow-md' : 'bg-zinc-50 hover:bg-zinc-100 border'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{content.icon}</span>
                  <span className="text-sm font-semibold truncate">{content.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-6 flex flex-col bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 bg-purple-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-zinc-900">Hình ảnh ({images.length})</h3>
              </div>
              {selectedImages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    Đã chọn: {selectedImages.length}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setSelectedImages([])} className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <X className="w-3 h-3 mr-1" />
                    Bỏ chọn
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-3">
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => toggleImage(image.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImages.includes(image.id) ? 'ring-3 ring-blue-500' : 'hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  <img src={previewWatermarks[image.id] || image.url} alt={image.name} className="w-full h-full object-cover" />
                  <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    image.createdBy === 'ai' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {image.createdBy === 'ai' ? 'AI' : 'Người'}
                  </div>
                  {selectedImages.includes(image.id) && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3 flex flex-col bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-zinc-900">Preview</h3>
            </div>
          </div>
          {selectedContent ? (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex-1 bg-zinc-50 p-4 rounded-lg mb-4 overflow-y-auto border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{selectedContent.text}</p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleShare} disabled={selectedImages.length === 0 || loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin-slow" /> : <Share2 className="w-4 h-4 mr-2" />}
                  Chia sẻ ({selectedImages.length} hình)
                </Button>
                <Button variant="outline" onClick={copyContent} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy nội dung
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Copy className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Chọn content để xem preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Button - Mobile Only */}
      {selectedContent && selectedImages.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur-sm z-[55]">
          <div className="p-4 pb-6">
            <Button 
              onClick={handleShare}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-bold shadow-xl active:scale-95 transition-transform rounded-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 mr-2 animate-spin-slow" /> : <Share2 className="w-6 h-6 mr-2" />}
              Chia sẻ ({selectedImages.length} hình)
            </Button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
              <h2 className="text-base sm:text-lg font-bold">Chia sẻ {watermarkedImages.length} hình</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-3 sm:p-4 overflow-y-auto flex-1">
              <div className="bg-zinc-50 p-3 rounded-lg mb-3">
                <p className="text-xs font-medium mb-2 text-zinc-600">Nội dung:</p>
                <p className="text-xs sm:text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">{selectedContent?.text}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full h-8 text-xs"
                  onClick={copyContent}
                >
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Đã copy' : 'Copy nội dung'}
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="text-xs font-medium mb-2 text-blue-900">Đăng lên nền tảng nào?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedPlatform('facebook')}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedPlatform === 'facebook'
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-zinc-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <span className="text-2xl">📘</span>
                    <p className="text-xs font-semibold mt-1">Facebook</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('zalo')}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedPlatform === 'zalo'
                        ? 'border-sky-500 bg-sky-100'
                        : 'border-zinc-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    <span className="text-2xl">💬</span>
                    <p className="text-xs font-semibold mt-1">Zalo</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('instagram')}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedPlatform === 'instagram'
                        ? 'border-pink-500 bg-pink-100'
                        : 'border-zinc-200 bg-white hover:border-pink-300'
                    }`}
                  >
                    <span className="text-2xl">📷</span>
                    <p className="text-xs font-semibold mt-1">Instagram</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('other')}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      selectedPlatform === 'other'
                        ? 'border-gray-500 bg-gray-100'
                        : 'border-zinc-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">🌐</span>
                    <p className="text-xs font-semibold mt-1">Khác</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {watermarkedImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img 
                      src={img} 
                      alt={`Image ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-1 right-1 text-xs h-7 px-2"
                      onClick={() => copyToClipboard(img)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t space-y-2 flex-shrink-0">
              <Button onClick={shareNative} className="w-full h-11 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share qua App ({selectedPlatform === 'facebook' ? '📘 Facebook' : selectedPlatform === 'zalo' ? '💬 Zalo' : selectedPlatform === 'instagram' ? '📷 Instagram' : '🌐 Khác'})
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="w-full h-10 text-sm">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
