'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, LayoutGrid, List, Table, TrendingUp, RefreshCw, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { useTenant } from '@/lib/tenantContext'

type PostHistory = {
  id: string
  contentId: string
  contentTitle: string
  contentIcon: string
  imageIds: string[]
  imageCount: number
  platform: 'facebook' | 'zalo' | 'instagram' | 'other'
  postedAt: string
  postedBy: string
  notes?: string
}

const PLATFORMS = {
  facebook: { label: 'Facebook', icon: '📘', color: 'bg-blue-100 text-blue-700', bgColor: 'bg-blue-50' },
  zalo: { label: 'Zalo', icon: '💬', color: 'bg-sky-100 text-sky-700', bgColor: 'bg-sky-50' },
  instagram: { label: 'Instagram', icon: '📷', color: 'bg-pink-100 text-pink-700', bgColor: 'bg-pink-50' },
  other: { label: 'Khác', icon: '🌐', color: 'bg-gray-100 text-gray-700', bgColor: 'bg-gray-50' }
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<PostHistory[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('list')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterTime, setFilterTime] = useState<'week' | 'month' | 'custom'>('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [selectedHistory, setSelectedHistory] = useState<PostHistory | null>(null)
  const [historyImages, setHistoryImages] = useState<any[]>([])
  const { selectedTenantCode } = useTenant()

  useEffect(() => {
    if (selectedHistory) {
      const url = selectedTenantCode ? `/api/images?tenantCode=${selectedTenantCode}` : '/api/images'
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const imgs = Array.isArray(data) ? data : []
          const filtered = imgs.filter(img => selectedHistory.imageIds.includes(img.id))
          setHistoryImages(filtered)
        })
    } else {
      setHistoryImages([])
    }
  }, [selectedHistory, selectedTenantCode])

  const fetchHistories = useCallback(() => {
    setLoading(true)
    let url = '/api/posts-history'
    
    if (filterTime === 'custom' && fromDate && toDate) {
      url = `/api/posts-history?from=${fromDate}&to=${toDate}`
    } else {
      const days = filterTime === 'week' ? 7 : 30
      url = `/api/posts-history?days=${days}`
    }
    
    if (selectedTenantCode) {
      url += url.includes('?') ? `&tenantCode=${selectedTenantCode}` : `?tenantCode=${selectedTenantCode}`
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => setHistories(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch history:', err))
      .finally(() => setLoading(false))
  }, [filterTime, fromDate, toDate, selectedTenantCode])

  useEffect(() => {
    fetchHistories()
  }, [fetchHistories])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterPlatform, filterTime, sortBy])

  const stats = {
    total: histories.length,
    facebook: histories.filter(h => h.platform === 'facebook').length,
    zalo: histories.filter(h => h.platform === 'zalo').length,
    instagram: histories.filter(h => h.platform === 'instagram').length,
    other: histories.filter(h => h.platform === 'other').length,
  }

  const filteredHistories = histories
    .filter(h => filterPlatform === 'all' || h.platform === filterPlatform)
    .sort((a, b) => {
      const timeA = new Date(a.postedAt).getTime()
      const timeB = new Date(b.postedAt).getTime()
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB
    })

  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage)
  const paginatedHistories = filteredHistories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Vừa xong'
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Lịch sử Đăng bài</h1>
              <p className="text-sm text-zinc-500 mt-1">Theo dõi các bài đã đăng lên các nền tảng</p>
            </div>
          </div>
          <Button 
            onClick={fetchHistories} 
            disabled={loading}
            variant="outline"
            className="flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-amber-600 font-medium">Tổng số bài</p>
                <p className="text-2xl lg:text-3xl font-bold text-amber-900 mt-1">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-blue-600 font-medium">Facebook</p>
                <p className="text-2xl lg:text-3xl font-bold text-blue-900 mt-1">{stats.facebook}</p>
              </div>
              <span className="text-3xl lg:text-4xl">📘</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-sky-600 font-medium">Zalo</p>
                <p className="text-2xl lg:text-3xl font-bold text-sky-900 mt-1">{stats.zalo}</p>
              </div>
              <span className="text-3xl lg:text-4xl">💬</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-pink-600 font-medium">Instagram</p>
                <p className="text-2xl lg:text-3xl font-bold text-pink-900 mt-1">{stats.instagram}</p>
              </div>
              <span className="text-3xl lg:text-4xl">📷</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Khác</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{stats.other}</p>
              </div>
              <span className="text-3xl lg:text-4xl">🌐</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Tất cả nền tảng ({stats.total})</option>
            <option value="facebook">📘 Facebook ({stats.facebook})</option>
            <option value="zalo">💬 Zalo ({stats.zalo})</option>
            <option value="instagram">📷 Instagram ({stats.instagram})</option>
            <option value="other">🌐 Khác ({stats.other})</option>
          </select>

          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value as any)}
            className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="week">📅 7 ngày qua</option>
            <option value="month">📅 30 ngày qua</option>
            <option value="custom">📅 Tùy chỉnh</option>
          </select>

          {filterTime === 'custom' && (
            <div className="flex gap-2 flex-1 items-center">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-zinc-500">→</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                className="px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <Button
                onClick={fetchHistories}
                disabled={!fromDate || !toDate || loading}
                size="sm"
                className="flex-shrink-0"
              >
                Tìm
              </Button>
            </div>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
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
          
          {filteredHistories.length > 0 && (
            <p className="text-sm text-zinc-600">
              Hiển thị {filteredHistories.length} kết quả
            </p>
          )}
        </div>
      </div>

      {paginatedHistories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <History className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">Chưa có lịch sử đăng bài</p>
            <p className="text-zinc-400 text-sm mt-2">Các bài đăng sẽ được lưu lại tại đây</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedHistories.map((history) => {
                const platform = PLATFORMS[history.platform]
                return (
                  <Card key={history.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedHistory(history)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">{history.contentIcon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-zinc-900 truncate">{history.contentTitle}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${platform.color}`}>
                              {platform.icon} {platform.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                              {history.imageCount} hình
                            </span>
                          </div>
                        </div>
                      </div>
                      {history.notes && (
                        <p className="text-xs text-zinc-600 mb-2 line-clamp-2">💬 {history.notes}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>👤 {history.postedBy}</span>
                        <span>🕐 {formatTime(history.postedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3">
              {paginatedHistories.map((history) => {
                const platform = PLATFORMS[history.platform]
                return (
                  <Card key={history.id} className={`hover:shadow-md transition-shadow cursor-pointer ${platform.bgColor}`} onClick={() => setSelectedHistory(history)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl flex-shrink-0">{history.contentIcon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-zinc-900">{history.contentTitle}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${platform.color}`}>
                                {platform.icon} {platform.label}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-800">
                                {history.imageCount} hình
                              </span>
                            </div>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-zinc-700 mb-2">💬 {history.notes}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              👤 <span className="font-medium">{history.postedBy}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              🕐 <span>{formatTime(history.postedAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {viewMode === 'table' && (
            <>
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">Content</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">Nền tảng</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">Hình ảnh</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">Người đăng</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">Thời gian</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-700">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistories.map((history) => {
                          const platform = PLATFORMS[history.platform]
                          return (
                            <tr key={history.id} className="border-b hover:bg-zinc-50 cursor-pointer" onClick={() => setSelectedHistory(history)}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{history.contentIcon}</span>
                                  <span className="font-medium text-zinc-900">{history.contentTitle}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${platform.color}`}>
                                  {platform.icon} {platform.label}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-800">
                                  {history.imageCount} hình
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-zinc-700">{history.postedBy}</td>
                              <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{formatTime(history.postedAt)}</td>
                              <td className="px-4 py-3 text-sm text-zinc-600 max-w-xs truncate">{history.notes || '-'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="md:hidden space-y-3">
                {paginatedHistories.map((history) => {
                  const platform = PLATFORMS[history.platform]
                  return (
                    <Card key={history.id} className="cursor-pointer" onClick={() => setSelectedHistory(history)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-3xl">{history.contentIcon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-zinc-900 mb-2">{history.contentTitle}</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 w-20">Nền tảng:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${platform.color}`}>
                                  {platform.icon} {platform.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 w-20">Hình ảnh:</span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-800">
                                  {history.imageCount} hình
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 w-20">Người đăng:</span>
                                <span className="text-zinc-700">{history.postedBy}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500 w-20">Thời gian:</span>
                                <span className="text-zinc-700">{formatTime(history.postedAt)}</span>
                              </div>
                              {history.notes && (
                                <div className="flex gap-2">
                                  <span className="text-zinc-500 w-20">Ghi chú:</span>
                                  <span className="text-zinc-700 flex-1">{history.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-9"
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-zinc-400">...</span>
                  }
                  return null
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHistory(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-0">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedHistory.contentIcon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{selectedHistory.contentTitle}</h2>
                    <p className="text-sm text-zinc-500">Chi tiết bài đăng</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedHistory(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Thông tin chung
                  </h3>
                  <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Nền tảng:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PLATFORMS[selectedHistory.platform].color}`}>
                        {PLATFORMS[selectedHistory.platform].icon} {PLATFORMS[selectedHistory.platform].label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Số lượng hình:</span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-200 text-zinc-800">
                        {selectedHistory.imageCount} hình
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Người đăng:</span>
                      <span className="text-sm font-medium text-zinc-900">{selectedHistory.postedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">Thời gian:</span>
                      <span className="text-sm font-medium text-zinc-900">
                        {new Date(selectedHistory.postedAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedHistory.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Ghi chú
                    </h3>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selectedHistory.notes}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Danh sách hình ảnh ({selectedHistory.imageCount})
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    {historyImages.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {historyImages.map((img, idx) => (
                          <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm">
                            <img 
                              src={img.thumbnail || img.url} 
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                              {idx + 1}
                            </div>
                            <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                              img.createdBy === 'ai' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              {img.createdBy === 'ai' ? 'AI' : 'Người'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-zinc-500">
                        Đang tải hình...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    ID Tham chiếu
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">Post ID:</span>
                      <code className="text-xs bg-white px-2 py-1 rounded border font-mono">{selectedHistory.id}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">Content ID:</span>
                      <code className="text-xs bg-white px-2 py-1 rounded border font-mono">{selectedHistory.contentId}</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
