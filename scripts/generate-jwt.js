#!/usr/bin/env node

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateJWT(email, password) {
  try {
    console.log('🔐 Generating NextAuth JWT token...')
    
    if (!email || !password) {
      console.error('❌ Email and password are required')
      console.log('Usage: node scripts/generate-jwt.js <email> <password>')
      process.exit(1)
    }
    
    // Authenticate user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error('❌ User not found:', email)
      process.exit(1)
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValidPassword) {
      console.error('❌ Invalid password')
      process.exit(1)
    }
    
    // Generate NextAuth-compatible JWT
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('❌ NEXTAUTH_SECRET environment variable is required')
      process.exit(1)
    }
    
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      name: user.name || user.email.split('@')[0],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      jti: Math.random().toString(36).substring(2)
    }
    
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' })
    
    console.log('✅ JWT token generated successfully!')
    console.log('\n📋 Token Details:')
    console.log(`User: ${user.email} (ID: ${user.id})`)
    console.log(`Expires: ${new Date(payload.exp * 1000).toISOString()}`)
    console.log('\n🔑 JWT Token:')
    console.log(token)
    console.log('\n📝 Usage Example:')
    console.log(`curl -H "Authorization: Bearer ${token}" \\`)
    console.log(`  http://localhost:3000/api/transactions`)
    
  } catch (error) {
    console.error('❌ Error generating JWT:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get command line arguments
const args = process.argv.slice(2)
const email = args[0]
const password = args[1]

generateJWT(email, password) 