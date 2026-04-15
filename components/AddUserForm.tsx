'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Props = {
  onClose: () => void
  onSuccess: () => void
  editUser?: any
}

export default function AddUserForm({ onClose, onSuccess, editUser }: Props) {
  const [name, setName] = useState(editUser?.name || '')
  const [email, setEmail] = useState(editUser?.email || '')
  const [roleId, setRoleId] = useState(editUser?.role_id || '')
  const [roles, setRoles] = useState<any[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    const { data, error } = await supabase.from('roles').select('id, name')

    if (error) {
      console.error('Fetch roles error:', error)
    } else {
      setRoles(data || [])
    }
  }

  const handleSubmit = async () => {
    if (!name || !email || !roleId) {
      alert('All fields including role are required')
      return
    }

    setLoading(true)

    let error

    if (editUser) {
      const res = await supabase
        .from('users')
        .update({ name, email, role_id: roleId })
        .eq('id', editUser.id)

      error = res.error
    } else {
      const res = await supabase
        .from('users')
        .insert([{ name, email, role_id: roleId }])

      error = res.error
    }

    setLoading(false)

    if (error) {
      console.error('USER SAVE ERROR:', error)
      alert(error.message || 'Error saving user')
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {editUser ? 'Edit User' : 'Add User'}
        </h2>

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        {/*ROLE DROPDOWN */}
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}