import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface JSEndpoint {
  url: string
  type: 'api' | 'endpoint' | 'path' | 'resource'
  method?: string
  parameters?: string[]
  source: string
  risk: 'low' | 'medium' | 'high'
  description: string
}

interface JSEndpointResult {
  target: string
  jsFiles: string[]
  endpoints: JSEndpoint[]
  statistics: {
    totalJsFiles: number
    totalEndpoints: number
    apiEndpoints: number
    sensitiveEndpoints: number
    riskDistribution: {
      low: number
      medium: number
      high: number
    }
  }
  recommendations: string[]
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const { target } = await request.json()

    if (!target) {
      return NextResponse.json(
        { error: 'Domaine cible requis' },
        { status: 400 }
      )
    }

    // Validation du domaine
    let targetDomain: string
    try {
      // Nettoyer le domaine (enlever protocole, chemins, etc.)
      targetDomain = target
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .trim()
      
      if (!targetDomain || targetDomain.includes(' ')) {
        throw new Error('Domaine invalide')
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Format de domaine invalide' },
        { status: 400 }
      )
    }

    console.log(`🔍 Extraction des endpoints JS pour: ${targetDomain}`)

    // Exécuter GoLinkFinder pour trouver les fichiers JS
    const golinkfinderCommand = `GoLinkFinder -d ${targetDomain} | grep .js`
    
    try {
      const { stdout, stderr } = await execAsync(golinkfinderCommand, {
        timeout: 120000, // 2 minutes timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      })
      
      if (stderr && !stdout) {
        console.error('Erreur GoLinkFinder:', stderr)
        return NextResponse.json(
          { error: 'Erreur lors de l\'exécution de GoLinkFinder' },
          { status: 500 }
        )
      }

             // Parser les résultats et construire les URLs complètes
       const jsFiles = stdout
         .split('\n')
         .filter(line => line.trim() && line.includes('.js'))
         .map(line => {
           const path = line.trim()
           // Construire l'URL complète si c'est un chemin relatif
           if (path.startsWith('/')) {
             return `https://${targetDomain}${path}`
           }
           return path
         })
         .filter(url => {
           // Filtrer les URLs valides
           try {
             new URL(url)
             return true
           } catch {
             return false
           }
         })

       console.log(`📄 ${jsFiles.length} fichiers JS trouvés`)

       // Analyser chaque fichier JS pour extraire les endpoints
       const allEndpoints: JSEndpoint[] = []
       
       for (const jsFile of jsFiles.slice(0, 20)) { // Limiter à 20 fichiers pour éviter le timeout
         try {
           const endpoints = await extractEndpointsFromJS(jsFile)
           allEndpoints.push(...endpoints)
         } catch (error) {
           console.log(`⚠️ Erreur lors de l'analyse de ${jsFile}:`, error)
         }
       }

       // Dédupliquer les endpoints
       const uniqueEndpoints = deduplicateEndpoints(allEndpoints)

       // Calculer les statistiques
       const statistics = calculateStatistics(jsFiles, uniqueEndpoints)

       // Générer des recommandations
       const recommendations = generateRecommendations(uniqueEndpoints, statistics)

      const result: JSEndpointResult = {
        target: targetDomain,
        jsFiles,
        endpoints: uniqueEndpoints,
        statistics,
        recommendations,
        timestamp: new Date().toISOString()
      }

      console.log(`✅ Extraction terminée: ${uniqueEndpoints.length} endpoints trouvés`)

      return NextResponse.json(result)

    } catch (error) {
      console.error('Erreur lors de l\'exécution de GoLinkFinder:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'extraction des endpoints' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur dans l\'API JS Endpoint Extractor:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

async function extractEndpointsFromJS(jsFileUrl: string): Promise<JSEndpoint[]> {
  try {
    // Télécharger le contenu du fichier JS avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(jsFileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const jsContent = await response.text()
    const endpoints: JSEndpoint[] = []

    // Patterns pour détecter les endpoints
    const patterns = [
      // API endpoints
      {
        regex: /['"`]\/api\/[^'"`\s]+['"`]/g,
        type: 'api' as const,
        description: 'Endpoint API'
      },
      // REST endpoints
      {
        regex: /['"`]\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_\/-]+['"`]/g,
        type: 'endpoint' as const,
        description: 'Endpoint REST'
      },
      // URLs complètes
      {
        regex: /https?:\/\/[^'"`\s]+/g,
        type: 'resource' as const,
        description: 'URL externe'
      },
      // Chemins relatifs
      {
        regex: /['"`]\/[^'"`\s]*\.(json|xml|php|asp|jsp|do)['"`]/g,
        type: 'path' as const,
        description: 'Ressource serveur'
      }
    ]

    for (const pattern of patterns) {
      const matches = jsContent.match(pattern.regex)
      if (matches) {
        for (const match of matches) {
          const cleanUrl = match.replace(/['"`]/g, '')
          
          endpoints.push({
            url: cleanUrl,
            type: pattern.type,
            source: jsFileUrl,
            risk: assessRisk(cleanUrl),
            description: pattern.description,
            parameters: extractParameters(cleanUrl)
          })
        }
      }
    }

    return endpoints

  } catch (error) {
    console.log(`Erreur lors de l'analyse de ${jsFileUrl}:`, error)
    return []
  }
}

function assessRisk(url: string): 'low' | 'medium' | 'high' {
  const highRiskPatterns = [
    /admin/i,
    /login/i,
    /auth/i,
    /password/i,
    /token/i,
    /key/i,
    /secret/i,
    /config/i,
    /backup/i,
    /debug/i,
    /test/i,
    /dev/i
  ]

  const mediumRiskPatterns = [
    /api/i,
    /user/i,
    /profile/i,
    /account/i,
    /upload/i,
    /download/i,
    /delete/i,
    /update/i
  ]

  for (const pattern of highRiskPatterns) {
    if (pattern.test(url)) return 'high'
  }

  for (const pattern of mediumRiskPatterns) {
    if (pattern.test(url)) return 'medium'
  }

  return 'low'
}

function extractParameters(url: string): string[] {
  const params: string[] = []
  
  // Extraire les paramètres d'URL
  const urlParams = url.match(/[?&]([^=&]+)=/g)
  if (urlParams) {
    params.push(...urlParams.map(p => p.replace(/[?&=]/g, '')))
  }

  // Extraire les paramètres de chemin
  const pathParams = url.match(/{([^}]+)}/g)
  if (pathParams) {
    params.push(...pathParams.map(p => p.replace(/[{}]/g, '')))
  }

  return params
}

function deduplicateEndpoints(endpoints: JSEndpoint[]): JSEndpoint[] {
  const seen = new Set<string>()
  return endpoints.filter(endpoint => {
    const key = `${endpoint.url}:${endpoint.type}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function calculateStatistics(jsFiles: string[], endpoints: JSEndpoint[]) {
  const apiEndpoints = endpoints.filter(e => e.type === 'api').length
  const sensitiveEndpoints = endpoints.filter(e => e.risk === 'high').length
  
  const riskDistribution = {
    low: endpoints.filter(e => e.risk === 'low').length,
    medium: endpoints.filter(e => e.risk === 'medium').length,
    high: endpoints.filter(e => e.risk === 'high').length
  }

  return {
    totalJsFiles: jsFiles.length,
    totalEndpoints: endpoints.length,
    apiEndpoints,
    sensitiveEndpoints,
    riskDistribution
  }
}

function generateRecommendations(endpoints: JSEndpoint[], statistics: any): string[] {
  const recommendations: string[] = []

  if (statistics.sensitiveEndpoints > 0) {
    recommendations.push(`${statistics.sensitiveEndpoints} endpoints sensibles détectés - Vérifiez leur sécurité`)
  }

  if (statistics.apiEndpoints > 10) {
    recommendations.push('Nombreux endpoints API exposés - Auditez leur authentification')
  }

  const externalUrls = endpoints.filter(e => e.url.startsWith('http')).length
  if (externalUrls > 5) {
    recommendations.push(`${externalUrls} URLs externes trouvées - Vérifiez les dépendances`)
  }

  if (statistics.totalEndpoints > 50) {
    recommendations.push('Surface d\'attaque importante - Réduisez l\'exposition des endpoints')
  }

  const debugEndpoints = endpoints.filter(e => /debug|test|dev/i.test(e.url)).length
  if (debugEndpoints > 0) {
    recommendations.push(`${debugEndpoints} endpoints de debug/test trouvés - Supprimez-les en production`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Bonne pratique : Continuez à surveiller régulièrement vos endpoints')
  }

  return recommendations
} 