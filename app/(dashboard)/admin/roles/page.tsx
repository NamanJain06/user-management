'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import RoleForm from '@/components/RoleForm'
import DeleteRoleModal from '@/components/DeleteRoleModal'
import Loader from '@/components/Loader'

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)

  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setLoading(true)

    const { data, error } = await supabase.from('roles').select('*')

    if (error) {
      console.error('Fetch Roles Error:', error)
      handleToast('Failed to fetch roles', 'error')
    } else {
      setRoles(data || [])
    }

    setLoading(false)
  }

  const handleToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const confirmDelete = async () => {
    if (!deleteRoleId) return

    setDeleteLoading(true)

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', deleteRoleId)

    setDeleteLoading(false)

    if (error) {
      console.error('Delete Error:', error)
      handleToast('Error deleting role', 'error')
    } else {
      setDeleteRoleId(null)
      fetchRoles()
      handleToast('Role deleted successfully', 'success')
    }
  }

    if (loading) return <Loader />

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Roles</h1>

        <button
          onClick={() => {
            setEditingRole(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Add Role
        </button>
      </div>

      {/* List */}
      <div className="bg-white p-4 rounded shadow">
        {roles.length === 0 ? (
          <p className="text-gray-500">No roles found</p>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="flex justify-between items-center border-b py-3"
            >
              {/* Role Info */}
              <div>
                <div className="font-medium">{role.name}</div>

                <div className="text-sm text-gray-500 mt-1">
                  {Object.entries(role.permissions || {})
                    .filter(([_, val]) => val)
                    .map(([key]) =>
                      key
                        .replaceAll('_', ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    )
                    .join(', ') || 'No permissions'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingRole(role)
                    setShowForm(true)
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteRoleId(role.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <RoleForm
          onClose={() => setShowForm(false)}
          onSuccess={(message, type) => {
            handleToast(message, type)
            fetchRoles()
          }}
          editRole={editingRole}
        />
      )}

      {/* Delete Modal */}
      {deleteRoleId && (
        <DeleteRoleModal
          onClose={() => setDeleteRoleId(null)}
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