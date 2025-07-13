import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer la catégorie "physical-person"
    const category = await prisma.category.findUnique({
      where: { slug: 'physical-person' }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Récupérer tous les outils de cette catégorie
    const tools = await prisma.tool.findMany({
      where: {
        categoryIds: {
          has: category.id
        },
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      tools,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des outils:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 