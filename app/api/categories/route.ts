import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les catégories publiques (actives uniquement)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Récupérer uniquement les catégories actives
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.category.count({
        where: {
          isActive: true
        }
      })
    ])

    // Pour chaque catégorie, récupérer le nombre d'outils associés
    const categoriesWithToolCount = await Promise.all(
      categories.map(async (category) => {
        const toolCount = await prisma.tool.count({
          where: {
            categoryIds: {
              has: category.id
            },
            isActive: true
          }
        })

        return {
          ...category,
          toolCount
        }
      })
    )

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      categories: categoriesWithToolCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 