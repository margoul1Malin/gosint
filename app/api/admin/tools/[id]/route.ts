import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un outil spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const tool = await prisma.tool.findUnique({
      where: { id: params.id }
    })

    if (!tool) {
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 })
    }

    // Récupérer les catégories associées
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

    return NextResponse.json({
      tool: {
        ...tool,
        categories
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'outil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un outil
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'outil existe
    const existingTool = await prisma.tool.findUnique({
      where: { id: params.id }
    })

    if (!existingTool) {
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 })
    }

    // Vérifier l'unicité du slug (sauf pour l'outil actuel)
    const slugExists = await prisma.tool.findFirst({
      where: { 
        slug,
        id: { not: params.id }
      }
    })

    if (slugExists) {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Cette catégorie n\'existe pas' }, { status: 400 })
    }

    // Mettre à jour l'outil
    const updatedTool = await prisma.tool.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        longDescription: description,
        icon,
        isActive: isActive !== undefined ? isActive : true,
        categoryIds: [categoryId],
        updatedBy: session.user.id
      }
    })

    // Mettre à jour les catégories
    // Retirer l'outil de l'ancienne catégorie
    if (existingTool.categoryIds.length > 0) {
      for (const oldCategoryId of existingTool.categoryIds) {
        if (oldCategoryId !== categoryId) {
          await prisma.category.update({
            where: { id: oldCategoryId },
            data: {
              toolIds: {
                set: category.toolIds.filter(id => id !== params.id)
              }
            }
          })
        }
      }
    }

    // Ajouter l'outil à la nouvelle catégorie
    const newCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (newCategory && !newCategory.toolIds.includes(params.id)) {
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          toolIds: {
            push: params.id
          }
        }
      })
    }

    return NextResponse.json({ tool: updatedTool })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'outil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un outil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier que l'outil existe
    const tool = await prisma.tool.findUnique({
      where: { id: params.id }
    })

    if (!tool) {
      return NextResponse.json({ error: 'Outil non trouvé' }, { status: 404 })
    }

    // Retirer l'outil de toutes les catégories
    for (const categoryId of tool.categoryIds) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (category) {
        await prisma.category.update({
          where: { id: categoryId },
          data: {
            toolIds: {
              set: category.toolIds.filter(id => id !== params.id)
            }
          }
        })
      }
    }

    // Supprimer l'outil
    await prisma.tool.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Outil supprimé avec succès' })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'outil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 