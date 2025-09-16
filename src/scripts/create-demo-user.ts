import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })

    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.email)
      return existingUser
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create demo user
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword
      }
    })

    console.log('✅ Demo user created successfully:', user.email)
    return user
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()
