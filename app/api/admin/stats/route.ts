import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions admin
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé - Permissions admin requises' }, { status: 403 })
    }

    // Récupérer les statistiques
    const [
      totalUsers,
      totalMessages,
      pendingMessages,
      activeUsers
    ] = await Promise.all([
      // Nombre total d'utilisateurs
      prisma.user.count(),
      
      // Nombre total de messages
      prisma.contact.count(),
      
      // Messages en attente
      prisma.contact.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Utilisateurs actifs (connectés dans les 30 derniers jours)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalMessages,
      pendingMessages,
      activeUsers
    }

    console.log('Statistiques admin récupérées:', stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 