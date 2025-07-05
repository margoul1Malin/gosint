import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { status, priority } = body

    // Valider les données
    if (!status && !priority) {
      return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 })
    }

    // Vérifier que le message existe
    const existingMessage = await prisma.contact.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
    }

    // Mettre à jour le message
    const updatedMessage = await prisma.contact.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`Message ${id} mis à jour:`, { status, priority })

    return NextResponse.json({
      message: 'Message mis à jour avec succès',
      data: updatedMessage
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Vérifier que le message existe
    const existingMessage = await prisma.contact.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
    }

    // Supprimer le message
    await prisma.contact.delete({
      where: { id }
    })

    console.log(`Message ${id} supprimé`)

    return NextResponse.json({
      message: 'Message supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 