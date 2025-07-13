import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import http from 'http'

interface RedirectStep {
  step: number
  url: string
  statusCode: number
  method: string
  headers: Record<string, string>
  timestamp: string
  responseTime: number
}

interface UnshortenerResult {
  originalUrl: string
  finalUrl: string
  redirectChain: RedirectStep[]
  totalRedirects: number
  totalTime: number
  analysis: {
    isShortened: boolean
    suspiciousRedirects: string[]
    domains: string[]
    protocols: string[]
    statusCodes: number[]
  }
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      )
    }

    // Validation de l'URL
    let targetUrl: string
    try {
      // Ajouter https:// si pas de protocole
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        targetUrl = `https://${url}`
      } else {
        targetUrl = url
      }
      
      // Valider l'URL
      new URL(targetUrl)
    } catch (error) {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      )
    }

    console.log(`🔗 Traçage des redirections pour: ${targetUrl}`)

    const startTime = Date.now()
    const redirectChain = await getRedirectChain(targetUrl)
    const totalTime = Date.now() - startTime

    // Analyser les résultats
    const analysis = analyzeRedirects(redirectChain)
    
    const result: UnshortenerResult = {
      originalUrl: targetUrl,
      finalUrl: redirectChain.length > 0 ? redirectChain[redirectChain.length - 1].url : targetUrl,
      redirectChain,
      totalRedirects: redirectChain.length - 1, // -1 car le premier n'est pas une redirection
      totalTime,
      analysis,
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Traçage terminé: ${result.totalRedirects} redirections trouvées`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erreur dans l\'API URL Unshortener:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traçage des redirections' },
      { status: 500 }
    )
  }
}

async function getRedirectChain(url: string): Promise<RedirectStep[]> {
  return new Promise((resolve, reject) => {
    const redirectChain: RedirectStep[] = []
    let currentUrl = url
    const maxRedirects = 15
    let step = 1

    function requestUrl(urlToCheck: string) {
      if (redirectChain.length >= maxRedirects) {
        console.log(`⚠️ Limite de ${maxRedirects} redirections atteinte`)
        return resolve(redirectChain)
      }

      const startTime = Date.now()
      const lib = urlToCheck.startsWith('https') ? https : http
      
      const req = lib.request(urlToCheck, { 
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime
        const statusCode = res.statusCode || 0
        
        // Capturer les headers importants
        const headers: Record<string, string> = {}
        if (res.headers.location) headers.location = Array.isArray(res.headers.location) ? res.headers.location[0] : res.headers.location
        if (res.headers.server) headers.server = Array.isArray(res.headers.server) ? res.headers.server[0] : res.headers.server
        if (res.headers['content-type']) headers['content-type'] = Array.isArray(res.headers['content-type']) ? res.headers['content-type'][0] : res.headers['content-type']
        // Skip set-cookie header due to type complexity

        const redirectStep: RedirectStep = {
          step,
          url: urlToCheck,
          statusCode,
          method: 'HEAD',
          headers,
          timestamp: new Date().toISOString(),
          responseTime
        }

        redirectChain.push(redirectStep)

        // Vérifier s'il y a une redirection
        if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
          let location = res.headers.location

          // Gérer les redirections relatives
          if (location.startsWith('/')) {
            const base = new URL(urlToCheck)
            location = `${base.protocol}//${base.host}${location}`
          } else if (location.startsWith('//')) {
            const base = new URL(urlToCheck)
            location = `${base.protocol}${location}`
          } else if (!location.startsWith('http')) {
            const base = new URL(urlToCheck)
            location = `${base.protocol}//${base.host}/${location}`
          }

          currentUrl = location
          step++
          setTimeout(() => requestUrl(location), 100) // Petit délai pour éviter le spam
        } else {
          resolve(redirectChain)
        }
      })

      req.on('error', (err) => {
        console.error(`Erreur lors de la requête vers ${urlToCheck}:`, err.message)
        
        // Ajouter l'étape d'erreur
        redirectChain.push({
          step,
          url: urlToCheck,
          statusCode: 0,
          method: 'HEAD',
          headers: { error: err.message },
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime
        })
        
        resolve(redirectChain)
      })

      req.on('timeout', () => {
        req.destroy()
        console.error(`Timeout pour ${urlToCheck}`)
        
        redirectChain.push({
          step,
          url: urlToCheck,
          statusCode: 0,
          method: 'HEAD',
          headers: { error: 'Timeout' },
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime
        })
        
        resolve(redirectChain)
      })

      req.end()
    }

    requestUrl(currentUrl)
  })
}

function analyzeRedirects(redirectChain: RedirectStep[]) {
  const domains = [...new Set(redirectChain.map(step => {
    try {
      return new URL(step.url).hostname
    } catch {
      return 'invalid'
    }
  }))]

  const protocols = [...new Set(redirectChain.map(step => {
    try {
      return new URL(step.url).protocol
    } catch {
      return 'unknown'
    }
  }))]

  const statusCodes = [...new Set(redirectChain.map(step => step.statusCode).filter(code => code > 0))]

  // Détecter les redirections suspectes
  const suspiciousRedirects: string[] = []
  
  // Vérifier les domaines suspects
  const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'short.link', 'rebrand.ly']
  redirectChain.forEach(step => {
    try {
      const hostname = new URL(step.url).hostname
      if (suspiciousDomains.some(domain => hostname.includes(domain))) {
        suspiciousRedirects.push(`Domaine raccourcisseur détecté: ${hostname}`)
      }
    } catch {}
  })

  // Vérifier les redirections multiples vers le même domaine
  if (domains.length > 3) {
    suspiciousRedirects.push('Nombreuses redirections entre domaines différents')
  }

  // Vérifier les changements de protocole
  if (protocols.includes('http:') && protocols.includes('https:')) {
    suspiciousRedirects.push('Changement de protocole HTTP/HTTPS détecté')
  }

  return {
    isShortened: redirectChain.length > 1,
    suspiciousRedirects,
    domains,
    protocols,
    statusCodes
  }
} 