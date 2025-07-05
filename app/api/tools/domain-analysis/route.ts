import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeDNSAnalysis } from '@/lib/dns-executor'

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
    const { domain } = body

    // Validation du domaine
    if (!domain || typeof domain !== 'string' || domain.trim() === '') {
      return NextResponse.json(
        { error: 'Domaine requis' },
        { status: 400 }
      )
    }

    // Validation du format du domaine
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.?[a-zA-Z]{2,}$/
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { error: 'Format de domaine invalide' },
        { status: 400 }
      )
    }

    console.log(`🔍 Analyse DNS démarrée pour ${cleanDomain} par ${session.user?.email}`)

    // Exécuter l'analyse DNS
    const result = await executeDNSAnalysis(cleanDomain)

    console.log(`✅ Analyse DNS terminée pour ${cleanDomain} - ${result.summary.totalRecords} enregistrements trouvés`)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse DNS:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse DNS' },
      { status: 500 }
    )
  }
} 