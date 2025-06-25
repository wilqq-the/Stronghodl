import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma configuration for better I/O performance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add graceful shutdown handling
process.on('beforeExit', async () => {
  console.log('Disconnecting from database...')
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT, disconnecting from database...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, disconnecting from database...')
  await prisma.$disconnect()
  process.exit(0)
}) 