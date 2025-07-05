'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, Code, Database, Shield, Zap, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react'
import ToolsLayout from '@/app/components/ToolsLayout'

interface Technology {
  name: string
  category: string
  version?: string
  confidence: number
  description: string
  website?: string
  icon?: string
}

interface TechAnalysisResult {
  url: string
  timestamp: number
  technologies: Technology[]
  categories: { [key: string]: Technology[] }
  summary: {
    totalTechnologies: number
    categoriesFound: number
    riskLevel: 'low' | 'medium' | 'high'
    securityIssues: string[]
  }
  performance: {
    loadTime: number
    pageSize: number
    requests: number
  }
  metadata: {
    title: string
    description: string
    generator?: string
    viewport?: string
  }
}

const categoryIcons: { [key: string]: any } = {
  'CMS': Database,
  'Framework': Code,
  'JavaScript': Code,
  'Analytics': Zap,
  'Security': Shield,
  'CDN': Globe,
  'Server': Database,
  'E-commerce': Database,
  'Marketing': Zap,
  'Font': Code,
  'Widget': Code,
  'Other': Info
}

const categoryColors: { [key: string]: string } = {
  'CMS': 'text-purple-400',
  'Framework': 'text-blue-400',
  'JavaScript': 'text-yellow-400',
  'Analytics': 'text-green-400',
  'Security': 'text-red-400',
  'CDN': 'text-cyan-400',
  'Server': 'text-orange-400',
  'E-commerce': 'text-pink-400',
  'Marketing': 'text-indigo-400',
  'Font': 'text-gray-400',
  'Widget': 'text-teal-400',
  'Other': 'text-gray-400'
}

export default function WebTechnologiesPage() {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<TechAnalysisResult | null>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL valide')
      return
    }

    if (!url.match(/^https?:\/\//)) {
      setError('L\'URL doit commencer par http:// ou https://')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/web-technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'analyse')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse des technologies')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400'
    if (confidence >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <ToolsLayout
      title="Détection de Technologies Web"
      description="Analysez les technologies utilisées par un site web (CMS, frameworks, bibliothèques, etc.)"
      icon={<Globe className="w-12 h-12 text-accent" />}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section d'information */}
        <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-accent">À propos de la détection de technologies</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed">
            Cet outil analyse un site web pour détecter les technologies utilisées : CMS, frameworks JavaScript, 
            bibliothèques, services d'analytics, CDN, serveurs web et plus encore. Il utilise Puppeteer pour 
            une analyse approfondie des signatures technologiques et évalue également la sécurité du site.
          </p>
        </div>

        {/* Formulaire d'analyse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-background/50 border border-secondary/30 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:border-accent"
                disabled={isAnalyzing}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-gradient-to-r from-accent to-secondary hover:from-accent/80 hover:to-secondary/80 disabled:from-surface disabled:to-surface rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Analyser</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Résultats */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Résumé */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>Résumé de l'analyse</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-background/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">{result.summary.totalTechnologies}</div>
                  <div className="text-foreground/70">Technologies détectées</div>
                </div>
                <div className="bg-background/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary">{result.summary.categoriesFound}</div>
                  <div className="text-foreground/70">Catégories</div>
                </div>
                <div className="bg-background/30 rounded-lg p-4">
                  <div className={`text-2xl font-bold ${getRiskColor(result.summary.riskLevel)}`}>
                    {result.summary.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-foreground/70">Niveau de risque</div>
                </div>
                <div className="bg-background/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{result.performance.loadTime}ms</div>
                  <div className="text-foreground/70">Temps de chargement</div>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="bg-background/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Métadonnées du site</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-foreground/70">Titre:</span> {result.metadata.title}</div>
                  <div><span className="text-foreground/70">Description:</span> {result.metadata.description}</div>
                  {result.metadata.generator && (
                    <div><span className="text-foreground/70">Générateur:</span> {result.metadata.generator}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Technologies par catégorie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(result.categories).map(([category, technologies]) => {
                const IconComponent = categoryIcons[category] || Info
                const colorClass = categoryColors[category] || 'text-foreground/70'
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <IconComponent className={`h-5 w-5 ${colorClass}`} />
                      <span>{category}</span>
                      <span className="text-sm text-foreground/50">({technologies.length})</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {technologies.map((tech, index) => (
                        <div key={index} className="bg-background/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{tech.name}</h4>
                            <div className="flex items-center space-x-2">
                              {tech.version && (
                                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                                  v{tech.version}
                                </span>
                              )}
                              <span className={`text-xs font-semibold ${getConfidenceColor(tech.confidence)}`}>
                                {tech.confidence}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/70 mb-2">{tech.description}</p>
                          {tech.website && (
                            <a
                              href={tech.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-accent hover:text-accent/80 transition-colors"
                            >
                              {tech.website}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Problèmes de sécurité */}
            {result.summary.securityIssues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500/20 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-400" />
                  <span>Problèmes de sécurité détectés</span>
                </h3>
                <ul className="space-y-2">
                  {result.summary.securityIssues.map((issue, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-300">{issue}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span>Performance</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{result.performance.loadTime}ms</div>
                  <div className="text-foreground/70">Temps de chargement</div>
                </div>
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-secondary">{Math.round(result.performance.pageSize / 1024)}KB</div>
                  <div className="text-foreground/70">Taille de la page</div>
                </div>
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent">{result.performance.requests}</div>
                  <div className="text-foreground/70">Requêtes</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </ToolsLayout>
  )
} 