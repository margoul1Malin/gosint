'use client'

import { useState } from 'react'
import { FiShield, FiLoader, FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo, FiCopy } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'

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

export default function CSPHeaderAnalysisPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CSPHeaderResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!target.trim()) {
      setError('Veuillez entrer une URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/csp-header-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: target.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur lors de l\'analyse')
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20'
    if (score >= 60) return 'bg-yellow-500/20'
    if (score >= 40) return 'bg-orange-500/20'
    return 'bg-red-500/20'
  }

  return (
    <ToolsLayout
      title="Analyse des Headers CSP"
      description="Analysez les headers de sécurité HTTP et CSP (Content Security Policy) d'un site web"
      icon={<FiShield className="w-12 h-12 text-blue-400" />}
    >
      <div className="max-w-4xl mx-auto">
        {/* Formulaire */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-300 mb-2">
                URL du site à analyser
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="exemple.com ou https://exemple.com"
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !target.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <FiShield className="w-4 h-4" />
                      Analyser
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
            {/* Score de sécurité */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Score de Sécurité</h3>
                <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(result.analysis.securityScore)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(result.analysis.securityScore)}`}>
                    {result.analysis.securityScore}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  {result.analysis.hasCSP ? (
                    <FiCheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">CSP</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.analysis.hasXFrameOptions ? (
                    <FiCheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">X-Frame-Options</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.analysis.hasHSTS ? (
                    <FiCheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">HSTS</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.analysis.hasXContentTypeOptions ? (
                    <FiCheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-gray-300">X-Content-Type</span>
                </div>
              </div>
            </div>

            {/* Headers de sécurité */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Headers de Sécurité</h3>
              <div className="space-y-3">
                {Object.entries(result.cspHeaders).map(([key, value]) => (
                  value && (
                    <div key={key} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-400">{key}</span>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 hover:bg-gray-600 rounded"
                          title="Copier"
                        >
                          <FiCopy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <code className="text-sm text-gray-300 break-all">{value}</code>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Recommandations */}
            {result.analysis.recommendations.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FiInfo className="w-5 h-5 text-yellow-400" />
                  Recommandations
                </h3>
                <div className="space-y-3">
                  {result.analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <FiAlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tous les headers */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Tous les Headers HTTP</h3>
              <div className="bg-gray-900/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-300">
                  {Object.entries(result.headers).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="text-blue-400">{key}:</span> {value}
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>URL analysée: {result.url}</span>
                <span>Analysé le: {new Date(result.timestamp).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 