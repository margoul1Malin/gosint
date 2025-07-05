import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params

    const category = await prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Récupérer les outils associés à cette catégorie
    const tools = await prisma.tool.findMany({
      where: {
        categoryIds: {
          has: category.id
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        difficulty: true,
        isPremium: true,
        isActive: true
      }
    })

    return NextResponse.json({
      ...category,
      tools
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { name, slug, description, icon, color, isActive, order } = body

    // Validation des champs requis
    if (!name || !slug || !description || !icon || !color) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Vérifier l'unicité du slug (sauf pour cette catégorie)
    if (slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
      }
    }

    // Mise à jour de la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        icon,
        color,
        isActive: isActive !== undefined ? isActive : true,
        order: order ? parseInt(order.toString()) : 0,
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    })

    console.log(`Catégorie mise à jour: ${updatedCategory.name} par ${session.user.email}`)

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const { id } = params

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Vérifier qu'aucun outil n'est associé à cette catégorie
    const toolsCount = await prisma.tool.count({
      where: {
        categoryIds: {
          has: id
        }
      }
    })

    if (toolsCount > 0) {
      return NextResponse.json({ 
        error: `Impossible de supprimer la catégorie. ${toolsCount} outil(s) y sont associés.` 
      }, { status: 400 })
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id }
    })

    console.log(`Catégorie supprimée: ${category.name} par ${session.user.email}`)

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 