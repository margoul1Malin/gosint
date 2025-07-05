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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')

    // Construire les filtres
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority
    }
    
    if (category && category !== 'all') {
      where.category = category
    }

    // Calculer l'offset
    const offset = (page - 1) * limit

    // Récupérer les messages avec pagination
    const [messages, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.contact.count({ where })
    ])

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalCount / limit)

    console.log(`Messages récupérés: ${messages.length}/${totalCount} (page ${page}/${totalPages})`)

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 