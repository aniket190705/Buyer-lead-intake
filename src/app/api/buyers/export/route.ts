import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const city = searchParams.get('city')
  const propertyType = searchParams.get('propertyType')
  const status = searchParams.get('status')
  const timeline = searchParams.get('timeline')

  // Same filter logic as main buyers list
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

  const buyers = await prisma.buyer.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  })

  // Create CSV content
  const csvHeaders = [
    'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk',
    'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'
  ]

  const csvRows = buyers.map(buyer => [
    buyer.fullName,
    buyer.email || '',
    buyer.phone,
    buyer.city,
    buyer.propertyType,
    buyer.bhk || '',
    buyer.purpose,
    buyer.budgetMin || '',
    buyer.budgetMax || '',
    buyer.timeline,
    buyer.source,
    buyer.notes || '',
    buyer.tags || '',
    buyer.status
  ])

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="buyer-leads-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
