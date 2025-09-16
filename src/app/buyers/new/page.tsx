'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { buyerSchema, BuyerFormData } from '@/lib/validations'

export default function NewBuyer() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema)
  })

  const propertyType = watch('propertyType')

  const onSubmit = async (data: BuyerFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        router.push('/buyers')
      } else {
        const error = await response.json()
        alert('Error creating buyer: ' + (error.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Error creating buyer')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Lead</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              {...register('fullName')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              {...register('phone')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Location & Property */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <select
              {...register('city')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select City</option>
              <option value="CHANDIGARH">Chandigarh</option>
              <option value="MOHALI">Mohali</option>
              <option value="ZIRAKPUR">Zirakpur</option>
              <option value="PANCHKULA">Panchkula</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Property Type *</label>
            <select
              {...register('propertyType')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Property Type</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="PLOT">Plot</option>
              <option value="OFFICE">Office</option>
              <option value="RETAIL">Retail</option>
            </select>
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
            )}
          </div>
        </div>

        {/* Conditional BHK field */}
        {(propertyType === 'APARTMENT' || propertyType === 'VILLA') && (
          <div>
            <label className="block text-sm font-medium mb-1">BHK *</label>
            <select
              {...register('bhk')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select BHK</option>
              <option value="STUDIO">Studio</option>
              <option value="ONE">1 BHK</option>
              <option value="TWO">2 BHK</option>
              <option value="THREE">3 BHK</option>
              <option value="FOUR">4 BHK</option>
            </select>
            {errors.bhk && (
              <p className="text-red-500 text-sm mt-1">{errors.bhk.message}</p>
            )}
          </div>
        )}

        {/* Purpose & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Purpose *</label>
            <select
              {...register('purpose')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Purpose</option>
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
            </select>
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget Min (₹)</label>
            <input
              {...register('budgetMin', { valueAsNumber: true })}
              type="number"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
            />
            {errors.budgetMin && (
              <p className="text-red-500 text-sm mt-1">{errors.budgetMin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget Max (₹)</label>
            <input
              {...register('budgetMax', { valueAsNumber: true })}
              type="number"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2000000"
            />
            {errors.budgetMax && (
              <p className="text-red-500 text-sm mt-1">{errors.budgetMax.message}</p>
            )}
          </div>
        </div>

        {/* Timeline & Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Timeline *</label>
            <select
              {...register('timeline')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Timeline</option>
              <option value="ZERO_TO_THREE_MONTHS">0-3 months</option>
              <option value="THREE_TO_SIX_MONTHS">3-6 months</option>
              <option value="MORE_THAN_SIX_MONTHS">&gt;6 months</option>
              <option value="EXPLORING">Exploring</option>
            </select>
            {errors.timeline && (
              <p className="text-red-500 text-sm mt-1">{errors.timeline.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Source *</label>
            <select
              {...register('source')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Source</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="CALL">Call</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.source && (
              <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
            )}
          </div>
        </div>

        {/* Notes & Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            {...register('notes')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Additional notes about the buyer..."
          />
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            {...register('tags')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VIP, urgent, repeat customer (comma-separated)"
          />
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/buyers')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
