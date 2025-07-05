import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { contactId, response } = body

    if (!contactId || !response) {
      return NextResponse.json(
        { error: 'ID du contact et réponse requis' },
        { status: 400 }
      )
    }

    // Récupérer le message de contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { user: true }
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Message de contact non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut du contact
    await prisma.contact.update({
      where: { id: contactId },
      data: {
        status: 'RESPONDED',
        response: response,
        respondedAt: new Date(),
        respondedBy: session.user.id
      }
    })

    // Créer une notification pour l'utilisateur
    // Pour l'instant, on simule la création de notification
    // car le modèle Notification n'existe pas encore dans le schéma
    
    /* 
    await prisma.notification.create({
      data: {
        title: 'Réponse à votre message',
        message: `Votre message "${contact.subject}" a reçu une réponse de notre équipe.`,
        type: 'RESPONSE',
        userId: contact.userId,
        isRead: false,
        relatedId: contactId,
        relatedType: 'CONTACT'
      }
    })
    */

    console.log(`Réponse envoyée pour le contact ${contactId} par ${session.user.name}`)

    return NextResponse.json({
      success: true,
      message: 'Réponse envoyée avec succès',
      contactId,
      // Simulation de la notification créée
      notification: {
        title: 'Réponse à votre message',
        message: `Votre message "${contact.subject}" a reçu une réponse de notre équipe.`,
        type: 'RESPONSE',
        userId: contact.userId,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 