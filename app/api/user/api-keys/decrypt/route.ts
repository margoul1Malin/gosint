import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Clé de chiffrement (à stocker dans les variables d'environnement)
const ENCRYPTION_KEY = process.env.API_KEYS_ENCRYPTION_KEY || 'your-32-character-encryption-key'
const ALGORITHM = 'aes-256-cbc'

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

// POST - Récupérer toutes les clés API déchiffrées pour utilisation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les clés API depuis la base de données
    const userApiKeys = await prisma.userApiKeys.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!userApiKeys) {
      return NextResponse.json({ apiKeys: null })
    }

    // Déchiffrer les clés API
    const encryptedApiKeys = userApiKeys.apiKeys as string
    const decryptedApiKeys = JSON.parse(decrypt(encryptedApiKeys))

    // Mettre à jour la date de dernière utilisation
    await prisma.userApiKeys.update({
      where: {
        userId: session.user.id
      },
      data: {
        lastUsed: new Date()
      }
    })

    return NextResponse.json({
      apiKeys: decryptedApiKeys
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des clés API:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 