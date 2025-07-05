export interface SSLLabsResult {
  host: string
  port: number
  protocol: string
  status: string
  startTime: number
  testTime: number
  engineVersion: string
  endpoints: SSLEndpoint[]
  certs: SSLCertificate[]
  error?: string
}

export interface SSLEndpoint {
  ipAddress: string
  statusMessage: string
  grade: string
  gradeTrustIgnored: string
  hasWarnings: boolean
  isExceptional: boolean
  progress: number
  duration: number
  details?: SSLEndpointDetails
}

export interface SSLEndpointDetails {
  hostStartTime: number
  certChains: SSLCertChain[]
  protocols: SSLProtocol[]
  suites: SSLSuite[]
  heartbleed: boolean
  heartbeat: boolean
  openSslCcs: number
  openSSLLuckyMinus20: number
  ticketbleed: number
  bleichenbacher: number
  poodle: boolean
  poodleTls: number
  fallbackScsv: boolean
  freak: boolean
  hasSct: number
  hstsPolicy?: SSLHstsPolicy
  hstsPreloads?: SSLHstsPreload[]
  httpTransactions?: SSLHttpTransaction[]
}

export interface SSLCertChain {
  id: string
  certIds: string[]
  trustPaths: SSLTrustPath[]
  issues: number
  noSni: boolean
}

export interface SSLTrustPath {
  certIds: string[]
  trust: SSLTrust[]
}

export interface SSLTrust {
  rootStore: string
  isTrusted: boolean
  trustErrorMessage?: string
}

export interface SSLProtocol {
  id: number
  name: string
  version: string
}

export interface SSLSuite {
  protocol: number
  list: SSLSuiteItem[]
}

export interface SSLSuiteItem {
  id: number
  name: string
  cipherStrength: number
  kxType: string
  kxStrength: number
  namedGroupBits?: number
  namedGroupId?: number
  namedGroupName?: string
}

export interface SSLHstsPolicy {
  status: string
  maxAge: number
  header: string
  directives: Record<string, string>
}

export interface SSLHstsPreload {
  source: string
  hostname: string
  status: string
  sourceTime: number
}

export interface SSLHttpTransaction {
  requestUrl: string
  statusCode: number
  requestLine: string
  requestHeaders: string[]
  responseLine: string
  responseHeaders: SSLHttpHeader[]
}

export interface SSLHttpHeader {
  name: string
  value: string
}

export interface SSLCertificate {
  id: string
  subject: string
  serialNumber: string
  commonNames: string[]
  altNames: string[]
  notBefore: number
  notAfter: number
  issuerSubject: string
  sigAlg: string
  revocationInfo: number
  revocationStatus: number
  crlRevocationStatus: number
  ocspRevocationStatus: number
  keyAlg: string
  keySize: number
  keyStrength: number
  sha1Hash: string
  sha256Hash: string
  pinSha256: string
  raw: string
  issues: number
  sct: boolean
}

export async function executeSSLLabsAnalysis(hostname: string): Promise<SSLLabsResult> {
  const result: SSLLabsResult = {
    host: hostname,
    port: 443,
    protocol: 'https',
    status: 'IN_PROGRESS',
    startTime: Date.now(),
    testTime: 0,
    engineVersion: '',
    endpoints: [],
    certs: []
  }

  try {
    console.log(`🔍 Démarrage de l'analyse SSL Labs pour: ${hostname}`)
    
    // Étape 1: Démarrer l'analyse
    const startUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(hostname)}`
    console.log(`📡 Démarrage de l'analyse: ${startUrl}`)
    
    const startResponse = await fetch(startUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'aOSINT SSL Labs Client'
      }
    })

    if (!startResponse.ok) {
      throw new Error(`Erreur API SSL Labs: ${startResponse.status} ${startResponse.statusText}`)
    }

    const startData = await startResponse.json()
    console.log(`📊 Réponse initiale:`, { status: startData.status, host: startData.host })

    // Étape 2: Polling jusqu'à ce que l'analyse soit terminée
    let pollCount = 0
    const maxPolls = 150 // 5 minutes max (150 * 2 secondes)
    
    while (pollCount < maxPolls) {
      console.log(`🔄 Polling ${pollCount + 1}/${maxPolls}...`)
      
      // Attendre 2 secondes entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const pollUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(hostname)}`
      const pollResponse = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'aOSINT SSL Labs Client'
        }
      })

      if (!pollResponse.ok) {
        throw new Error(`Erreur lors du polling: ${pollResponse.status} ${pollResponse.statusText}`)
      }

      const pollData = await pollResponse.json()
      console.log(`📊 Status: ${pollData.status}`)

      if (pollData.status === 'READY') {
        console.log(`✅ Analyse terminée, récupération des résultats complets...`)
        
        // Étape 3: Récupérer les résultats complets
        const finalUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(hostname)}&all=done`
        const finalResponse = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'aOSINT SSL Labs Client'
          }
        })

        if (!finalResponse.ok) {
          throw new Error(`Erreur lors de la récupération finale: ${finalResponse.status} ${finalResponse.statusText}`)
        }

        const finalData = await finalResponse.json()
        console.log(`🎉 Résultats complets récupérés pour ${hostname}`)
        
        // Parser et retourner les résultats
        return parseSSLLabsResult(finalData)
      }

      if (pollData.status === 'ERROR') {
        throw new Error(`Erreur SSL Labs: ${pollData.statusMessage || 'Erreur inconnue'}`)
      }

      pollCount++
    }

    throw new Error('Timeout: L\'analyse SSL Labs a pris trop de temps')

  } catch (error: any) {
    console.error(`❌ Erreur SSL Labs pour ${hostname}:`, error.message)
    result.error = error.message
    result.status = 'ERROR'
    return result
  }
}

function parseSSLLabsResult(data: any): SSLLabsResult {
  const result: SSLLabsResult = {
    host: data.host || '',
    port: data.port || 443,
    protocol: data.protocol || 'https',
    status: data.status || 'UNKNOWN',
    startTime: data.startTime || 0,
    testTime: data.testTime || 0,
    engineVersion: data.engineVersion || '',
    endpoints: [],
    certs: []
  }

  // Parser les endpoints
  if (data.endpoints && Array.isArray(data.endpoints)) {
    result.endpoints = data.endpoints.map((endpoint: any) => ({
      ipAddress: endpoint.ipAddress || '',
      statusMessage: endpoint.statusMessage || '',
      grade: endpoint.grade || 'T',
      gradeTrustIgnored: endpoint.gradeTrustIgnored || 'T',
      hasWarnings: endpoint.hasWarnings || false,
      isExceptional: endpoint.isExceptional || false,
      progress: endpoint.progress || 0,
      duration: endpoint.duration || 0,
      details: endpoint.details ? parseEndpointDetails(endpoint.details) : undefined
    }))
  }

  // Parser les certificats
  if (data.certs && Array.isArray(data.certs)) {
    result.certs = data.certs.map((cert: any) => ({
      id: cert.id || '',
      subject: cert.subject || '',
      serialNumber: cert.serialNumber || '',
      commonNames: cert.commonNames || [],
      altNames: cert.altNames || [],
      notBefore: cert.notBefore || 0,
      notAfter: cert.notAfter || 0,
      issuerSubject: cert.issuerSubject || '',
      sigAlg: cert.sigAlg || '',
      revocationInfo: cert.revocationInfo || 0,
      revocationStatus: cert.revocationStatus || 0,
      crlRevocationStatus: cert.crlRevocationStatus || 0,
      ocspRevocationStatus: cert.ocspRevocationStatus || 0,
      keyAlg: cert.keyAlg || '',
      keySize: cert.keySize || 0,
      keyStrength: cert.keyStrength || 0,
      sha1Hash: cert.sha1Hash || '',
      sha256Hash: cert.sha256Hash || '',
      pinSha256: cert.pinSha256 || '',
      raw: cert.raw || '',
      issues: cert.issues || 0,
      sct: cert.sct || false
    }))
  }

  return result
}

function parseEndpointDetails(details: any): SSLEndpointDetails {
  return {
    hostStartTime: details.hostStartTime || 0,
    certChains: details.certChains || [],
    protocols: details.protocols || [],
    suites: details.suites || [],
    heartbleed: details.heartbleed || false,
    heartbeat: details.heartbeat || false,
    openSslCcs: details.openSslCcs || 0,
    openSSLLuckyMinus20: details.openSSLLuckyMinus20 || 0,
    ticketbleed: details.ticketbleed || 0,
    bleichenbacher: details.bleichenbacher || 0,
    poodle: details.poodle || false,
    poodleTls: details.poodleTls || 0,
    fallbackScsv: details.fallbackScsv || false,
    freak: details.freak || false,
    hasSct: details.hasSct || 0,
    hstsPolicy: details.hstsPolicy,
    hstsPreloads: details.hstsPreloads,
    httpTransactions: details.httpTransactions
  }
} 