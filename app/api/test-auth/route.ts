import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Tester la connexion à la base de données
    const userCount = await prisma.user.count()
    console.log('Nombre d\'utilisateurs dans la base:', userCount)
    
    // Récupérer quelques utilisateurs (sans les mots de passe)
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log('Utilisateurs trouvés:', users)
    
    return NextResponse.json({
      success: true,
      userCount,
      users,
      message: 'Connexion à la base de données réussie'
    })
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur de connexion à la base de données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 