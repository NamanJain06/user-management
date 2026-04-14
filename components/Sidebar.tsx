'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Users, Settings, Shield, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) setCollapsed(saved === 'true')
  }, [])

  // Save collapse state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  const menuItems = [
    { name: 'Users', icon: <Users size={20} />, path: '/' },
    { name: 'Admin', icon: <Shield size={20} />, path: '/admin/users' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ]

  return (
    <div
      className={`h-screen bg-gray-900 text-white transition-all duration-300 
      ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="text-lg font-semibold">Menu</span>}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
      </div>

      {/* Menu */}
      <div className="mt-4 space-y-2 px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path

          return (
            <div
              key={item.name}
              onClick={() => router.push(item.path)}
              title={collapsed ? item.name : ''} // Tooltip
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition
                ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}