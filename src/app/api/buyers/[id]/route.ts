import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buyerSchema } from '@/lib/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Helper function to convert BigInt fields to numbers for JSON serialization
function serializeBuyer(buyer: any) {
  return {
    ...buyer,
    budgetMin: buyer.budgetMin ? Number(buyer.budgetMin) : null,
    budgetMax: buyer.budgetMax ? Number(buyer.budgetMax) : null,
  }
}

// GET /api/buyers/[id] - Get single buyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: { owner: { select: { name: true, email: true } } }
    })

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    // Check ownership
    if (buyer.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const serializedBuyer = serializeBuyer(buyer)
    return NextResponse.json(serializedBuyer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch buyer' }, { status: 500 })
  }
}

// PUT /api/buyers/[id] - Update buyer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Check if buyer exists and user has access
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id }
    })

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    if (existingBuyer.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const data = buyerSchema.parse(body)

    const updatedBuyer = await prisma.buyer.update({
      where: { id },
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
      }
    })

    const serializedBuyer = serializeBuyer(updatedBuyer)
    return NextResponse.json(serializedBuyer)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to update buyer',
      details: error.message
    }, { status: 500 })
  }
}

// DELETE /api/buyers/[id] - Delete buyer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Check if buyer exists and user has access
    const existingBuyer = await prisma.buyer.findUnique({
      where: { id }
    })

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 })
    }

    if (existingBuyer.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.buyer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Buyer deleted successfully' })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to delete buyer'
    }, { status: 500 })
  }
}
