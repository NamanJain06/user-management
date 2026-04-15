'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import {
    Users,
    Settings,
    Shield,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react'

type RoleType = {
    name: string
    permissions: {
        can_view_admin?: boolean
        can_create_user?: boolean
        can_edit_user?: boolean
        can_delete_user?: boolean
    }
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const [permissions, setPermissions] = useState<any>(null)
    const [roleName, setRoleName] = useState<string | null>(null)

    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        fetchPermissions()
    }, [])

    const fetchPermissions = async () => {

        const { data } = await supabase.auth.getSession()
        const userId = data.session?.user.id

        if (!userId) return

        const { data: userData, error } = await supabase
            .from('users')
            .select(`
        id,
        role_id,
        roles:roles!users_role_id_fkey (
          name,
          permissions
        )
      `)
            .eq('id', userId)
            .maybeSingle()

        if (error) {
            console.error('Permission fetch failed:', error)
            return
        }
        if (!userData) return

        const rawRoles = (userData as any).roles

        const roleData: RoleType | null = Array.isArray(rawRoles)
            ? rawRoles[0]
            : rawRoles

        const role = roleData?.name || null
        const perms = roleData?.permissions || {}

        setRoleName(role)
        setPermissions(perms)
    }

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved) setCollapsed(saved === 'true')
    }, [])

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(collapsed))
    }, [collapsed])

    const canViewAdmin =
        roleName !== null &&
        (
            roleName.toLowerCase() === 'admin' ||
            permissions?.can_view_admin === true
        )

    const menuItems = [
        { name: 'Users', icon: <Users size={20} />, path: '/' },
    ]

    if (canViewAdmin) {
        menuItems.push({
            name: 'Admin',
            icon: <Shield size={20} />,
            path: '/admin/users',
        })
    }

    menuItems.push({
        name: 'Settings',
        icon: <Settings size={20} />,
        path: '/settings',
    })

    if (roleName === null && permissions === null) {
        return <div className="text-white p-4">Loading...</div>
    }

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
                            title={collapsed ? item.name : ''}
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