'use client'

import { useState } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import { 
  FiSearch, 
  FiLoader, 
  FiAlertCircle, 
  FiGlobe,
  FiCalendar,
  FiUser,
  FiServer,
  FiCopy,
  FiCheck,
  FiShield,
  FiInfo
} from 'react-icons/fi'

interface WhoisResult {
  domain: string
  registrar?: string
  registrant?: string
  creationDate?: string
  expirationDate?: string
  updateDate?: string
  nameServers?: string[]
  status?: string[]
  rawOutput: string
  error?: string
}

export default function WhoisLookupPage() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WhoisResult | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!domain.trim()) {
      setError('Veuillez entrer un nom de domaine')
      return
    }

    // Validation basique du domaine
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain.trim())) {
      setError('Veuillez entrer un nom de domaine valide (ex: example.com)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/whois-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
      } else {
        setError(data.error || 'Erreur lors de la recherche Whois')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (result?.rawOutput) {
      try {
        await navigator.clipboard.writeText(result.rawOutput)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Erreur lors de la copie:', err)
      }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString // Retourner la chaîne originale si le parsing échoue
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('active')) return 'text-green-400 bg-green-400/20'
    if (lowerStatus.includes('prohibited') || lowerStatus.includes('locked')) return 'text-red-400 bg-red-400/20'
    if (lowerStatus.includes('pending')) return 'text-yellow-400 bg-yellow-400/20'
    return 'text-accent bg-accent/20'
  }

  return (
    <ToolsLayout
      title="Whois Lookup"
      description="Recherche d'informations sur un nom de domaine"
      icon={<FiSearch className="w-12 h-12 text-accent" />}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Section d'information */}
        <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-accent">À propos de Whois</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed">
            Le service Whois permet d'obtenir des informations détaillées sur un nom de domaine, 
            incluant le registrar, les dates importantes, les serveurs DNS et le statut du domaine. 
            Ces informations sont essentielles pour l'analyse OSINT et la vérification de l'authenticité d'un site web.
          </p>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
            <FiSearch className="w-6 h-6" />
            Recherche Whois
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
                  Recherche en cours...
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5" />
                  Rechercher
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
            {/* Résumé du domaine */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-accent flex items-center gap-2">
                  <FiGlobe className="w-8 h-8" />
                  {result.domain}
                </h3>
                {result.status && result.status.length > 0 && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status[0])}`}>
                    {result.status[0]}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Registrar */}
                {result.registrar && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-accent" />
                      <span className="text-sm font-medium text-foreground/70">Registrar</span>
                    </div>
                    <p className="text-foreground bg-surface/30 rounded-lg px-4 py-3 font-medium">
                      {result.registrar}
                    </p>
                  </div>
                )}

                {/* Date de création */}
                {result.creationDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-foreground/70">Date de création</span>
                    </div>
                    <p className="text-foreground bg-surface/30 rounded-lg px-4 py-3">
                      {formatDate(result.creationDate)}
                    </p>
                  </div>
                )}

                {/* Date d'expiration */}
                {result.expirationDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium text-foreground/70">Date d'expiration</span>
                    </div>
                    <p className="text-foreground bg-surface/30 rounded-lg px-4 py-3">
                      {formatDate(result.expirationDate)}
                    </p>
                  </div>
                )}

                {/* Date de mise à jour */}
                {result.updateDate && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-foreground/70">Dernière mise à jour</span>
                    </div>
                    <p className="text-foreground bg-surface/30 rounded-lg px-4 py-3">
                      {formatDate(result.updateDate)}
                    </p>
                  </div>
                )}

                {/* Registrant */}
                {result.registrant && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-foreground/70">Registrant</span>
                    </div>
                    <p className="text-foreground bg-surface/30 rounded-lg px-4 py-3">
                      {result.registrant}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Serveurs de noms */}
            {result.nameServers && result.nameServers.length > 0 && (
              <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
                  <FiServer className="w-6 h-6" />
                  Serveurs de noms ({result.nameServers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.nameServers.map((ns, index) => (
                    <div key={index} className="bg-surface/30 rounded-lg px-4 py-3 font-mono text-sm border border-secondary/20">
                      {ns}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statut complet */}
            {result.status && result.status.length > 0 && (
              <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
                  <FiShield className="w-6 h-6" />
                  Statut du domaine ({result.status.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.status.map((status, index) => (
                    <div key={index} className={`px-4 py-3 rounded-lg text-sm font-medium ${getStatusColor(status)}`}>
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sortie brute */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-accent">Sortie brute complète</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 text-accent px-4 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
              <div className="bg-surface/30 rounded-lg p-4 border border-secondary/20">
                <pre className="text-sm text-foreground/80 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {result.rawOutput}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 