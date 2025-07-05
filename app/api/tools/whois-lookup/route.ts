import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeWhois } from '@/lib/whois-executor'

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

    const { domain } = await request.json()

    // Validation des données
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Nom de domaine requis' },
        { status: 400 }
      )
    }

    // Validation du format du domaine
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain.trim())) {
      return NextResponse.json(
        { error: 'Format de domaine invalide' },
        { status: 400 }
      )
    }

    console.log(`🔍 Recherche Whois pour ${domain} par l'utilisateur ${session.user.id}`)

    // Exécuter la recherche whois
    const result = await executeWhois(domain.trim())

    // Vérifier si il y a eu une erreur
    if (result.error && !result.rawOutput) {
      return NextResponse.json(
        { error: `Erreur lors de la recherche Whois: ${result.error}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      result: result
    })

  } catch (error: any) {
    console.error('Erreur API whois-lookup:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 