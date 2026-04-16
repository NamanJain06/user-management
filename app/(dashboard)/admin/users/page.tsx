'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import AddUserForm from '@/components/AddUserForm'
import DeleteUserModal from '@/components/DeleteUserModal'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import { Lock } from 'lucide-react'

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const [permissions, setPermissions] = useState<any>(null)
  const [roleName, setRoleName] = useState<string | null>(null)

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 🔐 ACCESS CONTROL
  const checkAccess = async () => {
    try {
      const { data } = await supabase.auth.getSession()

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

      const roleData = Array.isArray(userData?.roles)
        ? userData.roles[0]
        : userData?.roles

      const role = roleData?.name || null
      const perms = roleData?.permissions || {}

      setRoleName(role)
      setPermissions(perms)

      const isAdmin = role?.toLowerCase() === 'admin'
      const canView = perms?.can_view_admin === true

      if (!isAdmin && !canView) {
        router.replace('/')
        return
      }

      await fetchUsers()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select(`*, roles:roles!users_role_id_fkey (name)`)

    setUsers(data || [])
  }

  const handleEdit = (user: any) => {
    const isProtectedUser =
      user.email === 'njain.host@gmail.com'

    if (isProtectedUser) {
      showToast('You cannot edit this user', 'error')
      return
    }

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
      showToast('Error deleting user', 'error')
    } else {
      setDeleteUserId(null)
      fetchUsers()
      showToast('User deleted successfully', 'success')
    }
  }

  if (loading) return <Loader />

  const isAdmin = roleName?.toLowerCase() === 'admin'
  const canCreate = isAdmin || permissions?.can_create_user
  const canEdit = isAdmin || permissions?.can_edit_user
  const canDelete = isAdmin || permissions?.can_delete_user

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Users</h1>

        {canCreate && (
          <button
            onClick={() => {
              setEditingUser(null)
              setShowForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add User
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white p-4 rounded shadow">
        {users.map((user) => {
          const roleDisplay = Array.isArray(user.roles)
            ? user.roles[0]?.name
            : user.roles?.name

          const isProtectedUser =
            user.email === 'njain.host@gmail.com'

          return (
            <div
              key={user.id}
              className="flex justify-between items-center border-b py-3"
            >
              {/* User Info */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{user.name}</div>

                  {isProtectedUser && (
                    <div className="relative group">
                      <Lock
                        size={14}
                        className="text-red-500 group-hover:scale-110 transition"
                      />

                      <div className="absolute left-5 top-0 hidden group-hover:block 
                        bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                        Protected user
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-gray-500 text-sm">{user.email}</div>
                <div className="text-xs text-blue-500 mt-1">
                  {roleDisplay || 'No Role'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => {
                      const isProtectedUser =
                        user.email === 'njain.host@gmail.com'

                      if (isProtectedUser) {
                        showToast(
                          'You cannot delete this user',
                          'error'
                        )
                        return
                      }

                      setDeleteUserId(user.id)
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}