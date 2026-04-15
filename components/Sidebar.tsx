'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import {
    Users,
    Settings,
    Shield,
    Key,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronDown,
    ChevronRight
} from 'lucide-react'

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const [permissions, setPermissions] = useState<any>(null)
    const [roleName, setRoleName] = useState<string | null>(null)
    const [adminOpen, setAdminOpen] = useState(false)

    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        fetchPermissions()
    }, [])

    const fetchPermissions = async () => {
        const { data } = await supabase.auth.getSession()
        const userId = data.session?.user.id

        if (!userId) return

        const { data: userData } = await supabase
            .from('users')
            .select(`
        role_id,
        roles:roles!users_role_id_fkey (
          name,
          permissions
        )
      `)
            .eq('id', userId)
            .maybeSingle()

        if (!userData) return

        const roleData = (userData as any).roles

        const role = roleData?.name || null
        const perms = roleData?.permissions || {}

        setRoleName(role)
        setPermissions(perms)

        if (pathname.startsWith('/admin')) {
            setAdminOpen(true)
        }
    }

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved) setCollapsed(saved === 'true')
    }, [])

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(collapsed))
    }, [collapsed])

    const canViewAdmin =
        roleName?.toLowerCase() === 'admin' ||
        permissions?.can_view_admin === true

    return (
        <div
            className={`h-screen bg-gray-900 text-white transition-all duration-300 
      ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                {!collapsed && <span className="text-lg font-semibold">Menu</span>}

                <button onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </button>
            </div>

            {/* Menu */}
            <div className="mt-4 space-y-2 px-2">

                {/* Users (Main) */}
                <MenuItem
                    icon={<Users size={20} />}
                    label="Users"
                    active={pathname === '/'}
                    onClick={() => router.push('/')}
                    collapsed={collapsed}
                />

                {/* Admin Section */}
                {canViewAdmin && (
                    <div>
                        <div
                            onClick={() => setAdminOpen(!adminOpen)}
                            className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <Shield size={20} />
                                {!collapsed && <span>Admin</span>}
                            </div>

                            {!collapsed &&
                                (adminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                        </div>

                        {/* Submenu */}
                        {adminOpen && !collapsed && (
                            <div className="ml-8 mt-2 space-y-2">

                                <SubMenuItem
                                    label="Users"
                                    icon={<Users size={16} />}
                                    active={pathname === '/admin/users'}
                                    onClick={() => router.push('/admin/users')}
                                />

                                <SubMenuItem
                                    label="Roles"
                                    icon={<Key size={16} />}
                                    active={pathname === '/admin/roles'}
                                    onClick={() => router.push('/admin/roles')}
                                />

                            </div>
                        )}
                    </div>
                )}

                {/* Settings */}
                <MenuItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    active={pathname === '/settings'}
                    onClick={() => router.push('/settings')}
                    collapsed={collapsed}
                />
            </div>
        </div>
    )
}

function MenuItem({ icon, label, active, onClick, collapsed }: any) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer
        ${active ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </div>
    )
}

function SubMenuItem({ label, icon, active, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm
        ${active ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
        >
            {icon}
            <span>{label}</span>
        </div>
    )
}