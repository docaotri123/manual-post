'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Image, Share2, Menu, X, ChevronLeft, ChevronRight, Users, History, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRole } from '@/lib/auth'
import { canAccessRoute, type Role } from '@/lib/permissions'

const menuItems = [
  { href: '/dashboard/tenants', label: 'Quản lý Tenants', icon: Building2, color: 'from-cyan-500 to-blue-500' },
  { href: '/dashboard/content', label: 'Quản lý Content', icon: FileText, color: 'from-blue-500 to-indigo-500' },
  { href: '/dashboard/images', label: 'Quản lý Hình', icon: Image, color: 'from-purple-500 to-pink-500' },
  { href: '/dashboard/post', label: 'Đăng bài', icon: Share2, color: 'from-green-500 to-emerald-500' },
  { href: '/dashboard/history', label: 'Lịch sử', icon: History, color: 'from-amber-500 to-yellow-500' },
  { href: '/dashboard/users', label: 'Quản lý Users', icon: Users, color: 'from-orange-500 to-red-500' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState<Role>('viewer')
  
  useEffect(() => {
    setUserRole(getRole() as Role)
  }, [])
  
  const visibleMenuItems = menuItems.filter(item => canAccessRoute(userRole, item.href))

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white transition-all duration-300 shadow-2xl',
          isOpen ? 'translate-x-0 z-[50]' : '-translate-x-full lg:translate-x-0 -z-10 lg:z-auto',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-700/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Media Portal
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Quản lý nội dung</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-lg items-center justify-center transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? `bg-gradient-to-r ${item.color} shadow-lg scale-105`
                    : 'hover:bg-zinc-700/50 text-zinc-300 hover:text-white'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                  isActive ? 'bg-white/20' : 'bg-zinc-700 group-hover:bg-zinc-600'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-700/50">
            <div className="bg-zinc-700/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400">Version 1.0.0</p>
              <p className="text-xs text-zinc-500 mt-1">© 2025 Media Portal</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
