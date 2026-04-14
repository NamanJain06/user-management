'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function Admin() {
  const [users, setUsers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*')
    setUsers(data || [])
  }

  // CREATE USER
  const handleCreate = async () => {
    if (!name || !email) return alert('All fields required')

    setLoading(true)

    const { error } = await supabase.from('users').insert([
      {
        name,
        email,
        role: 'user',
      },
    ])

    setLoading(false)

    if (error) {
      alert('Error creating user')
    } else {
      setName('')
      setEmail('')
      fetchUsers()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>

      {/* Create User Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Create User</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 rounded cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Users</h2>

        {users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between border-b py-2"
          >
            <span>{user.name}</span>
            <span className="text-gray-500">{user.email}</span>
          </div>
        ))}
      </div>

    </div>
  )
}