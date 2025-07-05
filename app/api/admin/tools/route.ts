import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer tous les outils
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
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const isPremium = searchParams.get('isPremium')
    const difficulty = searchParams.get('difficulty')
    const skip = (page - 1) * limit

    // Construction des filtres
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    if (category) {
      where.categoryIds = {
        has: category
      }
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (isPremium !== null && isPremium !== undefined) {
      where.isPremium = isPremium === 'true'
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // Récupération des outils
    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }
        ]
      }),
      prisma.tool.count({ where })
    ])

    // Pour chaque outil, récupérer les catégories associées
    const toolsWithCategories = await Promise.all(
      tools.map(async (tool) => {
        const categories = await prisma.category.findMany({
          where: {
            id: {
              in: tool.categoryIds
            }
          },
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        })
        
        return {
          ...tool,
          categories
        }
      })
    )

    return NextResponse.json({
      tools: toolsWithCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des outils:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau outil
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      slug, 
      description, 
      icon, 
      categoryId,
      isActive
    } = body

    // Validation des champs requis
    if (!name || !slug || !description || !icon || !categoryId) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Vérification de l'unicité du slug
    const existingTool = await prisma.tool.findUnique({
      where: { slug }
    })

    if (existingTool) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Cette catégorie n\'existe pas' }, { status: 400 })
    }

    // Création de l'outil
    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description,
        longDescription: description, // Utiliser la même description
        icon,
        difficulty: 'BEGINNER',
        isPremium: false,
        isActive: isActive !== undefined ? isActive : true,
        order: 0,
        tags: [],
        features: [],
        useCases: [],
        categoryIds: [categoryId],
        apiRequired: false,
        configSchema: null,
        externalLinks: null,
        createdBy: session.user.id,
        updatedBy: session.user.id
      }
    })

    // Mettre à jour la catégorie pour inclure cet outil
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        toolIds: {
          push: tool.id
        }
      }
    })

    return NextResponse.json({ tool }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de l\'outil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 