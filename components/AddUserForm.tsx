'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Toast from './Toast'

export default function AddUserForm({ onClose, onSuccess, editUser }: any) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'password' | 'invite'>('password')
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({})
  const [toast, setToast] = useState<any>(null)

  // PREFILL WHEN EDITING
  useEffect(() => {
    if (editUser) {
      setName(editUser.name)
      setEmail(editUser.email)
      setMode('password') // default mode
    }
  }, [editUser])

  const handleSave = async () => {
    const newErrors: any = {}

    if (!name) newErrors.name = true
    if (!email) newErrors.email = true
    if (!editUser && mode === 'password' && !password) newErrors.password = true

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      setToast({
        message: 'Please fill all required fields',
        type: 'error',
      })

      setTimeout(() => setToast(null), 3000)
      return
    }

    setLoading(true)

    // =========================
    // UPDATE FLOW
    // =========================
    if (editUser) {
      const { error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', editUser.id)

      setLoading(false)

      if (error) {
        setToast({ message: 'Error updating user', type: 'error' })
        setTimeout(() => setToast(null), 3000)
        return
      }

      setToast({ message: 'User updated successfully', type: 'success' })

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)

      return
    }

    // =========================
    // CREATE FLOW
    // =========================

    let authUserId = null

    // PASSWORD FLOW
    if (mode === 'password') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setLoading(false)
        setToast({ message: error.message, type: 'error' })
        setTimeout(() => setToast(null), 3000)
        return
      }

      authUserId = data.user?.id
    }

    // INVITE FLOW
    if (mode === 'invite') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'http://localhost:3000',
        },
      })

      if (error) {
        setLoading(false)
        setToast({ message: error.message, type: 'error' })
        setTimeout(() => setToast(null), 3000)
        return
      }

      const { error: dbError } = await supabase.from('users').insert([
        { name, email, role: 'user' },
      ])

      if (dbError) {
        setLoading(false)
        setToast({ message: 'Error saving user', type: 'error' })
        return
      }
    }

    if (authUserId) {
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: authUserId,
          name,
          email,
          role: 'user',
        },
      ])

      if (dbError) {
        setLoading(false)
        setToast({ message: 'Error saving user', type: 'error' })
        return
      }
    }

    setLoading(false)

    setToast({ message: 'User created successfully', type: 'success' })

    setTimeout(() => {
      onSuccess()
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer text-lg"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {editUser ? 'Edit User' : 'Add User'}
        </h2>

        {/* Name */}
        <label className="block mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setErrors((prev) => ({ ...prev, name: false }))
          }}
          className={`w-full border p-2 mb-3 rounded ${
            errors.name ? 'border-red-500' : ''
          }`}
        />

        {/* Email */}
        <label className="block mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: false }))
          }}
          className={`w-full border p-2 mb-3 rounded ${
            errors.email ? 'border-red-500' : ''
          }`}
        />

        {/* Only show mode when creating */}
        {!editUser && (
          <>
            <div className="mb-3">
              <label className="mr-4">
                <input
                  type="radio"
                  checked={mode === 'password'}
                  onChange={() => setMode('password')}
                />
                <span className="ml-1">Set Password</span>
              </label>

              <label>
                <input
                  type="radio"
                  checked={mode === 'invite'}
                  onChange={() => setMode('invite')}
                />
                <span className="ml-1">Send Invitation Link</span>
              </label>
            </div>

            {mode === 'password' && (
              <>
                <label className="block mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: false }))
                  }}
                  className={`w-full border p-2 mb-3 rounded ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
              </>
            )}
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            {loading ? 'Saving...' : editUser ? 'Update' : 'Create'}
          </button>
        </div>

      </div>
    </div>
  )
}