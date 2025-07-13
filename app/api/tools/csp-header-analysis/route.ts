import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface CSPHeaderResult {
  url: string
  headers: Record<string, string>
  cspHeaders: {
    'content-security-policy'?: string
    'content-security-policy-report-only'?: string
    'x-content-type-options'?: string
    'x-frame-options'?: string
    'x-xss-protection'?: string
    'strict-transport-security'?: string
    'referrer-policy'?: string
    'permissions-policy'?: string
  }
  analysis: {
    hasCSP: boolean
    hasCSPReportOnly: boolean
    hasXFrameOptions: boolean
    hasXContentTypeOptions: boolean
    hasXXSSProtection: boolean
    hasHSTS: boolean
    hasReferrerPolicy: boolean
    hasPermissionsPolicy: boolean
    securityScore: number
    recommendations: string[]
  }
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const { target } = await request.json()

    if (!target) {
      return NextResponse.json(
        { error: 'URL cible requise' },
        { status: 400 }
      )
    }

    // Validation de l'URL
    let targetUrl: string
    try {
      // Ajouter https:// si pas de protocole
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        targetUrl = `https://${target}`
      } else {
        targetUrl = target
      }
      
      // Valider l'URL
      const url = new URL(targetUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Protocole non supporté')
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      )
    }

    // Exécuter curl -I pour récupérer les headers
    const curlCommand = `curl -I -s -L --max-time 30 --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${targetUrl}"`
    
    try {
      const { stdout, stderr } = await execAsync(curlCommand)
      
      if (stderr && !stdout) {
        return NextResponse.json(
          { error: 'Impossible de récupérer les headers du site' },
          { status: 400 }
        )
      }

      // Parser les headers
      const headers: Record<string, string> = {}
      const lines = stdout.split('\n')
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim().toLowerCase()
          const value = line.substring(colonIndex + 1).trim()
          headers[key] = value
        }
      }

      // Extraire les headers de sécurité spécifiques
      const cspHeaders = {
        'content-security-policy': headers['content-security-policy'],
        'content-security-policy-report-only': headers['content-security-policy-report-only'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-frame-options': headers['x-frame-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'strict-transport-security': headers['strict-transport-security'],
        'referrer-policy': headers['referrer-policy'],
        'permissions-policy': headers['permissions-policy']
      }

      // Analyse des headers de sécurité
      const hasCSP = !!cspHeaders['content-security-policy']
      const hasCSPReportOnly = !!cspHeaders['content-security-policy-report-only']
      const hasXFrameOptions = !!cspHeaders['x-frame-options']
      const hasXContentTypeOptions = !!cspHeaders['x-content-type-options']
      const hasXXSSProtection = !!cspHeaders['x-xss-protection']
      const hasHSTS = !!cspHeaders['strict-transport-security']
      const hasReferrerPolicy = !!cspHeaders['referrer-policy']
      const hasPermissionsPolicy = !!cspHeaders['permissions-policy']

      // Calcul du score de sécurité
      let securityScore = 0
      const maxScore = 8
      
      if (hasCSP) securityScore += 2 // CSP est le plus important
      if (hasCSPReportOnly) securityScore += 0.5
      if (hasXFrameOptions) securityScore += 1
      if (hasXContentTypeOptions) securityScore += 1
      if (hasXXSSProtection) securityScore += 0.5
      if (hasHSTS) securityScore += 1.5
      if (hasReferrerPolicy) securityScore += 0.5
      if (hasPermissionsPolicy) securityScore += 1

      securityScore = Math.round((securityScore / maxScore) * 100)

      // Recommandations
      const recommendations: string[] = []
      
      if (!hasCSP) {
        recommendations.push('Ajouter un header Content-Security-Policy pour prévenir les attaques XSS')
      }
      if (!hasXFrameOptions) {
        recommendations.push('Ajouter X-Frame-Options pour prévenir le clickjacking')
      }
      if (!hasXContentTypeOptions) {
        recommendations.push('Ajouter X-Content-Type-Options: nosniff pour prévenir le MIME sniffing')
      }
      if (!hasHSTS) {
        recommendations.push('Ajouter Strict-Transport-Security pour forcer HTTPS')
      }
      if (!hasReferrerPolicy) {
        recommendations.push('Ajouter Referrer-Policy pour contrôler les informations de référence')
      }
      if (!hasPermissionsPolicy) {
        recommendations.push('Considérer l\'ajout de Permissions-Policy pour contrôler les APIs du navigateur')
      }

      const result: CSPHeaderResult = {
        url: targetUrl,
        headers,
        cspHeaders,
        analysis: {
          hasCSP,
          hasCSPReportOnly,
          hasXFrameOptions,
          hasXContentTypeOptions,
          hasXXSSProtection,
          hasHSTS,
          hasReferrerPolicy,
          hasPermissionsPolicy,
          securityScore,
          recommendations
        },
        timestamp: new Date().toISOString()
      }

      return NextResponse.json(result)

    } catch (error) {
      console.error('Erreur lors de l\'exécution de curl:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse des headers' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur dans l\'API CSP Header Analysis:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 