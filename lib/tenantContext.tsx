'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getRole, getTenantCode } from './auth'
import { type Role } from './permissions'

type Tenant = {
  id: string
  name: string
  code: string
}

type TenantContextType = {
  selectedTenantCode: string
  setSelectedTenantCode: (code: string) => void
  tenants: Tenant[]
  isMasterAdmin: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [selectedTenantCode, setSelectedTenantCode] = useState('')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const role = getRole() as Role
    setIsMasterAdmin(role === 'master_admin')
    
    if (role === 'master_admin') {
      fetch('/api/tenants')
        .then(res => res.json())
        .then(data => {
          const tenantList = Array.isArray(data) ? data : []
          setTenants(tenantList)
          // Auto select first tenant
          if (tenantList.length > 0 && !selectedTenantCode) {
            setSelectedTenantCode(tenantList[0].code)
          }
        })
    } else {
      setSelectedTenantCode(getTenantCode())
    }
  }, [])

  return (
    <TenantContext.Provider value={{ selectedTenantCode, setSelectedTenantCode, tenants, isMasterAdmin }}>
      {mounted ? children : <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
