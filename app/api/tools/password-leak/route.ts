import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface ApiKeys {
  leakCheck?: string
  haveIBeenPwned?: string
}

interface PasswordResult {
  service: string
  found: boolean
  data?: any
  error?: string
}

// Fonction pour vérifier avec LeakCheck
async function checkLeakCheck(password: string, apiKey: string): Promise<PasswordResult> {
  try {
    // Créer un hash SHA256 du mot de passe pour LeakCheck
    const hash = crypto.createHash('sha256').update(password).digest('hex')
    
    const response = await fetch(`https://leakcheck.io/api/v2/query/${hash}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        service: 'leakcheck',
        found: false,
        error: `Erreur API LeakCheck: ${response.status} - ${errorText}`
      }
    }

    const data = await response.json()
    
    return {
      service: 'leakcheck',
      found: data.found > 0,
      data: {
        success: data.success,
        found: data.found,
        sources: data.sources || []
      }
    }
  } catch (error) {
    return {
      service: 'leakcheck',
      found: false,
      error: `Erreur LeakCheck: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

// Fonction pour vérifier avec HaveIBeenPwned
async function checkHaveIBeenPwned(password: string, apiKey: string): Promise<PasswordResult> {
  try {
    // Créer un hash SHA-1 du mot de passe pour HaveIBeenPwned
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = hash.substring(0, 5)
    const suffix = hash.substring(5)
    
    // Utiliser l'API k-anonymity de HaveIBeenPwned
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'hibp-api-key': apiKey,
        'User-Agent': 'AOSINT-Password-Checker'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        service: 'haveibeenpwned',
        found: false,
        error: `Erreur API HaveIBeenPwned: ${response.status} - ${errorText}`
      }
    }

    const data = await response.text()
    const lines = data.split('\n')
    
    // Chercher le hash dans les résultats
    let count = 0
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':')
      if (hashSuffix === suffix) {
        count = parseInt(countStr, 10)
        break
      }
    }
    
    return {
      service: 'haveibeenpwned',
      found: count > 0,
      data: {
        count: count,
        compromised: count > 0,
        hash: hash
      }
    }
  } catch (error) {
    return {
      service: 'haveibeenpwned',
      found: false,
      error: `Erreur HaveIBeenPwned: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password, apiKeys } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    }

    if (!apiKeys || (!apiKeys.leakCheck && !apiKeys.haveIBeenPwned)) {
      return NextResponse.json({ error: 'Au moins une clé API est requise' }, { status: 400 })
    }

    const results: PasswordResult[] = []

    // Vérifier avec LeakCheck si la clé est fournie
    if (apiKeys.leakCheck) {
      console.log('Checking password with LeakCheck...')
      const leakCheckResult = await checkLeakCheck(password, apiKeys.leakCheck)
      results.push(leakCheckResult)
    }

    // Vérifier avec HaveIBeenPwned si la clé est fournie
    if (apiKeys.haveIBeenPwned) {
      console.log('Checking password with HaveIBeenPwned...')
      const haveIBeenPwnedResult = await checkHaveIBeenPwned(password, apiKeys.haveIBeenPwned)
      results.push(haveIBeenPwnedResult)
    }

    return NextResponse.json({
      results,
      summary: {
        totalChecks: results.length,
        foundLeaks: results.filter(r => r.found).length,
        errors: results.filter(r => r.error).length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
} 