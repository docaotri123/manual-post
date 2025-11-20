'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-zinc-900 mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý Content</CardTitle>
            <CardDescription>Tạo và lưu template bài đăng</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600">Quản lý nội dung bài đăng Facebook</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quản lý Hình</CardTitle>
            <CardDescription>Upload và quản lý hình ảnh</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600">Lưu trữ hình ảnh trong project</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Đăng bài</CardTitle>
            <CardDescription>Kết hợp content và hình ảnh</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600">Share lên các nền tảng với watermark</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
