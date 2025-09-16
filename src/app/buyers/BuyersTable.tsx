'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Buyer } from '@/types/buyer'  // Import the type
import toast from 'react-hot-toast'

interface BuyersTableProps {
  buyers: Buyer[]
  currentPage: number
  totalPages: number
  total: number
}

export default function BuyersTable({ 
  buyers, 
  currentPage, 
  totalPages, 
  total 
}: BuyersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return '-'
    const formatValue = (value: number) => {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
      return `₹${(value / 1000).toFixed(0)}K`
    }
    
    if (min && max) return `${formatValue(min)}-${formatValue(max)}`
    return formatValue(min || max!)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  'use client'


// Inside your BuyersTable component
const handleQuickDelete = async (id: string, name: string) => {
  if (!confirm(`Delete lead for ${name}?`)) return

  const deleteToast = toast.loading('Deleting...')

  try {
    const response = await fetch(`/api/buyers/${id}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (response.ok) {
      toast.success('Lead deleted!', { id: deleteToast })
      // Refresh the page or update state
      window.location.reload()
    } else {
      if (response.status === 403) {
        toast.error('⚠️ Access denied! You can only delete your own leads.', {
          id: deleteToast,
          duration: 6000
        })
      } else {
        toast.error('Delete failed: ' + (result.error || 'Unknown error'), {
          id: deleteToast
        })
      }
    }
  } catch (error) {
    toast.error('Network error occurred', { id: deleteToast })
  }
}


  const getStatusBadge = (status: string) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800',
      QUALIFIED: 'bg-purple-100 text-purple-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      VISITED: 'bg-orange-100 text-orange-800',
      NEGOTIATION: 'bg-indigo-100 text-indigo-800',
      CONVERTED: 'bg-green-100 text-green-800',
      DROPPED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (buyers.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No buyers found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
        <a
          href="/buyers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add First Lead
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">City</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Property</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Budget</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Timeline</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Updated</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {buyers.map((buyer) => (
              <tr key={buyer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{buyer.fullName}</div>
                    {buyer.email && (
                      <div className="text-sm text-gray-500">{buyer.email}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{buyer.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{buyer.city}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {buyer.propertyType} • {buyer.purpose}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{buyer.timeline}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(buyer.status)}`}>
                    {buyer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDate(buyer.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <a
                      href={`/buyers/${buyer.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </a>
                    <a
                      href={`/buyers/${buyer.id}/edit`}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Edit
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => navigateToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => navigateToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span> ({total} total results)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => navigateToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  ←
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => navigateToPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white ring-1 ring-inset ring-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => navigateToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
