'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchAndFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }

  // ✅ Use currentTarget instead of target
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearch((e.target as HTMLInputElement).value)
}

const handleSelectChange = (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
  handleFilterChange(key, (e.target as HTMLSelectElement).value)
}

const clearFilters = () => {
  router.replace(pathname)
  setSearch('')
}

  useEffect(() => {
    debouncedSearch(search)
  }, [search, debouncedSearch])

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
    <div>
  <label className="block text-sm font-medium mb-1">Search</label>
  <input
    type="text"
    value={search}
    onChange={handleSearchChange}
    placeholder="Search by name, phone, or email..."
    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"  // ✅ Added text-black
  />
</div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-black">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <select
            value={searchParams.get('city') || ''}
            onChange={handleSelectChange('city')}
            className="w-full p-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Cities</option>
            <option value="CHANDIGARH">Chandigarh</option>
            <option value="MOHALI">Mohali</option>
            <option value="ZIRAKPUR">Zirakpur</option>
            <option value="PANCHKULA">Panchkula</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Property Type</label>
          <select
            value={searchParams.get('propertyType') || ''}
            onChange={handleSelectChange('propertyType')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Properties</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="PLOT">Plot</option>
            <option value="OFFICE">Office</option>
            <option value="RETAIL">Retail</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={searchParams.get('status') || ''}
            onChange={handleSelectChange('status')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONTACTED">Contacted</option>
            <option value="VISITED">Visited</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Timeline</label>
          <select
            value={searchParams.get('timeline') || ''}
            onChange={handleSelectChange('timeline')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Timelines</option>
            <option value="ZERO_TO_THREE_MONTHS">0-3 months</option>
            <option value="THREE_TO_SIX_MONTHS">3-6 months</option>
            <option value="MORE_THAN_SIX_MONTHS">&gt;6 months</option>
            <option value="EXPLORING">Exploring</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Clear all filters
        </button>
      </div>
    </div>
  )
}
