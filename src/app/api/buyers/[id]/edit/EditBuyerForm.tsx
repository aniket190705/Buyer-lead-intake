'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { buyerSchema, BuyerFormData } from '@/lib/validations'
import toast from 'react-hot-toast'  // ✅ Add this import

interface Buyer {
  id: string
  fullName: string
  email: string | null
  phone: string
  city: string
  propertyType: string
  bhk: string | null
  purpose: string
  budgetMin: number | null
  budgetMax: number | null
  timeline: string
  source: string
  status: string
  notes: string | null
  tags: string
}

interface EditBuyerFormProps {
  buyer: Buyer
}

export default function EditBuyerForm({ buyer }: EditBuyerFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city as any,
      propertyType: buyer.propertyType as any,
      bhk: buyer.bhk as any,
      purpose: buyer.purpose as any,
      budgetMin: buyer.budgetMin || undefined,
      budgetMax: buyer.budgetMax || undefined,
      timeline: buyer.timeline as any,
      source: buyer.source as any,
      status: buyer.status as any,
      notes: buyer.notes || '',
      tags: buyer.tags || ''
    }
  })

  const propertyType = watch('propertyType')

  const onSubmit = async (data: BuyerFormData) => {
  setLoading(true)
  try {
    const response = await fetch(`/api/buyers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (response.ok) {
      toast.success('Lead created successfully!')
      router.push('/buyers')
    } else {
      // Handle different error types
      if (response.status === 429) {
        toast.error('⏰ Too many requests! Please wait a moment before trying again.', {
          duration: 6000
        })
      } else if (response.status === 403) {
        toast.error('❌ You are not authorized to perform this action.')
      } else {
        toast.error('❌ Failed to create lead: ' + (result.error || 'Unknown error'))
      }
    }
  } catch (error) {
    toast.error('❌ Network error. Please try again.')
  }
  setLoading(false)
}

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/buyers')
      } else {
        alert('Error deleting buyer')
      }
    } catch (error) {
      alert('Error deleting buyer')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
          <select
            {...register('status' as any)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONTACTED">Contacted</option>
            <option value="VISITED">Visited</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name *</label>
            <input
              {...register('fullName')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Phone *</label>
            <input
              {...register('phone')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Location & Property */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">City *</label>
            <select
              {...register('city')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            <label className="block text-sm font-medium mb-1 text-gray-700">Property Type *</label>
            <select
              {...register('propertyType')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            <label className="block text-sm font-medium mb-1 text-gray-700">BHK *</label>
            <select
              {...register('bhk')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            <label className="block text-sm font-medium mb-1 text-gray-700">Purpose *</label>
            <select
              {...register('purpose')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            <label className="block text-sm font-medium mb-1 text-gray-700">Budget Min (₹)</label>
            <input
              {...register('budgetMin', { valueAsNumber: true })}
              type="number"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            {errors.budgetMin && (
              <p className="text-red-500 text-sm mt-1">{errors.budgetMin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Budget Max (₹)</label>
            <input
              {...register('budgetMax', { valueAsNumber: true })}
              type="number"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            {errors.budgetMax && (
              <p className="text-red-500 text-sm mt-1">{errors.budgetMax.message}</p>
            )}
          </div>
        </div>

        {/* Timeline & Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Timeline *</label>
            <select
              {...register('timeline')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
            <label className="block text-sm font-medium mb-1 text-gray-700">Source *</label>
            <select
              {...register('source')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
          <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
          <textarea
            {...register('notes')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            rows={3}
          />
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tags</label>
          <input
            {...register('tags')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="VIP, urgent, repeat customer (comma-separated)"
          />
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Lead'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push(`/buyers/${buyer.id}`)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Delete Lead
          </button>
        </div>
      </form>
    </div>
  )
}
