import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import EditBuyerForm from './EditBuyerForm'

interface EditBuyerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBuyerPage({ params }: EditBuyerPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const buyer = await prisma.buyer.findUnique({
    where: { id }
  })

  if (!buyer) {
    notFound()
  }

  // Check ownership
  if (buyer.ownerId !== session.user.id) {
    redirect('/buyers')
  }

  // Serialize BigInt fields
  const serializedBuyer = {
    ...buyer,
    budgetMin: buyer.budgetMin ? Number(buyer.budgetMin) : null,
    budgetMax: buyer.budgetMax ? Number(buyer.budgetMax) : null,
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Lead</h1>
        <p className="text-gray-600">Update information for {buyer.fullName}</p>
      </div>
      
      <EditBuyerForm buyer={serializedBuyer} />
    </div>
  )
}
