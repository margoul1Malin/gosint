import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { User } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  // Pas d'adaptateur avec CredentialsProvider
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { 
          label: 'Email ou Téléphone', 
          type: 'text', 
          placeholder: 'email@example.com ou +33123456789' 
        },
        password: { 
          label: 'Mot de passe', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        try {
          // Vérifier si l'identifiant est un email ou un téléphone
          const isEmail = credentials.identifier.includes('@')
          const isPhone = /^\+?[1-9]\d{1,14}$/.test(credentials.identifier.replace(/\s/g, ''))

          let user: User | null = null

          if (isEmail) {
            user = await prisma.user.findUnique({
              where: { email: credentials.identifier }
            })
          } else if (isPhone) {
            user = await prisma.user.findFirst({
              where: { phone: credentials.identifier }
            })
          } else {
            return null
          }

          if (!user) {
            return null
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          // Vérifier le statut du compte
          if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
            return null
          }

          // Mettre à jour les statistiques de connexion
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
            }
          })

          console.log('Authorize - Utilisateur connecté:', user.id)

          return {
            id: user.id,
            email: user.email || '',
            phone: user.phone || '',
            name: user.name || '',
            image: user.image || '',
            role: user.role,
            status: user.status
          }
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback - Token:', !!token, 'User:', !!user)
      
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        token.phone = user.phone
        console.log('JWT Callback - Token créé avec ID:', user.id)
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - Token:', !!token)
      
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
        session.user.phone = token.phone as string
        console.log('Session Callback - Session créée pour:', token.id)
      }
      
      return session
    }
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await prisma.activityLog.create({
          data: {
            userId: token.id as string,
            action: 'LOGOUT',
            details: {
              timestamp: new Date()
            }
          }
        })
      }
    }
  }
} 