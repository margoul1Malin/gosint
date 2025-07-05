import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const skip = (page - 1) * limit

    const whereClause = {
      userId: session.user.id,
      ...(unreadOnly && { isRead: false })
    }

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({ 
        where: { userId: session.user.id, isRead: false } 
      })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      unreadCount
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type = 'INFO', targetUserId } = body

    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur est admin pour créer des notifications pour d'autres utilisateurs
    if (targetUserId && targetUserId !== session.user.id) {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Accès refusé' },
          { status: 403 }
        )
      }
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: targetUserId || session.user.id,
        isRead: false
      }
    })

    console.log(`Nouvelle notification créée: ${notification.id}`)

    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Marquer une notification comme lue (nouvelle méthode)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationIds, notificationId, markAllAsRead } = body

    if (action === 'markAsRead' && notificationIds) {
      // Marquer plusieurs notifications comme lues
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'markAllAsRead' || markAllAsRead) {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      // Marquer une notification spécifique comme lue
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: session.user.id
        }
      })

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification non trouvée' },
          { status: 404 }
        )
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return NextResponse.json(updatedNotification)
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID de notification requis' },
        { status: 400 }
      )
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 