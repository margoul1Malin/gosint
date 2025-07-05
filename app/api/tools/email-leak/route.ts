import { NextRequest, NextResponse } from 'next/server'

interface ApiKeys {
  leakCheck: string
  hunterIo: string
}

interface EmailResult {
  service: string
  found: boolean
  data?: any
  error?: string
}

// Fonction pour vérifier avec LeakCheck
async function checkWithLeakCheck(email: string, apiKey: string): Promise<EmailResult> {
  try {
    const response = await fetch(`https://leakcheck.io/api/public?check=${encodeURIComponent(email)}`, {
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      service: 'leakcheck',
      found: data.found > 0,
      data: {
        success: data.success,
        found: data.found,
        fields: data.fields || [],
        sources: data.sources || []
      }
    }
  } catch (error) {
    return {
      service: 'leakcheck',
      found: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// Fonction pour vérifier avec Hunter.io
async function checkWithHunter(email: string, apiKey: string): Promise<EmailResult> {
  try {
    const response = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      throw new Error(data.errors[0]?.details || 'Erreur API Hunter.io')
    }
    
    const verificationData = data.data
    
    return {
      service: 'hunter',
      found: verificationData.status === 'invalid' || verificationData.result === 'risky',
      data: {
        email: verificationData.email,
        status: verificationData.status,
        result: verificationData.result,
        score: verificationData.score,
        regexp: verificationData.regexp,
        gibberish: verificationData.gibberish,
        disposable: verificationData.disposable,
        webmail: verificationData.webmail,
        mx_records: verificationData.mx_records,
        smtp_server: verificationData.smtp_server,
        smtp_check: verificationData.smtp_check,
        accept_all: verificationData.accept_all,
        block: verificationData.block
      }
    }
  } catch (error) {
    return {
      service: 'hunter',
      found: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, apiKeys } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Adresse email requise' }, { status: 400 })
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format d\'email invalide' }, { status: 400 })
    }

    const results: EmailResult[] = []

    // Vérifier avec LeakCheck si la clé API est fournie
    if (apiKeys.leakCheck) {
      const leakCheckResult = await checkWithLeakCheck(email, apiKeys.leakCheck)
      results.push(leakCheckResult)
    }

    // Vérifier avec Hunter.io si la clé API est fournie
    if (apiKeys.hunterIo) {
      const hunterResult = await checkWithHunter(email, apiKeys.hunterIo)
      results.push(hunterResult)
    }

    if (results.length === 0) {
      return NextResponse.json({ error: 'Aucune clé API fournie' }, { status: 400 })
    }

    return NextResponse.json({
      email,
      results,
      summary: {
        totalChecks: results.length,
        foundLeaks: results.filter(r => r.found).length,
        errors: results.filter(r => r.error).length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification email:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 