import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

interface BuyerPageProps {
  params: Promise<{ id: string }>
}

export default async function BuyerPage({ params }: BuyerPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: { owner: { select: { name: true, email: true } } }
  })

  if (!buyer) {
    notFound()
  }

  // Check ownership
  if (buyer.ownerId !== session.user.id) {
    redirect('/buyers')
  }

  // Format budget display
  const formatBudget = (min: bigint | null, max: bigint | null) => {
    if (!min && !max) return 'Not specified'
    const formatValue = (value: bigint) => {
      const num = Number(value)
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
      return `₹${(num / 1000).toFixed(0)}K`
    }
    
    if (min && max) return `${formatValue(min)} - ${formatValue(max)}`
    return formatValue(min || max!)
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{buyer.fullName}</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(buyer.status)}`}>
              {buyer.status}
            </span>
            <span className="text-gray-500">
              Created {new Date(buyer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            href={`/buyers/${buyer.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Lead
          </Link>
          <Link
            href="/buyers"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to All Leads
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg">{buyer.phone}</p>
            </div>
            {buyer.email && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg">{buyer.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Property Requirements */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Property Requirements</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">City</label>
              <p className="text-lg">{buyer.city}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Property Type</label>
              <p className="text-lg">{buyer.propertyType}</p>
            </div>
            {buyer.bhk && (
              <div>
                <label className="block text-sm font-medium text-gray-500">BHK</label>
                <p className="text-lg">{buyer.bhk}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500">Purpose</label>
              <p className="text-lg">{buyer.purpose}</p>
            </div>
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Budget & Timeline</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Budget</label>
              <p className="text-lg">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Timeline</label>
              <p className="text-lg">{buyer.timeline}</p>
            </div>
          </div>
        </div>

        {/* Lead Information */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Lead Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Source</label>
              <p className="text-lg">{buyer.source}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg">{buyer.status}</p>
            </div>
            {buyer.tags && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Tags</label>
                <p className="text-lg">{buyer.tags}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {buyer.notes && (
        <div className="mt-6 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{buyer.notes}</p>
        </div>
      )}
    </div>
  )
}
