'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting to sign in with:', email)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('🔐 Sign in result:', result)

      if (result?.ok) {
        console.log('✅ Sign in successful, redirecting...')
        router.push('/buyers')
        router.refresh()
      } else {
        console.error('❌ Sign in failed:', result?.error)
        setError('Invalid credentials. Please check your email and password.')
      }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      setError('An error occurred during sign in.')
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-4">
        <p className="text-sm text-blue-700">
          <strong>Demo Account:</strong><br/>
          Email: demo@example.com<br/>
          Password: password123
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

<p className="mt-4 text-sm text-gray-600 text-center">
  Don't have an account? <a href="/auth/signup" className="text-blue-600 hover:underline">Sign up</a>
</p>
      
    </div>
  )
}
