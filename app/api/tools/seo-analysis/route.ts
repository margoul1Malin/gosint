import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeSEOAnalysis } from '@/lib/seo-executor'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Parser le body de la requête
    const body = await request.json()
    const { url } = body

    // Validation de l'URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      )
    }

    // Validation du format de l'URL
    const cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'URL doit commencer par http:// ou https://' },
        { status: 400 }
      )
    }

    // Vérifier que l'URL est valide
    try {
      new URL(cleanUrl)
    } catch {
      return NextResponse.json(
        { error: 'Format d\'URL invalide' },
        { status: 400 }
      )
    }

    console.log(`🔍 Analyse SEO démarrée pour ${cleanUrl} par ${session.user?.email}`)

    // Exécuter l'analyse SEO
    const result = await executeSEOAnalysis(cleanUrl)

    console.log(`✅ Analyse SEO terminée pour ${cleanUrl} - Score: ${result.siteAnalysis.seoScore.overall}%`)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse SEO:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse SEO' },
      { status: 500 }
    )
  }
} 