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

  useEffect(() => {
    checkAccess()
  }, [])

  // 🔐 ACCESS CONTROL (FIXED)
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
        console.error('User Fetch Error:', error)
        router.replace('/')
        return
      }

      // ✅ CRITICAL FIX (handles both array & object)
      const roleData = Array.isArray(userData?.roles)
        ? userData.roles[0]
        : userData?.roles

      const role = roleData?.name || null
      const perms = roleData?.permissions || {}

      console.log('ROLE:', role)
      console.log('PERMISSIONS:', perms)

      setRoleName(role)
      setPermissions(perms)

      const isAdmin = role?.toLowerCase() === 'admin'
      const canView = perms?.can_view_admin === true

      if (!isAdmin && !canView) {
        console.log('ACCESS DENIED')
        router.replace('/')
        return
      }

      await fetchUsers()
    } catch (err) {
      console.error('Access Check Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🔁 FETCH USERS
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`*, roles:roles!users_role_id_fkey (name)`)

    if (error) {
      console.error('Fetch Users Error:', error)
      return
    }

    setUsers(data || [])
  }

  // ✏️ EDIT
  const handleEdit = (user: any) => {
    setEditingUser(user)
    setShowForm(true)
  }

  // 🗑️ DELETE
  const confirmDelete = async () => {
    if (!deleteUserId) return

    setDeleteLoading(true)

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', deleteUserId)

    setDeleteLoading(false)

    if (error) {
      console.error('Delete Error:', error)
      return
    }

    setDeleteUserId(null)
    fetchUsers()
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
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Add User
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white p-4 rounded shadow">
        {users.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No users available. Add your first user.
          </p>
        ) : (
          users.map((user) => {
            // ✅ FIX ROLE DISPLAY
            const roleDisplay = Array.isArray(user.roles)
              ? user.roles[0]?.name
              : user.roles?.name

            return (
              <div
                key={user.id}
                className="flex justify-between items-center border-b py-3"
              >
                {/* User Info */}
                <div>
                  <div className="font-medium">{user.name}</div>
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
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
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

      {/* Delete Modal */}
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