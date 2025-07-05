import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Validation manuelle des données de contact
function validateContactData(data: any) {
  const errors: string[] = []
  
  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length < 3) {
    errors.push('Le sujet doit contenir au moins 3 caractères')
  }
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Le message doit contenir au moins 10 caractères')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour envoyer un message' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Valider les données
    const validation = validateContactData(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.errors },
        { status: 400 }
      )
    }

    // Récupérer les informations de l'utilisateur connecté
    const userEmail = session.user.email
    const userName = session.user.name || 'Utilisateur'

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email utilisateur manquant' },
        { status: 400 }
      )
    }

    // Récupérer les informations complètes de l'utilisateur depuis la DB
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer l'adresse IP et user agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Créer le message de contact en base de données
    const contact = await prisma.contact.create({
      data: {
        name: user.name || 'Utilisateur',
        email: user.email,
        phone: user.phone || null,
        company: null,
        subject: body.subject.trim(),
        message: body.message.trim(),
        category: 'GENERAL',
        priority: 'NORMAL',
        status: 'PENDING',
        ipAddress: ip,
        userAgent: userAgent,
        userId: user.id
      }
    })

    console.log('Nouveau message de contact reçu:', {
      id: contact.id,
      from: user.name,
      email: user.email,
      subject: body.subject
    })

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      contactId: contact.id
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification pour les admins
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    // Construire les filtres
    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    // Récupérer les messages avec pagination
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        subject: true,
        message: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Compter le total
    const total = await prisma.contact.count({ where })

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 