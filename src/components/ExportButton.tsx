'use client'

import { useState } from 'react'
import { exportToCsv } from '@/lib/exportCSV'
import toast from 'react-hot-toast'

interface ExportButtonProps {
  searchParams?: any
}

export default function ExportButton({ searchParams }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    const exportToast = toast.loading('Preparing export...')

    try {
      // Build the same query params as the main page
      const params = new URLSearchParams()
      
      if (searchParams?.search) params.set('search', searchParams.search)
      if (searchParams?.city) params.set('city', searchParams.city)
      if (searchParams?.propertyType) params.set('propertyType', searchParams.propertyType)
      if (searchParams?.status) params.set('status', searchParams.status)
      if (searchParams?.timeline) params.set('timeline', searchParams.timeline)
      
      // Add export flag to get all data (not paginated)
      params.set('export', 'true')

      const response = await fetch(`/api/buyers?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data for export')
      }

      const data = await response.json()
      
      if (!data.buyers || data.buyers.length === 0) {
        toast.error('No data to export', { id: exportToast })
        return
      }

      // Generate filename with current date and filters
      const date = new Date().toISOString().split('T')[0]
      let filename = `buyer-leads-${date}`
      
      if (searchParams?.search) filename += `-search-${searchParams.search}`
      if (searchParams?.city) filename += `-${searchParams.city}`
      if (searchParams?.status) filename += `-${searchParams.status}`
      
      filename += '.csv'

      exportToCsv(data.buyers, filename)
      
      toast.success(`Exported ${data.buyers.length} leads!`, { 
        id: exportToast 
      })
    } catch (error) {
      toast.error('Export failed. Please try again.', { 
        id: exportToast 
      })
    }
    
    setLoading(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      <span>{loading ? 'Exporting...' : 'Export CSV'}</span>
    </button>
  )
}
