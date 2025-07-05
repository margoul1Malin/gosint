'use client'

import { useState } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import { 
  FiGlobe, 
  FiLoader, 
  FiAlertCircle, 
  FiServer,
  FiMail,
  FiLock,
  FiShield,
  FiCopy,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiActivity,
  FiMonitor,
  FiWifi,
  FiDatabase,
  FiKey,
  FiEye,
  FiTarget,
  FiMapPin
} from 'react-icons/fi'

interface DNSRecord {
  type: string
  name: string
  value: string | string[]
  ttl?: number
  priority?: number
  weight?: number
  port?: number
  target?: string
  class?: string
  flags?: number
  tag?: string
  regexp?: string
  replacement?: string
}

interface DNSAnalysisResult {
  domain: string
  timestamp: number
  records: DNSRecord[]
  summary: {
    totalRecords: number
    recordTypes: string[]
    hasIPv4: boolean
    hasIPv6: boolean
    hasMX: boolean
    hasTXT: boolean
    hasNS: boolean
    hasCNAME: boolean
    hasSOA: boolean
    hasSRV: boolean
    hasNAPTR: boolean
    nameservers: string[]
    mailServers: string[]
    ipv4Addresses: string[]
    ipv6Addresses: string[]
  }
  security: {
    spfRecord: string | null
    dmarcRecord: string | null
    dkimSelectors: string[]
    hasCAA: boolean
    caaRecords: string[]
    dnssecEnabled: boolean
  }
  performance: {
    responseTime: number
    errors: string[]
    warnings: string[]
  }
  geolocation?: {
    country?: string
    region?: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

export default function DomainAnalysisPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DNSAnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Veuillez entrer un nom de domaine')
      return
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.?[a-zA-Z]{2,}$/
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    
    if (!domainRegex.test(cleanDomain)) {
      setError('Veuillez entrer un nom de domaine valide (ex: example.com)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setActiveTab('overview')

    try {
      const response = await fetch('/api/tools/domain-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: cleanDomain })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
      } else {
        setError(data.error || 'Erreur lors de l\'analyse DNS')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'text-blue-400 bg-blue-400/20 border-blue-400'
      case 'AAAA': return 'text-purple-400 bg-purple-400/20 border-purple-400'
      case 'MX': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'TXT': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400'
      case 'NS': return 'text-orange-400 bg-orange-400/20 border-orange-400'
      case 'CNAME': return 'text-cyan-400 bg-cyan-400/20 border-cyan-400'
      case 'SOA': return 'text-red-400 bg-red-400/20 border-red-400'
      case 'SRV': return 'text-pink-400 bg-pink-400/20 border-pink-400'
      case 'CAA': return 'text-indigo-400 bg-indigo-400/20 border-indigo-400'
      case 'DKIM': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400'
      case 'DMARC': return 'text-teal-400 bg-teal-400/20 border-teal-400'
      case 'PTR': return 'text-lime-400 bg-lime-400/20 border-lime-400'
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400'
    }
  }

  const getSecurityScore = (security: DNSAnalysisResult['security']) => {
    let score = 0
    if (security.spfRecord) score += 25
    if (security.dmarcRecord) score += 25
    if (security.dkimSelectors.length > 0) score += 25
    if (security.hasCAA) score += 25
    return score
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    if (score >= 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: FiGlobe },
    { id: 'records', label: 'Enregistrements', icon: FiDatabase },
    { id: 'security', label: 'Sécurité', icon: FiShield },
    { id: 'performance', label: 'Performance', icon: FiActivity },
    { id: 'infrastructure', label: 'Infrastructure', icon: FiServer }
  ]

  return (
    <ToolsLayout
      title="Analyse DNS"
      description="Analyse complète des enregistrements DNS d'un domaine"
      icon={<FiGlobe className="w-12 h-12 text-accent" />}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section d'information */}
        <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-accent">À propos de l'analyse DNS</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed">
            Cet outil effectue une analyse complète des enregistrements DNS d'un domaine. 
            Il récupère tous les types d'enregistrements (A, AAAA, MX, TXT, NS, CNAME, SOA, SRV, CAA),
            analyse la sécurité email (SPF, DKIM, DMARC), vérifie les certificats SSL et évalue la performance DNS.
          </p>
        </div>

        {/* Formulaire d'analyse */}
        <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
            <FiGlobe className="w-6 h-6" />
            Analyse DNS
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-foreground/70 mb-2">
                Nom de domaine
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
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
                  Analyse en cours...
                </>
              ) : (
                <>
                  <FiGlobe className="w-5 h-5" />
                  Analyser
                </>
              )}
            </button>
          </form>

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
                  {result.domain}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-foreground/50" />
                    <span className="text-sm text-foreground/50">
                      {result.performance.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDatabase className="w-4 h-4 text-foreground/50" />
                    <span className="text-sm text-foreground/50">
                      {formatDate(result.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDatabase className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Enregistrements</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{result.summary.totalRecords}</p>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiServer className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Serveurs DNS</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{result.summary.nameservers.length}</p>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiMail className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Serveurs Mail</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{result.summary.mailServers.length}</p>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Score Sécurité</span>
                  </div>
                  <p className={`text-2xl font-bold ${getSecurityScoreColor(getSecurityScore(result.security))}`}>
                    {getSecurityScore(result.security)}%
                  </p>
                </div>
              </div>

              {/* Alertes */}
              {result.performance.warnings.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-yellow-400">Avertissements</span>
                  </div>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    {result.performance.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.performance.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FiXCircle className="w-5 h-5 text-red-400" />
                    <span className="font-medium text-red-400">Erreurs</span>
                  </div>
                  <ul className="text-sm text-red-300 space-y-1">
                    {result.performance.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                    {/* Types d'enregistrements */}
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">Types d'enregistrements trouvés</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.summary.recordTypes.map((type, index) => (
                          <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium border ${getRecordTypeColor(type)}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Adresses IP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <FiWifi className="w-5 h-5 text-blue-400" />
                          Adresses IPv4
                        </h4>
                        <div className="space-y-2">
                          {result.summary.ipv4Addresses.length > 0 ? (
                            result.summary.ipv4Addresses.map((ip, index) => (
                              <div key={index} className="flex items-center justify-between bg-surface/30 rounded-lg p-3">
                                <span className="font-mono text-foreground">{ip}</span>
                                <button
                                  onClick={() => copyToClipboard(ip)}
                                  className="p-1 hover:bg-surface/50 rounded"
                                >
                                  <FiCopy className="w-4 h-4 text-foreground/50" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-foreground/50">Aucune adresse IPv4 trouvée</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <FiWifi className="w-5 h-5 text-purple-400" />
                          Adresses IPv6
                        </h4>
                        <div className="space-y-2">
                          {result.summary.ipv6Addresses.length > 0 ? (
                            result.summary.ipv6Addresses.map((ip, index) => (
                              <div key={index} className="flex items-center justify-between bg-surface/30 rounded-lg p-3">
                                <span className="font-mono text-foreground text-sm">{ip}</span>
                                <button
                                  onClick={() => copyToClipboard(ip)}
                                  className="p-1 hover:bg-surface/50 rounded"
                                >
                                  <FiCopy className="w-4 h-4 text-foreground/50" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-foreground/50">Aucune adresse IPv6 trouvée</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Serveurs de noms */}
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FiServer className="w-5 h-5 text-orange-400" />
                        Serveurs de noms
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.summary.nameservers.map((ns, index) => (
                          <div key={index} className="bg-surface/30 rounded-lg p-3">
                            <span className="font-mono text-foreground">{ns}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Serveurs mail */}
                    {result.summary.mailServers.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <FiMail className="w-5 h-5 text-green-400" />
                          Serveurs mail
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.summary.mailServers.map((mx, index) => (
                            <div key={index} className="bg-surface/30 rounded-lg p-3">
                              <span className="font-mono text-foreground">{mx}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enregistrements détaillés */}
                {activeTab === 'records' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Tous les enregistrements DNS</h4>
                    <div className="space-y-3">
                      {result.records.map((record, index) => (
                        <div key={index} className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${getRecordTypeColor(record.type)}`}>
                                {record.type}
                              </span>
                              <span className="font-mono text-foreground/70 text-sm">{record.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {record.ttl && (
                                <span className="text-xs text-foreground/50">TTL: {record.ttl}s</span>
                              )}
                              <button
                                onClick={() => copyToClipboard(Array.isArray(record.value) ? record.value.join(' ') : record.value)}
                                className="p-1 hover:bg-surface/50 rounded"
                              >
                                <FiCopy className="w-3 h-3 text-foreground/50" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-sm text-foreground/70 min-w-[60px]">Valeur:</span>
                              <span className="font-mono text-sm text-foreground break-all">
                                {Array.isArray(record.value) ? record.value.join(' ') : record.value}
                              </span>
                            </div>
                            
                            {record.priority && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground/70 min-w-[60px]">Priorité:</span>
                                <span className="text-sm text-foreground">{record.priority}</span>
                              </div>
                            )}
                            
                            {record.weight && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground/70 min-w-[60px]">Poids:</span>
                                <span className="text-sm text-foreground">{record.weight}</span>
                              </div>
                            )}
                            
                            {record.port && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground/70 min-w-[60px]">Port:</span>
                                <span className="text-sm text-foreground">{record.port}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sécurité */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-foreground">Analyse de sécurité</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground/70">Score global:</span>
                        <span className={`text-lg font-bold ${getSecurityScoreColor(getSecurityScore(result.security))}`}>
                          {getSecurityScore(result.security)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* SPF */}
                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-foreground flex items-center gap-2">
                            <FiShield className="w-4 h-4" />
                            SPF (Sender Policy Framework)
                          </h5>
                          {result.security.spfRecord ? (
                            <FiCheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <FiXCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        {result.security.spfRecord ? (
                          <p className="text-sm text-foreground font-mono bg-surface/30 rounded px-3 py-2 break-all">
                            {result.security.spfRecord}
                          </p>
                        ) : (
                          <p className="text-sm text-red-400">Aucun enregistrement SPF trouvé</p>
                        )}
                      </div>

                      {/* DMARC */}
                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-foreground flex items-center gap-2">
                            <FiLock className="w-4 h-4" />
                            DMARC
                          </h5>
                          {result.security.dmarcRecord ? (
                            <FiCheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <FiXCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        {result.security.dmarcRecord ? (
                          <p className="text-sm text-foreground font-mono bg-surface/30 rounded px-3 py-2 break-all">
                            {result.security.dmarcRecord}
                          </p>
                        ) : (
                          <p className="text-sm text-red-400">Aucun enregistrement DMARC trouvé</p>
                        )}
                      </div>

                      {/* DKIM */}
                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-foreground flex items-center gap-2">
                            <FiKey className="w-4 h-4" />
                            DKIM
                          </h5>
                          {result.security.dkimSelectors.length > 0 ? (
                            <FiCheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <FiXCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        {result.security.dkimSelectors.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-green-400">
                              {result.security.dkimSelectors.length} sélecteur(s) DKIM trouvé(s)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.security.dkimSelectors.map((selector, index) => (
                                <span key={index} className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs">
                                  {selector}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-red-400">Aucun sélecteur DKIM trouvé</p>
                        )}
                      </div>

                      {/* CAA */}
                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-foreground flex items-center gap-2">
                            <FiMonitor className="w-4 h-4" />
                            CAA (Certificate Authority Authorization)
                          </h5>
                          {result.security.hasCAA ? (
                            <FiCheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <FiXCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        {result.security.hasCAA ? (
                          <div className="space-y-2">
                            <p className="text-sm text-green-400">
                              {result.security.caaRecords.length} enregistrement(s) CAA trouvé(s)
                            </p>
                            <div className="space-y-1">
                              {result.security.caaRecords.map((caa, index) => (
                                <p key={index} className="text-sm text-foreground font-mono bg-surface/30 rounded px-3 py-1">
                                  {caa}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-red-400">Aucun enregistrement CAA trouvé</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance */}
                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-foreground">Analyse de performance</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiClock className="w-5 h-5 text-accent" />
                          <span className="text-sm font-medium text-foreground/70">Temps de réponse</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{result.performance.responseTime}ms</p>
                      </div>

                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-foreground/70">Requêtes réussies</span>
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                          {result.summary.recordTypes.length}
                        </p>
                      </div>

                      <div className="bg-surface/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiXCircle className="w-5 h-5 text-red-400" />
                          <span className="text-sm font-medium text-foreground/70">Erreurs</span>
                        </div>
                        <p className="text-2xl font-bold text-red-400">
                          {result.performance.errors.length}
                        </p>
                      </div>
                    </div>

                    {result.performance.errors.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-foreground mb-3">Détails des erreurs</h5>
                        <div className="space-y-2">
                          {result.performance.errors.map((error, index) => (
                            <div key={index} className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                              <p className="text-sm text-red-300">{error}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Infrastructure */}
                {activeTab === 'infrastructure' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-foreground">Infrastructure DNS</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FiServer className="w-5 h-5 text-orange-400" />
                          Serveurs de noms autoritaires
                        </h5>
                        <div className="space-y-2">
                          {result.summary.nameservers.map((ns, index) => (
                            <div key={index} className="bg-surface/30 rounded-lg p-3">
                              <span className="font-mono text-foreground">{ns}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <FiTarget className="w-5 h-5 text-blue-400" />
                          Résolution des adresses
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-foreground/70">IPv4:</span>
                            <div className="mt-1 space-y-1">
                              {result.summary.ipv4Addresses.map((ip, index) => (
                                <div key={index} className="bg-surface/30 rounded px-3 py-1">
                                  <span className="font-mono text-sm text-foreground">{ip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {result.summary.ipv6Addresses.length > 0 && (
                            <div>
                              <span className="text-sm text-foreground/70">IPv6:</span>
                              <div className="mt-1 space-y-1">
                                {result.summary.ipv6Addresses.map((ip, index) => (
                                  <div key={index} className="bg-surface/30 rounded px-3 py-1">
                                    <span className="font-mono text-xs text-foreground">{ip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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