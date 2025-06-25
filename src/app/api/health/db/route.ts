import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Test a few key tables exist and are accessible
    const userCount = await prisma.user.count()
    const settingsCount = await prisma.appSettings.count()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount,
        settingsCount,
        testQuery: result
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown database error'
        }
      },
      { status: 503 }
    )
  }
} 