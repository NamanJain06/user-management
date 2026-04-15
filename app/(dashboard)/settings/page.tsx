'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'

export default function Settings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()

    if (!data.session) {
      router.replace('/login')
      return
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    setLoading(true)

    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <Loader />

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Settings</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        Logout
      </button>
    </div>
  )
}