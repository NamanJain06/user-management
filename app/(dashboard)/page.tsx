'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Loader from '../../components/Loader'

export default function Home() {
  const [users, setUsers] = useState<any[]>([])
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      router.push('/login')
    } else {
      fetchUsers()
    }
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*')

    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data || [])
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <Loader />}
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">User List</h1>
        </div>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-gray-500">No users found</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="border p-3 rounded flex justify-between"
                >
                <span>{user.name}</span>
                <span className="text-gray-500">{user.email}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}