'use client'

import { useState } from 'react'
import { FiCode, FiLoader, FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiCopy, FiExternalLink, FiShield, FiTarget, FiDatabase } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'

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

export default function JSEndpointExtractorPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JSEndpointResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'files' | 'recommendations'>('files')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!target.trim()) {
      setError('Veuillez entrer un domaine')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/js-endpoint-extractor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: target.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setActiveTab('files')
      } else {
        setError(data.error || 'Erreur lors de l\'extraction')
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <FiAlertCircle className="w-4 h-4" />
      case 'medium': return <FiInfo className="w-4 h-4" />
      case 'low': return <FiCheckCircle className="w-4 h-4" />
      default: return <FiInfo className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return <FiDatabase className="w-4 h-4 text-blue-400" />
      case 'endpoint': return <FiTarget className="w-4 h-4 text-purple-400" />
      case 'path': return <FiCode className="w-4 h-4 text-green-400" />
      case 'resource': return <FiExternalLink className="w-4 h-4 text-orange-400" />
      default: return <FiCode className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <ToolsLayout
      title="Extracteur d'Endpoints JavaScript"
      description="Scanner les fichiers JavaScript d'un site web pour extraire les endpoints API, URLs et chemins sensibles"
      icon={<FiCode className="w-12 h-12 text-yellow-400" />}
    >
      <div className="max-w-6xl mx-auto">
        {/* Formulaire */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-2">
                Domaine cible
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="exemple.com"
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !target.trim()}
                  className="px-6 py-3 bg-yellow-600 text-black rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center font-medium"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Extraction...
                    </>
                  ) : (
                    <>
                      <FiCode className="w-4 h-4" />
                      Extraire
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
            {/* Statistiques */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">{result.statistics.totalJsFiles}</div>
                  <div className="text-sm text-gray-400">Fichiers JS</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{result.statistics.totalEndpoints}</div>
                  <div className="text-sm text-gray-400">Endpoints</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{result.statistics.apiEndpoints}</div>
                  <div className="text-sm text-gray-400">APIs</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">{result.statistics.sensitiveEndpoints}</div>
                  <div className="text-sm text-gray-400">Sensibles</div>
                </div>
              </div>
              
              {/* Distribution des risques */}
              <div className="mt-4">
                <h4 className="text-lg font-medium text-white mb-2">Distribution des risques</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Élevé ({result.statistics.riskDistribution.high})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Moyen ({result.statistics.riskDistribution.medium})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Faible ({result.statistics.riskDistribution.low})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
              <div className="flex border-b border-gray-700/50">
                {[
                  { id: 'files', label: 'Fichiers JS', icon: FiCode },
                  { id: 'recommendations', label: 'Recommandations', icon: FiInfo }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-yellow-400 border-b-2 border-yellow-400'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'files' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Fichiers JavaScript trouvés</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {result.jsFiles.map((file, index) => (
                        <div key={index} className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiCode className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-300 truncate">{file}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(file)}
                              className="p-1 hover:bg-gray-600 rounded"
                              title="Copier"
                            >
                              <FiCopy className="w-4 h-4 text-gray-400" />
                            </button>
                            <a
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-600 rounded"
                              title="Ouvrir"
                            >
                              <FiExternalLink className="w-4 h-4 text-gray-400" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Recommandations de sécurité</h4>
                    <div className="space-y-3">
                      {result.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <FiInfo className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Domaine analysé: {result.target}</span>
                <span>Analysé le: {new Date(result.timestamp).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 