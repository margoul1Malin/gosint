'use client'

import { useState, useEffect } from 'react'
import { FiLink, FiLoader, FiAlertCircle, FiArrowRight, FiCopy, FiExternalLink, FiClock, FiShield, FiGlobe } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'

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

interface ToolInfo {
  name: string
  description: string
  icon: string
}

export default function URLUnshortenerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UnshortenerResult | null>(null)
  const [error, setError] = useState('')
  const [toolInfo, setToolInfo] = useState<ToolInfo>({
    name: 'URL Unshortener & Redirect Mapper',
    description: 'Tracez les redirections d\'URL et découvrez les destinations finales',
    icon: 'FiLink'
  })

  useEffect(() => {
    const fetchToolInfo = async () => {
      try {
        const response = await fetch('/api/admin/tools?search=url-unshortener-redirect-mapper&limit=1')
        if (response.ok) {
          const data = await response.json()
          if (data.tools && data.tools.length > 0) {
            const tool = data.tools[0]
            setToolInfo({
              name: tool.name,
              description: tool.description,
              icon: tool.icon
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l\'outil:', error)
      }
    }

    fetchToolInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Veuillez entrer une URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/url-unshortener-redirect-mapper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur lors du traçage')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode === 0) return 'text-red-400 bg-red-500/20'
    if (statusCode >= 200 && statusCode < 300) return 'text-green-400 bg-green-500/20'
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-400 bg-yellow-500/20'
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-400 bg-orange-500/20'
    if (statusCode >= 500) return 'text-red-400 bg-red-500/20'
    return 'text-gray-400 bg-gray-500/20'
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return 'Invalid URL'
    }
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

      return (
      <ToolsLayout
        title={toolInfo.name}
        description={toolInfo.description}
        icon={<DynamicIcon iconName={toolInfo.icon} size={48} className="text-blue-400" />}
      >
      <div className="max-w-6xl mx-auto">
        {/* Formulaire */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                URL à analyser
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://bit.ly/example ou tinyurl.com/example"
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Traçage...
                    </>
                  ) : (
                    <>
                      <FiLink className="w-4 h-4" />
                      Tracer
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Résultats */}
        {result && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Résumé du traçage</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{result.totalRedirects}</div>
                  <div className="text-sm text-gray-400">Redirections</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{result.analysis.domains.length}</div>
                  <div className="text-sm text-gray-400">Domaines</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">{formatTime(result.totalTime)}</div>
                  <div className="text-sm text-gray-400">Temps total</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{result.analysis.statusCodes.length}</div>
                  <div className="text-sm text-gray-400">Codes statut</div>
                </div>
              </div>
            </div>

            {/* URL Finale */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Destination finale</h3>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">URL finale :</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(result.finalUrl)}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Copier"
                    >
                      <FiCopy className="w-4 h-4 text-gray-400" />
                    </button>
                    <a
                      href={result.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Ouvrir"
                    >
                      <FiExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>
                <div className="text-white font-mono text-sm break-all">{result.finalUrl}</div>
                <div className="text-xs text-gray-500 mt-1">Domaine: {getDomainFromUrl(result.finalUrl)}</div>
              </div>
            </div>

            {/* Chaîne de redirections */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Chaîne de redirections</h3>
              <div className="space-y-4">
                {result.redirectChain.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                            {step.step}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(step.statusCode)}`}>
                            {step.statusCode || 'ERROR'}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {formatTime(step.responseTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(step.url)}
                            className="p-1 hover:bg-gray-600 rounded"
                            title="Copier"
                          >
                            <FiCopy className="w-4 h-4 text-gray-400" />
                          </button>
                          <a
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-600 rounded"
                            title="Ouvrir"
                          >
                            <FiExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="text-white font-mono text-sm break-all mb-2">{step.url}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        <FiGlobe className="w-3 h-3 inline mr-1" />
                        {getDomainFromUrl(step.url)}
                      </div>
                      
                      {step.headers.location && (
                        <div className="text-xs text-gray-400">
                          <span className="font-medium">Redirection vers:</span> {step.headers.location}
                        </div>
                      )}
                      
                      {step.headers.error && (
                        <div className="text-xs text-red-400">
                          <span className="font-medium">Erreur:</span> {step.headers.error}
                        </div>
                      )}
                    </div>
                    
                    {index < result.redirectChain.length - 1 && (
                      <div className="flex justify-center my-2">
                        <FiArrowRight className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Analyse de sécurité */}
            {result.analysis.suspiciousRedirects.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-yellow-400" />
                  Alertes de sécurité
                </h3>
                <div className="space-y-3">
                  {result.analysis.suspiciousRedirects.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <FiAlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations techniques */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Informations techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Domaines traversés</h4>
                  <div className="space-y-1">
                    {result.analysis.domains.map((domain, index) => (
                      <div key={index} className="text-sm text-gray-300">{domain}</div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Protocoles</h4>
                  <div className="space-y-1">
                    {result.analysis.protocols.map((protocol, index) => (
                      <div key={index} className="text-sm text-gray-300">{protocol}</div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2">Codes de statut</h4>
                  <div className="space-y-1">
                    {result.analysis.statusCodes.map((code, index) => (
                      <div key={index} className={`text-sm px-2 py-1 rounded ${getStatusColor(code)}`}>
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>URL analysée: {result.originalUrl}</span>
                <span>Analysé le: {new Date(result.timestamp).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 