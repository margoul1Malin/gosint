'use client'

import { useState } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import { 
  FiShield, 
  FiLoader, 
  FiAlertCircle, 
  FiGlobe,
  FiCalendar,
  FiLock,
  FiServer,
  FiCopy,
  FiCheck,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiKey,
  FiActivity,
  FiMonitor,
  FiWifi,
  FiHardDrive
} from 'react-icons/fi'

interface SSLLabsResult {
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

interface SSLEndpoint {
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

interface SSLEndpointDetails {
  protocols: SSLProtocol[]
  suites: SSLSuite[]
  vulnBeast: boolean
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
  forwardSecrecy: number
  supportsAead: boolean
  supportsRc4: boolean
  supportsAlpn: boolean
  alpnProtocols: string
  sessionTickets: number
  ocspStapling: boolean
  sniRequired: boolean
  httpStatusCode: number
  httpForwarding: string
  serverSignature: string
  sims?: {
    results: SSLSimResult[]
  }
}

interface SSLProtocol {
  id: number
  name: string
  version: string
}

interface SSLSuite {
  protocol: number
  list: SSLSuiteItem[]
}

interface SSLSuiteItem {
  id: number
  name: string
  cipherStrength: number
  kxType: string
  kxStrength: number
  namedGroupBits?: number
  namedGroupId?: number
  namedGroupName?: string
}

interface SSLSimResult {
  client: {
    id: number
    name: string
    version: string
    platform?: string
  }
  errorCode: number
  errorMessage?: string
  protocolId?: number
  suiteId?: number
  suiteName?: string
}

interface SSLCertificate {
  id: string
  subject: string
  serialNumber: string
  commonNames: string[]
  altNames: string[]
  notBefore: number
  notAfter: number
  issuerSubject: string
  sigAlg: string
  keyAlg: string
  keySize: number
  keyStrength: number
  sha1Hash: string
  sha256Hash: string
  pinSha256: string
  issues: number
  sct: boolean
  mustStaple: boolean
  revocationStatus: number
  crlURIs?: string[]
  raw: string
}

export default function SSLTLSAnalyzerPage() {
  const [hostname, setHostname] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SSLLabsResult | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hostname.trim()) {
      setError('Veuillez entrer un nom d\'hôte')
      return
    }

    const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.?[a-zA-Z]{2,}$/
    if (!hostnameRegex.test(hostname.trim())) {
      setError('Veuillez entrer un nom d\'hôte valide (ex: example.com)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)
    setActiveTab('overview')

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 2000)

    try {
      const response = await fetch('/api/tools/ssltls-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostname: hostname.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
        setProgress(100)
      } else {
        setError(data.error || 'Erreur lors de l\'analyse SSL')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'A': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'A-': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'B': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400'
      case 'C': return 'text-orange-400 bg-orange-400/20 border-orange-400'
      case 'D': return 'text-red-400 bg-red-400/20 border-red-400'
      case 'F': return 'text-red-500 bg-red-500/20 border-red-500'
      case 'T': return 'text-gray-400 bg-gray-400/20 border-gray-400'
      default: return 'text-accent bg-accent/20 border-accent'
    }
  }

  const getVulnerabilityColor = (hasVuln: boolean) => {
    return hasVuln ? 'text-red-400' : 'text-green-400'
  }

  const getForwardSecrecyText = (level: number) => {
    switch (level) {
      case 0: return 'Aucune'
      case 1: return 'Limitée'
      case 2: return 'Partielle'
      case 4: return 'Complète'
      default: return 'Inconnue'
    }
  }

  const getRevocationStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Non vérifié'
      case 1: return 'Bon'
      case 2: return 'Révoqué'
      case 3: return 'Erreur'
      case 4: return 'Non disponible'
      default: return 'Inconnu'
    }
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Non disponible'
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Date invalide'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const isExpiringSoon = (timestamp: number) => {
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000
    return timestamp - now < thirtyDays
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: FiGlobe },
    { id: 'certificates', label: 'Certificats', icon: FiLock },
    { id: 'protocols', label: 'Protocoles', icon: FiWifi },
    { id: 'vulnerabilities', label: 'Vulnérabilités', icon: FiShield },
    { id: 'compatibility', label: 'Compatibilité', icon: FiMonitor }
  ]

  return (
    <ToolsLayout
      title="SSL/TLS Analyzer"
      description="Analyse complète de la sécurité SSL/TLS d'un site web"
      icon={<FiShield className="w-12 h-12 text-accent" />}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section d'information */}
        <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-accent">À propos de l'analyse SSL/TLS</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed">
            Cet outil utilise l'API SSL Labs pour effectuer une analyse complète de la configuration SSL/TLS d'un site web. 
            Il évalue la sécurité des certificats, les protocoles supportés, les suites de chiffrement, détecte les vulnérabilités connues
            et teste la compatibilité avec différents navigateurs et systèmes d'exploitation.
          </p>
        </div>

        {/* Formulaire d'analyse */}
        <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
            <FiShield className="w-6 h-6" />
            Analyse SSL/TLS
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="hostname" className="block text-sm font-medium text-foreground/70 mb-2">
                Nom d'hôte
              </label>
              <input
                type="text"
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="example.com"
                className="w-full bg-surface/30 border border-secondary/50 rounded-lg px-4 py-3 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-background font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Analyse en cours... ({Math.round(progress)}%)
                </>
              ) : (
                <>
                  <FiShield className="w-5 h-5" />
                  Analyser
                </>
              )}
            </button>
          </form>

          {/* Barre de progression */}
          {loading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-foreground/70 mb-2">
                <span>Progression de l'analyse</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-surface/30 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Résultats */}
        {result && (
          <div className="space-y-6">
            {/* Résumé général */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-accent flex items-center gap-2">
                  <FiGlobe className="w-8 h-8" />
                  {result.host}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-foreground/50" />
                    <span className="text-sm text-foreground/50">
                      {formatDuration(result.testTime - result.startTime)}
                    </span>
                  </div>
                  {result.endpoints.length > 0 && (
                    <span className={`px-4 py-2 rounded-full text-lg font-bold border ${getGradeColor(result.endpoints[0].grade)}`}>
                      Note: {result.endpoints[0].grade}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiServer className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Endpoints</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{result.endpoints.length}</p>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiLock className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Certificats</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{result.certs.length}</p>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiWifi className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Protocoles</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {result.endpoints[0]?.details?.protocols?.length || 0}
                  </p>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Statut</span>
                  </div>
                  <p className="text-lg font-bold text-green-400">{result.status}</p>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg overflow-hidden">
              <div className="flex border-b border-secondary/30 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-accent border-b-2 border-accent bg-accent/10'
                        : 'text-foreground/70 hover:text-foreground hover:bg-surface/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Vue d'ensemble */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {result.endpoints.map((endpoint, index) => (
                      <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-foreground">{endpoint.ipAddress}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(endpoint.grade)}`}>
                              {endpoint.grade}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {endpoint.hasWarnings && (
                              <FiAlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                            {endpoint.isExceptional && (
                              <FiCheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-foreground/70">Serveur:</span>
                            <span className="ml-2 text-foreground">{endpoint.details?.serverSignature || 'Non détecté'}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">Forward Secrecy:</span>
                            <span className="ml-2 text-foreground">{getForwardSecrecyText(endpoint.details?.forwardSecrecy || 0)}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">ALPN:</span>
                            <span className="ml-2 text-foreground">{endpoint.details?.alpnProtocols || 'Non supporté'}</span>
                          </div>
                          <div>
                            <span className="text-foreground/70">OCSP Stapling:</span>
                            <span className={`ml-2 ${endpoint.details?.ocspStapling ? 'text-green-400' : 'text-red-400'}`}>
                              {endpoint.details?.ocspStapling ? 'Activé' : 'Désactivé'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground/70">SNI Requis:</span>
                            <span className={`ml-2 ${endpoint.details?.sniRequired ? 'text-yellow-400' : 'text-green-400'}`}>
                              {endpoint.details?.sniRequired ? 'Oui' : 'Non'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foreground/70">Session Tickets:</span>
                            <span className={`ml-2 ${endpoint.details?.sessionTickets ? 'text-green-400' : 'text-red-400'}`}>
                              {endpoint.details?.sessionTickets ? 'Supporté' : 'Non supporté'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certificats */}
                {activeTab === 'certificates' && (
                  <div className="space-y-4">
                    {result.certs.map((cert, index) => (
                      <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-foreground">{cert.subject}</h4>
                          <div className="flex items-center gap-2">
                            {cert.sct && (
                              <span className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs">
                                SCT
                              </span>
                            )}
                            {cert.mustStaple && (
                              <span className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs">
                                Must-Staple
                              </span>
                            )}
                            {cert.issues > 0 && (
                              <span className="px-2 py-1 bg-red-400/20 text-red-400 rounded text-xs">
                                {cert.issues} problème(s)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FiUser className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium text-foreground/70">Émetteur</span>
                            </div>
                            <p className="text-sm text-foreground bg-surface/30 rounded px-3 py-2">
                              {cert.issuerSubject}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-foreground/70">Valide depuis</span>
                            </div>
                            <p className="text-sm text-foreground bg-surface/30 rounded px-3 py-2">
                              {formatDate(cert.notBefore)}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FiCalendar className={`w-4 h-4 ${isExpiringSoon(cert.notAfter) ? 'text-red-400' : 'text-blue-400'}`} />
                              <span className="text-sm font-medium text-foreground/70">Expire le</span>
                            </div>
                            <p className={`text-sm bg-surface/30 rounded px-3 py-2 ${isExpiringSoon(cert.notAfter) ? 'text-red-400' : 'text-foreground'}`}>
                              {formatDate(cert.notAfter)}
                              {isExpiringSoon(cert.notAfter) && (
                                <span className="ml-2 text-xs">(Expire bientôt!)</span>
                              )}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FiKey className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium text-foreground/70">Clé</span>
                            </div>
                            <p className="text-sm text-foreground bg-surface/30 rounded px-3 py-2">
                              {cert.keyAlg} {cert.keySize} bits
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FiShield className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium text-foreground/70">Signature</span>
                            </div>
                            <p className="text-sm text-foreground bg-surface/30 rounded px-3 py-2">
                              {cert.sigAlg}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FiActivity className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium text-foreground/70">Révocation</span>
                            </div>
                            <p className="text-sm text-foreground bg-surface/30 rounded px-3 py-2">
                              {getRevocationStatusText(cert.revocationStatus)}
                            </p>
                          </div>
                        </div>

                        {/* Domaines */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-foreground/70 mb-2">Domaines couverts</h5>
                          <div className="flex flex-wrap gap-2">
                            {(cert.altNames.length > 0 ? cert.altNames : cert.commonNames).map((domain, idx) => (
                              <span key={idx} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                                {domain}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Empreintes */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-foreground/70">Empreintes</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-foreground/50 min-w-[60px]">SHA-1:</span>
                              <p className="font-mono text-xs text-foreground bg-surface/30 rounded px-2 py-1 break-all flex-1">
                                {cert.sha1Hash}
                              </p>
                              <button
                                onClick={() => copyToClipboard(cert.sha1Hash)}
                                className="p-1 hover:bg-surface/50 rounded"
                              >
                                <FiCopy className="w-3 h-3 text-foreground/50" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-foreground/50 min-w-[60px]">SHA-256:</span>
                              <p className="font-mono text-xs text-foreground bg-surface/30 rounded px-2 py-1 break-all flex-1">
                                {cert.sha256Hash}
                              </p>
                              <button
                                onClick={() => copyToClipboard(cert.sha256Hash)}
                                className="p-1 hover:bg-surface/50 rounded"
                              >
                                <FiCopy className="w-3 h-3 text-foreground/50" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Protocoles et Suites de chiffrement */}
                {activeTab === 'protocols' && result.endpoints[0]?.details && (
                  <div className="space-y-6">
                    {/* Protocoles supportés */}
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FiWifi className="w-5 h-5 text-accent" />
                        Protocoles supportés
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.endpoints[0].details.protocols?.map((protocol, index) => (
                          <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{protocol.name} {protocol.version}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                protocol.version === '1.3' ? 'bg-green-400/20 text-green-400' :
                                protocol.version === '1.2' ? 'bg-blue-400/20 text-blue-400' :
                                'bg-yellow-400/20 text-yellow-400'
                              }`}>
                                {protocol.version === '1.3' ? 'Moderne' : 
                                 protocol.version === '1.2' ? 'Sécurisé' : 'Déprécié'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suites de chiffrement */}
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FiLock className="w-5 h-5 text-accent" />
                        Suites de chiffrement
                      </h4>
                      <div className="space-y-4">
                        {result.endpoints[0].details.suites?.map((suite, index) => (
                          <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-foreground">
                                {suite.protocol === 772 ? 'TLS 1.3' : 
                                 suite.protocol === 771 ? 'TLS 1.2' : 
                                 suite.protocol === 770 ? 'TLS 1.1' : 'TLS 1.0'}
                              </h5>
                              <span className="text-sm text-foreground/70">
                                {suite.list?.length || 0} suites
                              </span>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {suite.list?.slice(0, 10).map((cipher, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="font-mono text-foreground/80">{cipher.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      cipher.cipherStrength >= 256 ? 'bg-green-400/20 text-green-400' :
                                      cipher.cipherStrength >= 128 ? 'bg-blue-400/20 text-blue-400' :
                                      'bg-yellow-400/20 text-yellow-400'
                                    }`}>
                                      {cipher.cipherStrength} bits
                                    </span>
                                    <span className="text-foreground/50">{cipher.kxType}</span>
                                  </div>
                                </div>
                              ))}
                              {suite.list && suite.list.length > 10 && (
                                <div className="text-center text-sm text-foreground/50 pt-2">
                                  ... et {suite.list.length - 10} autres
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Vulnérabilités */}
                {activeTab === 'vulnerabilities' && result.endpoints[0]?.details && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FiShield className="w-5 h-5 text-accent" />
                      Tests de vulnérabilités
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'BEAST', value: result.endpoints[0].details.vulnBeast, description: 'Attaque contre les chiffrements CBC' },
                        { name: 'Heartbleed', value: result.endpoints[0].details.heartbleed, description: 'CVE-2014-0160 - Fuite mémoire OpenSSL' },
                        { name: 'POODLE (SSL)', value: result.endpoints[0].details.poodle, description: 'Attaque contre SSL 3.0' },
                        { name: 'POODLE (TLS)', value: result.endpoints[0].details.poodleTls === 1, description: 'Attaque POODLE sur TLS' },
                        { name: 'FREAK', value: result.endpoints[0].details.freak, description: 'Attaque contre les clés RSA faibles' },
                        { name: 'RC4', value: result.endpoints[0].details.supportsRc4, description: 'Support du chiffrement RC4 (déprécié)' },
                        { name: 'Fallback SCSV', value: !result.endpoints[0].details.fallbackScsv, description: 'Protection contre les attaques de downgrade' },
                        { name: 'Ticketbleed', value: result.endpoints[0].details.ticketbleed === 1, description: 'CVE-2016-9244 - Fuite via session tickets' }
                      ].map((vuln, index) => (
                        <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">{vuln.name}</span>
                            <div className="flex items-center gap-2">
                              {vuln.value ? (
                                <FiXCircle className="w-5 h-5 text-red-400" />
                              ) : (
                                <FiCheckCircle className="w-5 h-5 text-green-400" />
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${
                                vuln.value ? 'bg-red-400/20 text-red-400' : 'bg-green-400/20 text-green-400'
                              }`}>
                                {vuln.value ? 'Vulnérable' : 'Sécurisé'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/70">{vuln.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compatibilité */}
                {activeTab === 'compatibility' && result.endpoints[0]?.details?.sims && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FiMonitor className="w-5 h-5 text-accent" />
                      Compatibilité navigateurs
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.endpoints[0].details.sims.results.slice(0, 12).map((sim, index) => (
                        <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold text-foreground">{sim.client.name}</span>
                              {sim.client.platform && (
                                <span className="text-sm text-foreground/70 ml-2">({sim.client.platform})</span>
                              )}
                              <div className="text-sm text-foreground/70">Version {sim.client.version}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {sim.errorCode === 0 ? (
                                <FiCheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <FiXCircle className="w-5 h-5 text-red-400" />
                              )}
                              <span className={`px-2 py-1 rounded text-xs ${
                                sim.errorCode === 0 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                              }`}>
                                {sim.errorCode === 0 ? 'Compatible' : 'Incompatible'}
                              </span>
                            </div>
                          </div>
                          {sim.errorCode === 0 && sim.suiteName && (
                            <p className="text-xs text-foreground/70 font-mono">{sim.suiteName}</p>
                          )}
                          {sim.errorMessage && (
                            <p className="text-xs text-red-400 mt-1">{sim.errorMessage}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 