'use client'

import { useState, useEffect } from 'react'
import { FiType, FiLoader, FiAlertCircle, FiCheckCircle, FiInfo, FiGlobe, FiBarChart, FiFileText, FiClock, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'

interface LanguageDetectionResult {
  detectedLanguage: {
    code: string
    name: string
    nativeName?: string
    confidence: number
  }
  alternatives: Array<{
    code: string
    name: string
    nativeName?: string
    confidence: number
  }>
  textInfo: {
    length: number
    wordCount: number
    charCount: number
    sentences: number
  }
  analysis: {
    isReliable: boolean
    confidenceLevel: 'high' | 'medium' | 'low'
    recommendations: string[]
  }
  timestamp: string
}

interface ToolInfo {
  name: string
  description: string
  icon: string
}

export default function LanguageDetectorPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LanguageDetectionResult | null>(null)
  const [error, setError] = useState('')
  const [toolInfo, setToolInfo] = useState<ToolInfo>({
    name: 'Détecteur de Langue',
    description: 'Détectez automatiquement la langue d\'un texte',
    icon: 'FiType'
  })

  useEffect(() => {
    const fetchToolInfo = async () => {
      try {
        const response = await fetch('/api/admin/tools?search=lang-detector&limit=1')
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
    
    if (!text.trim()) {
      setError('Veuillez entrer un texte à analyser')
      return
    }

    const wordCount = text.trim().split(/\s+/).length
    if (wordCount > 300) {
      setError('Le texte ne peut pas dépasser 300 mots')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/lang-detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() })
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la détection de langue')
        return
      }

      setResult(data)

    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceBadge = (level: 'high' | 'medium' | 'low') => {
    const colors = {
      high: 'bg-green-400/20 text-green-400 border-green-400/30',
      medium: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
      low: 'bg-red-400/20 text-red-400 border-red-400/30'
    }
    
    const labels = {
      high: 'Élevée',
      medium: 'Moyenne',
      low: 'Faible'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[level]}`}>
        {labels[level]}
      </span>
    )
  }

  const currentWordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const isOverLimit = currentWordCount > 300

  return (
    <ToolsLayout
      title={toolInfo.name}
      description={toolInfo.description}
      icon={<DynamicIcon iconName={toolInfo.icon} size={48} className="text-cyan-400" />}
    >
      <div className="max-w-4xl mx-auto">
        {/* Formulaire */}
        <div className="bg-surface/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-cyan-400 mb-3">
                Texte à analyser
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 resize-none text-white placeholder-gray-400"
                placeholder="Collez votre texte ici pour détecter sa langue..."
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  Maximum 300 mots pour une détection optimale
                </p>
                <p className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
                  {currentWordCount}/300 mots
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !text.trim() || isOverLimit}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Détection en cours...
                </>
              ) : (
                <>
                  <FiType className="w-5 h-5" />
                  Détecter la langue
                </>
              )}
            </button>
          </form>
        </div>

        {/* Résultats */}
        {result && (
          <div className="space-y-6">
            {/* Langue détectée */}
            <div className="bg-surface/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <FiGlobe className="w-6 h-6" />
                Langue détectée
              </h3>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {result.detectedLanguage.name}
                    </h4>
                    {result.detectedLanguage.nativeName && (
                      <p className="text-gray-400 text-sm">
                        {result.detectedLanguage.nativeName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getConfidenceColor(result.detectedLanguage.confidence)}`}>
                      {result.detectedLanguage.confidence.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Code: {result.detectedLanguage.code}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Fiabilité:</span>
                    {getConfidenceBadge(result.analysis.confidenceLevel)}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.analysis.isReliable ? (
                      <FiCheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className={`text-sm ${result.analysis.isReliable ? 'text-green-400' : 'text-yellow-400'}`}>
                      {result.analysis.isReliable ? 'Fiable' : 'À vérifier'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <div className="bg-surface/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-6 h-6" />
                  Alternatives possibles
                </h3>
                
                <div className="space-y-3">
                  {result.alternatives.map((alt, index) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-medium">{alt.name}</span>
                          {alt.nativeName && (
                            <span className="text-gray-400 text-sm ml-2">
                              ({alt.nativeName})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getConfidenceColor(alt.confidence)}`}>
                            {alt.confidence.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {alt.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques du texte */}
            <div className="bg-surface/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <FiBarChart className="w-6 h-6" />
                Analyse du texte
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">
                    {result.textInfo.length}
                  </div>
                  <div className="text-sm text-gray-400">Caractères</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">
                    {result.textInfo.wordCount}
                  </div>
                  <div className="text-sm text-gray-400">Mots</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">
                    {result.textInfo.charCount}
                  </div>
                  <div className="text-sm text-gray-400">Sans espaces</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">
                    {result.textInfo.sentences}
                  </div>
                  <div className="text-sm text-gray-400">Phrases</div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            {result.analysis.recommendations.length > 0 && (
              <div className="bg-surface/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <FiInfo className="w-6 h-6" />
                  Recommandations
                </h3>
                
                <div className="space-y-2">
                  {result.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <FiAlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 