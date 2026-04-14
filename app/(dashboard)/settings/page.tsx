'use client'

import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div>
      <h1>Settings</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        Logout
      </button>
    </div>
  )
}