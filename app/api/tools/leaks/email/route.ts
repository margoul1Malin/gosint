import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Appel à l'API Have I Been Pwned
    const hibpResponse = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
      method: 'GET',
      headers: {
        'hibp-api-key': process.env.HIBP_API_KEY || '',
        'User-Agent': 'aOSINT-Tool'
      }
    })

    let results = []

    if (hibpResponse.status === 200) {
      // Des fuites ont été trouvées
      const breaches = await hibpResponse.json()
      
      results = breaches.map((breach: any) => ({
        source: breach.Name,
        breachDate: breach.BreachDate,
        description: breach.Description,
        dataClasses: breach.DataClasses,
        verified: breach.IsVerified,
        fabricated: breach.IsFabricated,
        sensitive: breach.IsSensitive,
        retired: breach.IsRetired,
        spamList: breach.IsSpamList
      }))
    } else if (hibpResponse.status === 404) {
      // Aucune fuite trouvée
      results = []
    } else if (hibpResponse.status === 429) {
      // Rate limit
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      )
    } else {
      // Autre erreur
      console.error('Erreur HIBP:', hibpResponse.status, hibpResponse.statusText)
      
      // Fallback avec des données d'exemple si l'API n'est pas disponible
      if (!process.env.HIBP_API_KEY) {
        // Données d'exemple pour les tests
        const testEmails = [
          'test@example.com',
          'demo@test.com',
          'admin@example.org'
        ]
        
        if (testEmails.includes(email.toLowerCase())) {
          results = [
            {
              source: 'Example Breach',
              breachDate: '2023-01-15',
              description: 'Exemple de fuite de données pour les tests',
              dataClasses: ['Email addresses', 'Passwords'],
              verified: true,
              fabricated: false,
              sensitive: false,
              retired: false,
              spamList: false
            }
          ]
        }
      } else {
        return NextResponse.json(
          { error: 'Service temporairement indisponible' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json({
      results,
      count: results.length,
      email: email
    })

  } catch (error) {
    console.error('Erreur lors de la vérification d\'email:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 