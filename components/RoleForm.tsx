'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Props = {
  onClose: () => void
  onSuccess: (message: string, type: 'success' | 'error') => void
  editRole?: any
}

export default function RoleForm({ onClose, onSuccess, editRole }: Props) {
  const [name, setName] = useState(editRole?.name || '')
  const [permissions, setPermissions] = useState(
    editRole?.permissions || {
      can_view_admin: false,
      can_create_user: false,
      can_edit_user: false,
      can_delete_user: false,
    }
  )

  const [loading, setLoading] = useState(false)

  const handleCheckbox = (key: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      onSuccess('Role name is required', 'error')
      return
    }

    setLoading(true)

    let error

    if (editRole) {
      const res = await supabase
        .from('roles')
        .update({ name, permissions })
        .eq('id', editRole.id)

      error = res.error
    } else {
      const res = await supabase
        .from('roles')
        .insert([{ name, permissions }])

      error = res.error
    }

    setLoading(false)

    if (error) {
      console.error('ROLE SAVE ERROR:', error)

      onSuccess(error.message || 'Error saving role', 'error')
      return
    }

    onClose()

    onSuccess(
      editRole ? 'Role updated successfully' : 'Role created successfully',
      'success'
    )
  }

  const formatLabel = (key: string) =>
    key
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {editRole ? 'Edit Role' : 'Add Role'}
        </h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Role Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        {/* Permissions */}
        <div className="space-y-2 mb-4">
          {Object.keys(permissions).map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions[key]}
                onChange={() => handleCheckbox(key)}
              />
              {formatLabel(key)}
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 border rounded cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-1 rounded cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}