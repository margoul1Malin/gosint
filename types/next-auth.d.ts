import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      status: string
      phone?: string
      firstName?: string
      lastName?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email?: string
    phone?: string
    name?: string
    firstName?: string
    lastName?: string
    image?: string
    role: string
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    status: string
    phone?: string
    firstName?: string
    lastName?: string
  }
} 