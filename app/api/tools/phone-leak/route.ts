import { NextRequest, NextResponse } from 'next/server'

interface ApiKeys {
  leakCheck: string
  numVerify: string
  twilioSid: string
  twilioToken: string
}

interface PhoneResult {
  service: string
  found: boolean
  data?: any
  error?: string
}

// Fonction pour normaliser le numéro de téléphone
function normalizePhoneNumber(phone: string): string {
  // Supprimer tous les caractères non numériques sauf le +
  let normalized = phone.replace(/[^\d+]/g, '')
  
  // Si le numéro commence par 0, le remplacer par +33 (France)
  if (normalized.startsWith('0')) {
    normalized = '+33' + normalized.substring(1)
  }
  
  // Si le numéro ne commence pas par +, ajouter +33
  if (!normalized.startsWith('+')) {
    normalized = '+33' + normalized
  }
  
  return normalized
}

// Fonction pour formater le numéro selon le service
function formatPhoneForService(normalizedPhone: string, service: 'leakcheck' | 'numverify' | 'twilio'): string {
  switch (service) {
    case 'leakcheck':
      // LeakCheck attend le format sans le + : 33643323412
      return normalizedPhone.replace('+', '')
    case 'numverify':
      // NumVerify attend le format avec le + : +33643323412
      return normalizedPhone
    case 'twilio':
      // Twilio attend le format avec le + : +33643323412
      return normalizedPhone
    default:
      return normalizedPhone
  }
}

// Fonction pour vérifier avec LeakCheck
async function checkWithLeakCheck(phoneNumber: string, apiKey: string): Promise<PhoneResult> {
  try {
    const formattedPhone = formatPhoneForService(phoneNumber, 'leakcheck')
    const response = await fetch(`https://leakcheck.io/api/public?key=${apiKey}&check=${encodeURIComponent(formattedPhone)}&type=phone`, {
      method: 'GET',
      headers: {
        'User-Agent': 'aOSINT-Tool/1.0'
      }
    })

    if (!response.ok) {
      return {
        service: 'leakcheck',
        found: false,
        error: `Erreur API: ${response.status}`
      }
    }

    const data = await response.json()
    
    return {
      service: 'leakcheck',
      found: data.found === true || data.found === 1 || data.found > 0,
      data: data // Retourner toutes les données de l'API
    }
  } catch (error) {
    return {
      service: 'leakcheck',
      found: false,
      error: 'Erreur de connexion à LeakCheck'
    }
  }
}

// Fonction pour vérifier avec NumVerify
async function checkWithNumVerify(phoneNumber: string, apiKey: string): Promise<PhoneResult> {
  try {
    // NumVerify attend le format avec + mais dans l'URL on l'encode
    const formattedPhone = formatPhoneForService(phoneNumber, 'numverify')
    const cleanNumber = formattedPhone.replace('+', '') // Pour l'URL
    const response = await fetch(`http://apilayer.net/api/validate?access_key=${apiKey}&number=${cleanNumber}`, {
      method: 'GET'
    })

    if (!response.ok) {
      return {
        service: 'numverify',
        found: false,
        error: `Erreur API: ${response.status}`
      }
    }

    const data = await response.json()
    
    if (data.error) {
      return {
        service: 'numverify',
        found: false,
        error: data.error.info || 'Erreur NumVerify'
      }
    }

    return {
      service: 'numverify',
      found: false, // NumVerify ne détecte pas les fuites
      data: data // Retourner toutes les données de l'API
    }
  } catch (error) {
    return {
      service: 'numverify',
      found: false,
      error: 'Erreur de connexion à NumVerify'
    }
  }
}

// Fonction pour vérifier avec Twilio Lookup
async function checkWithTwilio(phoneNumber: string, sid: string, token: string): Promise<PhoneResult> {
  try {
    // Twilio Lookup attend le format avec + : +33643323412
    const formattedPhone = formatPhoneForService(phoneNumber, 'twilio')
    // Utiliser l'API v2 avec line_type_intelligence pour plus d'informations
    const response = await fetch(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(formattedPhone)}?Fields=line_type_intelligence`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`
      }
    })

    if (!response.ok) {
      return {
        service: 'twilio',
        found: false,
        error: `Erreur API: ${response.status}`
      }
    }

    const data = await response.json()
    
    return {
      service: 'twilio',
      found: false, // Twilio Lookup ne détecte pas les fuites
      data: data // Retourner toutes les données de l'API
    }
  } catch (error) {
    return {
      service: 'twilio',
      found: false,
      error: 'Erreur de connexion à Twilio'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, apiKeys } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhoneNumber(phoneNumber)

    // Vérifier qu'au moins une clé API est fournie
    if (!apiKeys.leakCheck && !apiKeys.numVerify && (!apiKeys.twilioSid || !apiKeys.twilioToken)) {
      return NextResponse.json({ error: 'Au moins une clé API est requise' }, { status: 400 })
    }

    const results: PhoneResult[] = []

    // Exécuter les vérifications en parallèle
    const promises = []

    if (apiKeys.leakCheck) {
      promises.push(checkWithLeakCheck(normalizedPhone, apiKeys.leakCheck))
    }

    if (apiKeys.numVerify) {
      promises.push(checkWithNumVerify(normalizedPhone, apiKeys.numVerify))
    }

    if (apiKeys.twilioSid && apiKeys.twilioToken) {
      promises.push(checkWithTwilio(normalizedPhone, apiKeys.twilioSid, apiKeys.twilioToken))
    }

    const allResults = await Promise.all(promises)
    results.push(...allResults)

    return NextResponse.json({
      phoneNumber: normalizedPhone,
      results,
      summary: {
        totalChecks: results.length,
        leaksFound: results.filter(r => r.found).length,
        errors: results.filter(r => r.error).length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 