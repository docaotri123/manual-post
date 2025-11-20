'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, logout, getUsername } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [username, setUsername] = useState('Admin')

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login')
    } else {
      setUsername(getUsername())
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white/80 backdrop-blur-sm border-b border-zinc-200 px-4 lg:px-6 py-2.5 lg:py-3 sticky top-0 z-20 shadow-sm">
          <div className="flex justify-end items-center min-h-[44px]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-semibold text-zinc-900 leading-tight">{username}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 leading-tight">Media Portal</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-2 sm:px-3 flex-shrink-0"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
