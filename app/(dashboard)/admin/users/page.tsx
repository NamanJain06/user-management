'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import AddUserForm from '@/components/AddUserForm'
import DeleteUserModal from '@/components/DeleteUserModal'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'

export default function UsersAdmin() {
    const [users, setUsers] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [loading, setLoading] = useState(true)

    const [permissions, setPermissions] = useState<any>(null)
    const [roleName, setRoleName] = useState<string | null>(null)

    const router = useRouter()

    type RoleType = {
        name: string
        permissions: {
            can_view_admin?: boolean
            can_create_user?: boolean
            can_edit_user?: boolean
            can_delete_user?: boolean
        }
    }


    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {

        const { data } = await supabase.auth.getSession()

        console.log('SESSION:', data)

        if (!data.session) {
            router.replace('/login')
            return
        }

        const userId = data.session.user.id

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

        if (error || !userData) {
            router.replace('/')
            return
        }

        const rawRoles = userData.roles

        const roleData = Array.isArray(rawRoles)
            ? rawRoles[0]
            : rawRoles

        const role = roleData?.name ?? null
        const perms = roleData?.permissions ?? {}

        setRoleName(role)
        setPermissions(perms)

        const isAdmin = role?.toLowerCase() === 'admin'
        const canView = perms?.can_view_admin === true

        if (!isAdmin && !canView) {
            router.replace('/')
            return
        }

        await fetchUsers()
        setLoading(false)
    }

    const fetchUsers = async () => {
        const { data } = await supabase.from('users').select('*')
        setUsers(data || [])
    }

    const handleEdit = (user: any) => {
        setEditingUser(user)
        setShowForm(true)
    }

    const confirmDelete = async () => {
        if (!deleteUserId) return

        setDeleteLoading(true)

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', deleteUserId)

        setDeleteLoading(false)

        if (error) {
            alert('Error deleting user')
        } else {
            setDeleteUserId(null)
            fetchUsers()
        }
    }

    if (loading) return <Loader />

    const canCreate = roleName?.toLowerCase() === 'admin' || permissions?.can_create_user
    const canEdit = roleName?.toLowerCase() === 'admin' || permissions?.can_edit_user
    const canDelete = roleName?.toLowerCase() === 'admin' || permissions?.can_delete_user

    return (
        <div className="max-w-5xl mx-auto">

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Users</h1>

                {canCreate && (
                    <button
                        onClick={() => {
                            setEditingUser(null)
                            setShowForm(true)
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Add User
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded shadow">
                {users.length === 0 ? (
                    <p className="text-gray-500">No users found</p>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className="flex justify-between items-center border-b py-2"
                        >
                            <div>
                                <div>{user.name}</div>
                                <div className="text-gray-500 text-sm">{user.email}</div>
                            </div>

                            <div className="flex gap-2">
                                {canEdit && (
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                )}

                                {canDelete && (
                                    <button
                                        onClick={() => setDeleteUserId(user.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showForm && (
                <AddUserForm
                    onClose={() => {
                        setShowForm(false)
                        setEditingUser(null)
                    }}
                    onSuccess={fetchUsers}
                    editUser={editingUser}
                />
            )}

            {deleteUserId && (
                <DeleteUserModal
                    onClose={() => setDeleteUserId(null)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                />
            )}

        </div>
    )
}