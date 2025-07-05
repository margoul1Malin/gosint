import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeSSLLabsAnalysis } from '@/lib/ssllabs-executor'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { hostname } = await request.json()

    // Validation des données
    if (!hostname || typeof hostname !== 'string') {
      return NextResponse.json(
        { error: 'Nom d\'hôte requis' },
        { status: 400 }
      )
    }

    // Validation du format du hostname
    const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.?[a-zA-Z]{2,}$/
    if (!hostnameRegex.test(hostname.trim())) {
      return NextResponse.json(
        { error: 'Format d\'hôte invalide' },
        { status: 400 }
      )
    }

    console.log(`🔍 Analyse SSL Labs pour ${hostname} par l'utilisateur ${session.user.id}`)

    // Exécuter l'analyse SSL Labs
    const result = await executeSSLLabsAnalysis(hostname.trim())

    // Vérifier si il y a eu une erreur
    if (result.error) {
      return NextResponse.json(
        { error: `Erreur lors de l'analyse SSL: ${result.error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      result: result
    })

  } catch (error: any) {
    console.error('Erreur API ssltls-analyzer:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 