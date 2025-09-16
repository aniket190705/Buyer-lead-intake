import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buyerSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters
const writeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 writes per minute
  analytics: true,
})

const readRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 reads per minute
  analytics: true,
})

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return '127.0.0.1' // fallback
}

// Helper function to convert BigInt fields to numbers for JSON serialization
function serializeBuyer(buyer: any) {
  return {
    ...buyer,
    budgetMin: buyer.budgetMin ? Number(buyer.budgetMin) : null,
    budgetMax: buyer.budgetMax ? Number(buyer.budgetMax) : null,
  }
}

// GET /api/buyers - List buyers with search/filter and export support
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isExport = searchParams.get('export') === 'true'

  // Skip rate limiting for export requests to avoid evalsha permission error
  if (!isExport) {
    const ip = getClientIP(request)
    const { success, limit, reset, remaining } = await readRateLimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          limit,
          reset: new Date(reset),
          remaining 
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      )
    }
  }

  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = parseInt(searchParams.get('page') || '1')
  const recordLimit = isExport ? 10000 : 10 // Export all data, otherwise paginate
  const search = searchParams.get('search') || ''
  const city = searchParams.get('city')
  const propertyType = searchParams.get('propertyType')
  const status = searchParams.get('status')
  const timeline = searchParams.get('timeline')

  const where = {
    AND: [
      { ownerId: session.user.id }, // Only user's own leads
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

  try {
    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        include: { owner: { select: { name: true, email: true } } },
        orderBy: { updatedAt: 'desc' },
        skip: isExport ? 0 : (page - 1) * recordLimit,
        take: recordLimit
      }),
      prisma.buyer.count({ where })
    ])

    // Convert BigInt values to numbers for JSON serialization
    const serializedBuyers = buyers.map(serializeBuyer)

    return NextResponse.json({
      buyers: serializedBuyers,
      pagination: {
        page,
        limit: recordLimit,
        total,
        totalPages: Math.ceil(total / recordLimit)
      }
    })
  } catch (error: any) {
    console.error('❌ Error fetching buyers:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch buyers',
      details: error.message 
    }, { status: 500 })
  }
}

// POST /api/buyers - Create new buyer
export async function POST(request: NextRequest) {
  // Rate limiting for POST requests
  const ip = getClientIP(request)
  const { success, limit, reset, remaining } = await writeRateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait before creating more leads.',
        limit,
        reset: new Date(reset),
        remaining 
      }, 
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    )
  }

  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!userExists) {
      console.log('❌ User not found in database:', session.user.id)
      return NextResponse.json({ 
        error: 'User not found in database' 
      }, { status: 400 })
    }

    const body = await request.json()
    console.log('📝 Request body received for new buyer creation')

    const data = buyerSchema.parse(body)
    console.log('✅ Zod validation passed')

    const buyer = await prisma.buyer.create({
      data: {
        fullName: data.fullName,
        email: data.email || null,
        phone: data.phone,
        city: data.city,
        propertyType: data.propertyType,
        bhk: data.bhk || null,
        purpose: data.purpose,
        budgetMin: data.budgetMin ? BigInt(data.budgetMin) : null,
        budgetMax: data.budgetMax ? BigInt(data.budgetMax) : null,
        timeline: data.timeline,
        source: data.source,
        status: data.status || 'NEW',
        notes: data.notes || null,
        tags: data.tags || '',
        ownerId: session.user.id
      }
    })

    console.log('✅ Buyer created successfully:', buyer.id)
    
    // Convert BigInt back to numbers for JSON response
    const responseBuyer = serializeBuyer(buyer)
    
    return NextResponse.json(responseBuyer, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ Error creating buyer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error
      }, { status: 400 })
    }
    
    // Handle Prisma errors
    if (error.code) {
      return NextResponse.json({ 
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create buyer',
      details: error.message
    }, { status: 500 })
  }
}
