import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeTechAnalysis } from '@/lib/web-technologies-executor'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { url } = await request.json()

    // Validation de l'URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { message: 'URL requise' },
        { status: 400 }
      )
    }

    // Vérifier le format de l'URL
    try {
      new URL(url)
    } catch (error) {
      return NextResponse.json(
        { message: 'Format d\'URL invalide' },
        { status: 400 }
      )
    }

    console.log(`🔍 Analyse des technologies web pour: ${url}`)

    // Exécuter l'analyse des technologies
    const result = await executeTechAnalysis(url)

    console.log(`✅ Analyse terminée pour ${url}`)
    console.log(`📊 Technologies détectées: ${result.summary.totalTechnologies}`)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'analyse des technologies:', error)
    
    return NextResponse.json(
      { 
        message: error.message || 'Erreur lors de l\'analyse des technologies',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 