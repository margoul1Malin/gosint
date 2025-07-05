import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer toutes les catégories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const skip = (page - 1) * limit

    // Construction des filtres
    const where: any = {}
    
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    console.log('Filtres appliqués:', where)
    console.log('Paramètres de pagination:', { page, limit, skip })

    // Récupération des catégories
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.category.count({ where })
    ])

    console.log('Catégories trouvées:', categories.length)
    console.log('Total:', total)

    // Pour chaque catégorie, récupérer le nombre d'outils associés
    const categoriesWithToolCount = await Promise.all(
      categories.map(async (category) => {
        const toolCount = await prisma.tool.count({
          where: {
            categoryIds: {
              has: category.id
            }
          }
        })
        
        return {
          ...category,
          toolCount
        }
      })
    )

    return NextResponse.json({
      categories: categoriesWithToolCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, icon, color, isActive, order } = body

    // Validation des champs requis
    if (!name || !slug || !description || !icon) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier que le slug est unique
    const existingCategory = await prisma.category.findFirst({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Ce slug existe déjà' },
        { status: 400 }
      )
    }

    // Création de la catégorie
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        isActive: isActive !== undefined ? isActive : true,
        order: order ? parseInt(order.toString()) : 0,
        createdBy: session.user.id,
        updatedBy: session.user.id,
        toolIds: []
      }
    })

    console.log(`Catégorie créée: ${category.name} par ${session.user.email}`)

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 