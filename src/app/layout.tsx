import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from './providers'
import './globals.css'
import { Toaster } from 'react-hot-toast'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Buyer Lead Intake App',
  description: 'Manage real estate buyer leads',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <a href="/" className="text-xl font-bold">Buyer Leads</a>
              <div className="space-x-4">
                {session ? (
                  <>
                    <a href="/buyers" className="hover:underline">All Leads</a>
                    <a href="/buyers/new" className="hover:underline">New Lead</a>
                    <span className="text-blue-200">Hello, {session.user?.name || session.user?.email}</span>
                    <a href="/api/auth/signout" className="hover:underline">Sign Out</a>
                  </>
                ) : (
                  <>
                    <a href="/auth/signin" className="hover:underline">Sign In</a>
                    <a href="/auth/signup" className="hover:underline">Sign Up</a>
                  </>
                )}
              </div>
            </div>
          </nav>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </Providers>
               <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
