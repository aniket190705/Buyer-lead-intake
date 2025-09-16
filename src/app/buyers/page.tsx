import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BuyersTable from './BuyersTable'
import SearchAndFilters from './SearchAndFilters'
import ExportButton from '@/components/ExportButton'
interface SearchParams {
  page?: string
  search?: string
  city?: string
  propertyType?: string
  status?: string
  timeline?: string
}

// Define the Buyer interface
interface Buyer {
  id: string
  fullName: string
  phone: string
  email: string | null
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
  ownerId: string
  createdAt: Date
  updatedAt: Date
  owner: {
    name: string | null
    email: string
  }
}

// Helper function to serialize BigInt fields from Prisma
function serializeBuyers(buyers: any[]): Buyer[] {
  return buyers.map(buyer => ({
    ...buyer,
    budgetMin: buyer.budgetMin ? Number(buyer.budgetMin) : null,
    budgetMax: buyer.budgetMax ? Number(buyer.budgetMax) : null,
    createdAt: new Date(buyer.createdAt),
    updatedAt: new Date(buyer.updatedAt)
  }))
}

export default async function BuyersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>  // ✅ Changed to Promise
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // ✅ Await searchParams before accessing properties
  const params = await searchParams

  // Parse search parameters
  const page = parseInt(params.page || '1')
  const limit = 10
  const search = params.search || ''
  const city = params.city
  const propertyType = params.propertyType
  const status = params.status
  const timeline = params.timeline  // ✅ Now accessed from awaited params

  // Build where clause for filtering
  const where = {
    AND: [
      search ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {},
      city ? { city } : {},
      propertyType ? { propertyType } : {},
      status ? { status } : {},
      timeline ? { timeline } : {}
    ]
  }

  // Fetch data with pagination
  const [rawBuyers, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.buyer.count({ where })
  ])

  // Serialize the buyers to handle BigInt fields properly
  const buyers = serializeBuyers(rawBuyers)
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold">All Buyer Leads</h1>
  <div className="flex space-x-3">
    <ExportButton searchParams={params} />  {/* Add this */}
    <a
      href="/buyers/new"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Add New Lead
    </a>
  </div>
</div>
 

      <div className="bg-gray-50 p-4 rounded">
        <p className="text-sm text-gray-600">
          Showing {buyers.length} of {total} leads
          {search && ` • Search: "${search}"`}
          {city && ` • City: ${city}`}
          {propertyType && ` • Property: ${propertyType}`}
          {status && ` • Status: ${status}`}
          {timeline && ` • Timeline: ${timeline}`}
        </p>
      </div>

      <Suspense fallback={<div className="p-4">Loading filters...</div>}>
        <SearchAndFilters />
      </Suspense>

      <Suspense fallback={<div className="p-4">Loading buyers...</div>}>
        <BuyersTable
          buyers={buyers}
          currentPage={page}
          totalPages={totalPages}
          total={total}
        />
      </Suspense>
    </div>
  )
}
