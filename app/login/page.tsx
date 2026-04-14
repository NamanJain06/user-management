'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Loader from '../../components/Loader'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorState, setErrorState] = useState(false)
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleLogin = async () => {
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setLoading(false)
            setEmail('')
            setPassword('')
            alert('Login failed')
        } else {
            router.push('/')
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            {loading && <Loader />}

            <div className="w-96 bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    className={`w-full p-2 border rounded mb-3 ${errorState ? 'border-red-500' : ''}`}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    className={`w-full p-2 border rounded mb-4 ${errorState ? 'border-red-500' : ''}`}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                    Login
                </button>
            </div>
        </div>
    )
}