import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Clé de chiffrement (à stocker dans les variables d'environnement)
const ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || 'your-32-character-encryption-key'
const ALGORITHM = 'aes-256-cbc'

// Fonction pour chiffrer les données
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// Fonction pour déchiffrer les données
function decrypt(text: string): string {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = textParts.join(':')
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

// GET - Récupérer toutes les clés API d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userApiKeys = await prisma.userApiKeys.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!userApiKeys) {
      return NextResponse.json({ apiKeys: null, hasKeys: false })
    }

    // Déchiffrer les clés API
    const encryptedApiKeys = userApiKeys.apiKeys as string
    const decryptedApiKeys = JSON.parse(decrypt(encryptedApiKeys))

    // Masquer partiellement les clés pour la sécurité
    const maskedApiKeys = Object.keys(decryptedApiKeys).reduce((acc, key) => {
      const value = decryptedApiKeys[key]
      if (value && value.length > 8) {
        acc[key] = value.substring(0, 4) + '...' + value.substring(value.length - 4)
      } else {
        acc[key] = value ? '***' : ''
      }
      return acc
    }, {} as any)

    return NextResponse.json({
      apiKeys: maskedApiKeys,
      hasKeys: true,
      lastUsed: userApiKeys.lastUsed
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des clés API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Sauvegarder/mettre à jour les clés API d'un utilisateur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { apiKeys } = await request.json()

    if (!apiKeys || typeof apiKeys !== 'object') {
      return NextResponse.json({ error: 'apiKeys requis' }, { status: 400 })
    }

    // Récupérer les clés existantes
    const existingUserApiKeys = await prisma.userApiKeys.findUnique({
      where: {
        userId: session.user.id
      }
    })

    let allApiKeys = {}
    
    // Si l'utilisateur a déjà des clés, les déchiffrer d'abord
    if (existingUserApiKeys) {
      try {
        const encryptedApiKeys = existingUserApiKeys.apiKeys as string
        allApiKeys = JSON.parse(decrypt(encryptedApiKeys))
      } catch (error) {
        console.error('Erreur lors du déchiffrement des clés existantes:', error)
        allApiKeys = {}
      }
    }

    // Fusionner avec les nouvelles clés
    allApiKeys = { ...allApiKeys, ...apiKeys }

    // Chiffrer toutes les clés API
    const encryptedApiKeys = encrypt(JSON.stringify(allApiKeys))

    // Sauvegarder ou mettre à jour
    const userApiKeys = await prisma.userApiKeys.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        apiKeys: encryptedApiKeys,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        apiKeys: encryptedApiKeys
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Clés API sauvegardées avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des clés API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour la date de dernière utilisation
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    await prisma.userApiKeys.updateMany({
      where: {
        userId: session.user.id
      },
      data: {
        lastUsed: new Date()
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer toutes les clés API d'un utilisateur
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    await prisma.userApiKeys.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Toutes les clés API supprimées avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression des clés API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 