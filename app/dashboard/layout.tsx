'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, logout, getUsername } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { TenantProvider, useTenant } from '@/lib/tenantContext'

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
    <TenantProvider>
      <DashboardContent username={username} handleLogout={handleLogout}>
        {children}
      </DashboardContent>
    </TenantProvider>
  )
}

function DashboardContent({ username, handleLogout, children }: { username: string, handleLogout: () => void, children: React.ReactNode }) {
  const { selectedTenantCode, setSelectedTenantCode, tenants, isMasterAdmin } = useTenant()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center h-16 px-4 lg:px-6 gap-4">
            {/* Left: Tenant Selector */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="lg:hidden w-14" /> {/* Spacer for mobile menu button */}
              {isMasterAdmin && tenants.length > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200">
                  <span className="text-xs font-medium text-blue-700 whitespace-nowrap hidden sm:inline">Tenant:</span>
                  <select
                    value={selectedTenantCode}
                    onChange={(e) => setSelectedTenantCode(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-blue-900 focus:outline-none cursor-pointer"
                  >
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.code}>
                        {tenant.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right: User Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-zinc-900 leading-tight">{username}</p>
                  <p className="text-xs text-zinc-500 leading-tight">Media Portal</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-zinc-100">
                      <p className="text-sm font-semibold text-zinc-900">{username}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Media Portal</p>
                    </div>
                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-3">
                        <User className="w-4 h-4" />
                        <span>Thông tin tài khoản</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-3">
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                      </button>
                    </div>
                    <div className="border-t border-zinc-100 py-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
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
