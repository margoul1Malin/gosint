import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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
    const { reply, originalSubject } = body

    // Valider les données
    if (!reply || reply.trim().length < 10) {
      return NextResponse.json({ error: 'La réponse doit contenir au moins 10 caractères' }, { status: 400 })
    }

    // Vérifier que le message existe
    const existingMessage = await prisma.contact.findUnique({
      where: { id },
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

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 })
    }

    // Créer une notification pour l'utilisateur
    const notification = await prisma.notification.create({
      data: {
        userId: existingMessage.userId,
        type: 'ADMIN_REPLY',
        title: `Réponse à votre message: ${originalSubject || existingMessage.subject}`,
        message: reply.trim(),
        isRead: false,
        metadata: {
          originalMessageId: id,
          originalSubject: originalSubject || existingMessage.subject,
          adminId: session.user.id,
          adminName: session.user.name || 'Administrateur'
        }
      }
    })

    // Mettre à jour le statut du message original
    await prisma.contact.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        updatedAt: new Date()
      }
    })

    console.log(`Réponse envoyée au message ${id} pour l'utilisateur ${existingMessage.user.name}`)

    return NextResponse.json({
      message: 'Réponse envoyée avec succès',
      notification: {
        id: notification.id,
        userId: notification.userId,
        title: notification.title
      }
    })
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi de la réponse:', error)
    
    // Gestion d'erreur plus détaillée
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erreur: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 