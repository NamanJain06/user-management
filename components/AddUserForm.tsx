'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Role = {
    id: string
    name: string
}

type Props = {
    onClose: () => void
    onSuccess: () => void
    editUser?: any
}

export default function AddUserForm({ onClose, onSuccess, editUser }: Props) {
    const [name, setName] = useState(editUser?.name || '')
    const [email, setEmail] = useState(editUser?.email || '')
    const [password, setPassword] = useState('')
    const [selectedRole, setSelectedRole] = useState(editUser?.role_id || '')
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)

    const [authType, setAuthType] = useState<'password' | 'invite'>('password')

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        const { data, error } = await supabase
            .from('roles')
            .select('id, name')

        if (error) {
            console.error('Fetch Roles Error:', error)
            return
        }

        setRoles(data || [])
    }

    const handleSubmit = async () => {
        if (!name || !email || !selectedRole) {
            alert('All fields are required')
            return
        }

        setLoading(true)

        try {
            let userId = editUser?.id

            // =========================
            // CREATE USER
            // =========================
            if (!editUser) {
                if (authType === 'password') {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                    })

                    if (error) throw error

                    if (!data.user?.id) {
                        throw new Error('User creation failed')
                    }

                    userId = data.user.id
                } else {
                    // FIX: Only send invite, DO NOT insert user yet
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                    })

                    if (error) throw error

                    // Stop here for invite flow
                    onSuccess()
                    onClose()
                    return
                }

                // =========================
                // Insert into users table
                // =========================
                const { error: insertError } = await supabase.from('users').insert([
                    {
                        id: userId,
                        name,
                        email,
                        role_id: selectedRole,
                    },
                ])

                if (insertError) throw insertError
            }

            // =========================
            // UPDATE USER
            // =========================
            else {
                const { error } = await supabase
                    .from('users')
                    .update({
                        name,
                        email,
                        role_id: selectedRole,
                    })
                    .eq('id', editUser.id)

                if (error) throw error
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            console.error('USER SAVE ERROR:', err)
            alert(err.message || 'Error saving user')
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl rounded cursor-pointer"
                >
                    ×
                </button>

                <h2 className="text-xl font-semibold mb-4 rounded cursor-pointer">
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

                {/* Auth Type */}
                {!editUser && (
                    <div className="mb-3">
                        <label className="block text-sm mb-1">User Access</label>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 rounded cursor-pointer">
                                <input
                                    type="radio"
                                    checked={authType === 'password'}
                                    onChange={() => setAuthType('password')}
                                />
                                Set Password
                            </label>

                            <label className="flex items-center gap-2 rounded cursor-pointer">
                                <input
                                    type="radio"
                                    checked={authType === 'invite'}
                                    onChange={() => setAuthType('invite')}
                                />
                                Send Invite Link
                            </label>
                        </div>
                    </div>
                )}

                {/* Password */}
                {!editUser && authType === 'password' && (
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 w-full mb-3 rounded"
                    />
                )}

                {/* Role Dropdown */}
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border p-2 w-full mb-4 rounded cursor-pointer"
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