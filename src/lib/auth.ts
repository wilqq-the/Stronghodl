import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Get user using Prisma
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          
          if (isValidPassword) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name || user.email.split('@')[0]
            }
          } else {
            console.log('Invalid password for user:', credentials.email)
            return null
          }
        } catch (error) {
          console.error('Error during login:', error)
          return null
        }
      }
    }),
    CredentialsProvider({
      id: 'pin',
      name: 'PIN',
      credentials: {
        email: { label: 'Email', type: 'email' },
        pin: { label: 'PIN', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.pin) {
          return null
        }

        try {
          // Get user using Prisma
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.log('User not found for PIN login:', credentials.email)
            return null
          }

          if (!user.pinHash) {
            console.log('No PIN set for user:', credentials.email)
            return null
          }

          const isValidPin = await bcrypt.compare(credentials.pin, user.pinHash)
          
          if (isValidPin) {
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name || user.email.split('@')[0]
            }
          } else {
            console.log('Invalid PIN for user:', credentials.email)
            return null
          }
        } catch (error) {
          console.error('Error during PIN login:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // Add additional claims for API token compatibility
        token.sub = user.id
        token.email = user.email
        token.name = user.name
        // Add issued at time for better token validation
        token.iat = Math.floor(Date.now() / 1000)
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // Ensure session has all necessary fields
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
} 