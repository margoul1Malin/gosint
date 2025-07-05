'use client'

import { useState } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import { 
  FiSearch, 
  FiLoader, 
  FiAlertCircle, 
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiShield,
  FiSmartphone,
  FiGlobe,
  FiImage,
  FiLink,
  FiFileText,
  FiCode,
  FiSettings,
  FiCopy,
  FiEye,
  FiClock,
  FiZap,
  FiTarget,
  FiAward,
  FiBarChart,
  FiMonitor,
  FiLock,
  FiShare2,
  FiInfo
} from 'react-icons/fi'

interface SEOAnalysisResult {
  url: string
  timestamp: number
  crawlStats: {
    totalPages: number
    crawledPages: number
    crawlTime: number
    errors: number
    warnings: number
  }
  siteAnalysis: {
    domain: string
    totalPages: number
    crawledPages: Array<{
      url: string
      title: string
      description: string
      statusCode: number
      loadTime: number
      wordCount: number
      headings: { [key: string]: string[] }
      images: { src: string; alt: string; title?: string }[]
      links: { url: string; text: string; type: 'internal' | 'external'; nofollow: boolean }[]
      metaRobots: string
      canonical: string | null
      hreflang: { [key: string]: string }
      jsonLd: any[]
      errors: string[]
      warnings: string[]
    }>
    siteStructure: {
      depth: number
      categories: string[]
      orphanPages: string[]
      brokenLinks: string[]
      redirectChain: { [key: string]: string[] }
    }
    technicalSEO: {
      robotsTxt: { exists: boolean; content: string; issues: string[] }
      sitemaps: { url: string; pages: number; errors: string[] }[]
      ssl: { valid: boolean; issuer: string; expiry: string }
      speed: { avgLoadTime: number; slowestPages: string[] }
      mobileFriendly: boolean
      coreWebVitals: { lcp: number; fid: number; cls: number }
    }
    contentAnalysis: {
      duplicateContent: { pages: string[]; similarity: number }[]
      duplicateTitles: { title: string; pages: string[] }[]
      duplicateDescriptions: { description: string; pages: string[] }[]
      missingTitles: string[]
      missingDescriptions: string[]
      thinContent: { page: string; wordCount: number }[]
      keywordDensity: { [keyword: string]: number }
      readabilityScore: number
    }
    onPageSEO: {
      titleOptimization: { good: number; needsWork: number; missing: number }
      metaDescriptions: { good: number; needsWork: number; missing: number }
      headingStructure: { good: number; needsWork: number; missing: number }
      imageOptimization: { optimized: number; missingAlt: number; oversized: number }
      internalLinking: { totalLinks: number; avgLinksPerPage: number; orphanPages: number }
    }
    offPageSEO: {
      backlinks: { total: number; domains: number; quality: 'high' | 'medium' | 'low' }
      socialSignals: { facebook: number; twitter: number; linkedin: number }
      domainAuthority: number
      pageAuthority: { [url: string]: number }
    }
    competitorAnalysis: {
      competitors: string[]
      keywordGaps: string[]
      contentGaps: string[]
      technicalAdvantages: string[]
    }
    recommendations: {
      critical: { issue: string; pages: string[]; priority: number; impact: string }[]
      important: { issue: string; pages: string[]; priority: number; impact: string }[]
      minor: { issue: string; pages: string[]; priority: number; impact: string }[]
    }
    seoScore: {
      overall: number
      technical: number
      content: number
      onPage: number
      offPage: number
      breakdown: { [category: string]: { score: number; maxScore: number } }
    }
  }
  pageAnalysis: {
    [url: string]: {
      performance: {
        loadTime: number
        pageSize: number
        requests: number
        coreWebVitals: { lcp: number; fid: number; cls: number }
      }
      seo: {
        title: { text: string; length: number; optimized: boolean }
        description: { text: string; length: number; optimized: boolean }
        headings: { structure: string; issues: string[] }
        content: { wordCount: number; readability: number; keywordDensity: { [key: string]: number } }
        images: { total: number; optimized: number; issues: string[] }
        links: { internal: number; external: number; broken: number }
      }
      technical: {
        statusCode: number
        canonical: string | null
        metaRobots: string
        structured: any[]
        hreflang: { [key: string]: string }
        mobileFriendly: boolean
      }
      issues: { type: 'error' | 'warning' | 'info'; message: string; impact: string }[]
      score: number
    }
  }
  insights: {
    topPerformingPages: string[]
    underPerformingPages: string[]
    keywordOpportunities: string[]
    contentGaps: string[]
    technicalIssues: string[]
    competitorAdvantages: string[]
  }
  actionPlan: {
    immediate: { task: string; effort: 'low' | 'medium' | 'high'; impact: 'low' | 'medium' | 'high' }[]
    shortTerm: { task: string; effort: 'low' | 'medium' | 'high'; impact: 'low' | 'medium' | 'high' }[]
    longTerm: { task: string; effort: 'low' | 'medium' | 'high'; impact: 'low' | 'medium' | 'high' }[]
  }
}

export default function SEOAnalysisPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SEOAnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Veuillez entrer une URL')
      return
    }

    const cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setError('URL doit commencer par http:// ou https://')
      return
    }

    try {
      new URL(cleanUrl)
    } catch {
      setError('Veuillez entrer une URL valide')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setActiveTab('overview')

    try {
      const response = await fetch('/api/tools/seo-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: cleanUrl })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
      } else {
        setError(data.error || 'Erreur lors de l\'analyse SEO')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Bon'
    if (score >= 40) return 'Moyen'
    return 'Faible'
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: FiGlobe },
    { id: 'technical', label: 'Technique', icon: FiSettings },
    { id: 'content', label: 'Contenu', icon: FiFileText },
    { id: 'performance', label: 'Performance', icon: FiZap },
    { id: 'issues', label: 'Problèmes', icon: FiAlertTriangle },
    { id: 'recommendations', label: 'Recommandations', icon: FiTarget },
    { id: 'action', label: 'Plan d\'action', icon: FiAward }
  ]

  return (
    <ToolsLayout
      title="Analyse SEO"
      description="Analyse complète SEO, performance et accessibilité d'un site web"
      icon={<FiSearch className="w-12 h-12 text-accent" />}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section d'information */}
        <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-accent">Analyse SEO Complète</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed">
            Cet outil effectue une analyse SEO complète de votre site web incluant l'analyse technique, 
            du contenu, de la performance et des recommandations d'optimisation. Il crawle automatiquement 
            les pages principales et fournit des insights détaillés pour améliorer votre référencement.
          </p>
        </div>

        {/* Formulaire d'analyse */}
        <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
            <FiSearch className="w-6 h-6" />
            Analyse SEO
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground/70 mb-2">
                URL du site web
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
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
                  <FiSearch className="w-5 h-5" />
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
            {/* Scores principaux */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-accent flex items-center gap-2">
                  <FiBarChart className="w-8 h-8" />
                  Scores SEO
                </h3>
                <div className="text-sm text-foreground/50">
                  Analysé le {new Date(result.timestamp).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTarget className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Score Global</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.siteAnalysis.seoScore.overall)}`}>
                      {result.siteAnalysis.seoScore.overall}
                    </span>
                    <span className={`text-sm ${getScoreColor(result.siteAnalysis.seoScore.overall)}`}>
                      {getScoreLabel(result.siteAnalysis.seoScore.overall)}
                    </span>
                  </div>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiSettings className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Technique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.siteAnalysis.seoScore.technical)}`}>
                      {result.siteAnalysis.seoScore.technical}
                    </span>
                    <span className={`text-sm ${getScoreColor(result.siteAnalysis.seoScore.technical)}`}>
                      {getScoreLabel(result.siteAnalysis.seoScore.technical)}
                    </span>
                  </div>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFileText className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Contenu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.siteAnalysis.seoScore.content)}`}>
                      {result.siteAnalysis.seoScore.content}
                    </span>
                    <span className={`text-sm ${getScoreColor(result.siteAnalysis.seoScore.content)}`}>
                      {getScoreLabel(result.siteAnalysis.seoScore.content)}
                    </span>
                  </div>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiEye className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-foreground/70">Pages Analysées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-accent">
                      {result.crawlStats.crawledPages}
                    </span>
                    <span className="text-sm text-foreground/70">
                      / {result.crawlStats.totalPages}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques supplémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-foreground/70">Temps d'analyse</span>
                  </div>
                  <span className="text-lg font-bold text-blue-400">
                    {formatTime(result.crawlStats.crawlTime)}
                  </span>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiAlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-medium text-foreground/70">Erreurs</span>
                  </div>
                  <span className="text-lg font-bold text-red-400">
                    {result.crawlStats.errors}
                  </span>
                </div>

                <div className="bg-surface/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiZap className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground/70">Vitesse moyenne</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">
                    {formatTime(result.siteAnalysis.technicalSEO.speed.avgLoadTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6">
              <div className="flex space-x-4 mb-6 border-b border-secondary/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-accent text-accent'
                        : 'border-transparent text-foreground/50 hover:text-foreground/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Contenu des onglets */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Vue d'ensemble</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiGlobe className="w-5 h-5 text-accent" />
                        Informations générales
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Domaine</span>
                          <span className="text-foreground font-medium">{result.siteAnalysis.domain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">HTTPS</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.ssl.valid ? 'text-green-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.ssl.valid ? '✓ Sécurisé' : '✗ Non sécurisé'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Mobile Friendly</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.mobileFriendly ? 'text-green-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.mobileFriendly ? '✓ Oui' : '✗ Non'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Robots.txt</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.robotsTxt.exists ? 'text-green-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.robotsTxt.exists ? '✓ Présent' : '✗ Absent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiZap className="w-5 h-5 text-accent" />
                        Core Web Vitals
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-foreground/70">LCP (Largest Contentful Paint)</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.coreWebVitals.lcp < 2.5 ? 'text-green-400' : result.siteAnalysis.technicalSEO.coreWebVitals.lcp < 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.coreWebVitals.lcp.toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">FID (First Input Delay)</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.coreWebVitals.fid < 100 ? 'text-green-400' : result.siteAnalysis.technicalSEO.coreWebVitals.fid < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.coreWebVitals.fid}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">CLS (Cumulative Layout Shift)</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.coreWebVitals.cls < 0.1 ? 'text-green-400' : result.siteAnalysis.technicalSEO.coreWebVitals.cls < 0.25 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.coreWebVitals.cls.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Analyse technique</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiSettings className="w-5 h-5 text-accent" />
                        Configuration technique
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Robots.txt</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.robotsTxt.exists ? 'text-green-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.robotsTxt.exists ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Sitemap XML</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.sitemaps.length > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.sitemaps.length > 0 ? `✓ (${result.siteAnalysis.technicalSEO.sitemaps[0]?.pages || 0} pages)` : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Certificat SSL</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.ssl.valid ? 'text-green-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.ssl.valid ? '✓ Valide' : '✗ Invalide'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiMonitor className="w-5 h-5 text-accent" />
                        Performance
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Temps de chargement moyen</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.speed.avgLoadTime < 2000 ? 'text-green-400' : result.siteAnalysis.technicalSEO.speed.avgLoadTime < 4000 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {formatTime(result.siteAnalysis.technicalSEO.speed.avgLoadTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Pages les plus lentes</span>
                          <span className="text-foreground/70">
                            {result.siteAnalysis.technicalSEO.speed.slowestPages.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Analyse du contenu</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-accent" />
                        Optimisation SEO
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Titres optimisés</span>
                          <span className="text-foreground font-medium">
                            {result.siteAnalysis.onPageSEO.titleOptimization.good} / {result.siteAnalysis.crawledPages.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Meta descriptions optimisées</span>
                          <span className="text-foreground font-medium">
                            {result.siteAnalysis.onPageSEO.metaDescriptions.good} / {result.siteAnalysis.crawledPages.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Structure H1 correcte</span>
                          <span className="text-foreground font-medium">
                            {result.siteAnalysis.onPageSEO.headingStructure.good} / {result.siteAnalysis.crawledPages.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiAlertTriangle className="w-5 h-5 text-accent" />
                        Problèmes détectés
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Titres manquants</span>
                          <span className={`font-medium ${result.siteAnalysis.contentAnalysis.missingTitles.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {result.siteAnalysis.contentAnalysis.missingTitles.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Descriptions manquantes</span>
                          <span className={`font-medium ${result.siteAnalysis.contentAnalysis.missingDescriptions.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {result.siteAnalysis.contentAnalysis.missingDescriptions.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Contenu faible</span>
                          <span className={`font-medium ${result.siteAnalysis.contentAnalysis.thinContent.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {result.siteAnalysis.contentAnalysis.thinContent.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Performance et vitesse</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiZap className="w-5 h-5 text-accent" />
                        Métriques de performance
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Temps de chargement moyen</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.speed.avgLoadTime < 2000 ? 'text-green-400' : result.siteAnalysis.technicalSEO.speed.avgLoadTime < 4000 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {formatTime(result.siteAnalysis.technicalSEO.speed.avgLoadTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">LCP</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.coreWebVitals.lcp < 2.5 ? 'text-green-400' : result.siteAnalysis.technicalSEO.coreWebVitals.lcp < 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.coreWebVitals.lcp.toFixed(1)}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">FID</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.coreWebVitals.fid < 100 ? 'text-green-400' : result.siteAnalysis.technicalSEO.coreWebVitals.fid < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.coreWebVitals.fid}ms
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">CLS</span>
                          <span className={`font-medium ${result.siteAnalysis.technicalSEO.coreWebVitals.cls < 0.1 ? 'text-green-400' : result.siteAnalysis.technicalSEO.coreWebVitals.cls < 0.25 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.siteAnalysis.technicalSEO.coreWebVitals.cls.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface/30 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <FiImage className="w-5 h-5 text-accent" />
                        Optimisation des images
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Images optimisées</span>
                          <span className="text-foreground font-medium">
                            {result.siteAnalysis.onPageSEO.imageOptimization.optimized}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground/70">Images sans alt</span>
                          <span className={`font-medium ${result.siteAnalysis.onPageSEO.imageOptimization.missingAlt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {result.siteAnalysis.onPageSEO.imageOptimization.missingAlt}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Problèmes détectés</h3>
                  
                  <div className="space-y-4">
                    {result.siteAnalysis.siteStructure.brokenLinks.length > 0 && (
                      <div className="p-4 rounded-lg border-l-4 bg-red-900/20 border-red-500">
                        <div className="flex items-center gap-2 mb-2">
                          <FiXCircle className="w-5 h-5 text-red-400" />
                          <span className="font-medium text-red-400">CRITIQUE</span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">Liens brisés détectés</h4>
                        <p className="text-foreground/70 text-sm">
                          {result.siteAnalysis.siteStructure.brokenLinks.length} liens brisés trouvés. 
                          Cela nuit à l'expérience utilisateur et au SEO.
                        </p>
                      </div>
                    )}

                    {result.siteAnalysis.contentAnalysis.missingTitles.length > 0 && (
                      <div className="p-4 rounded-lg border-l-4 bg-red-900/20 border-red-500">
                        <div className="flex items-center gap-2 mb-2">
                          <FiXCircle className="w-5 h-5 text-red-400" />
                          <span className="font-medium text-red-400">CRITIQUE</span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">Pages sans titre</h4>
                        <p className="text-foreground/70 text-sm">
                          {result.siteAnalysis.contentAnalysis.missingTitles.length} pages sans titre détectées. 
                          Les titres sont essentiels pour le référencement.
                        </p>
                      </div>
                    )}

                    {result.siteAnalysis.contentAnalysis.missingDescriptions.length > 0 && (
                      <div className="p-4 rounded-lg border-l-4 bg-yellow-900/20 border-yellow-500">
                        <div className="flex items-center gap-2 mb-2">
                          <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
                          <span className="font-medium text-yellow-400">IMPORTANT</span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">Meta descriptions manquantes</h4>
                        <p className="text-foreground/70 text-sm">
                          {result.siteAnalysis.contentAnalysis.missingDescriptions.length} pages sans meta description. 
                          Cela affecte le taux de clic dans les résultats de recherche.
                        </p>
                      </div>
                    )}

                    {result.siteAnalysis.contentAnalysis.duplicateTitles.length > 0 && (
                      <div className="p-4 rounded-lg border-l-4 bg-yellow-900/20 border-yellow-500">
                        <div className="flex items-center gap-2 mb-2">
                          <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
                          <span className="font-medium text-yellow-400">IMPORTANT</span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">Titres dupliqués</h4>
                        <p className="text-foreground/70 text-sm">
                          {result.siteAnalysis.contentAnalysis.duplicateTitles.length} titres dupliqués détectés. 
                          Cela peut créer de la confusion pour les moteurs de recherche.
                        </p>
                      </div>
                    )}

                    {!result.siteAnalysis.technicalSEO.ssl.valid && (
                      <div className="p-4 rounded-lg border-l-4 bg-red-900/20 border-red-500">
                        <div className="flex items-center gap-2 mb-2">
                          <FiLock className="w-5 h-5 text-red-400" />
                          <span className="font-medium text-red-400">CRITIQUE</span>
                        </div>
                        <h4 className="font-medium text-foreground mb-1">Site non sécurisé</h4>
                        <p className="text-foreground/70 text-sm">
                          Le site n'utilise pas HTTPS. Google favorise les sites sécurisés et les navigateurs 
                          alertent les utilisateurs sur les sites non sécurisés.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Recommandations</h3>
                  
                  <div className="space-y-4">
                    {/* Recommandations critiques */}
                    {result.siteAnalysis.recommendations.critical.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                          <FiXCircle className="w-5 h-5" />
                          Critiques ({result.siteAnalysis.recommendations.critical.length})
                        </h4>
                        <div className="space-y-3">
                          {result.siteAnalysis.recommendations.critical.map((rec, index) => (
                            <div key={index} className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-foreground">{rec.issue}</h5>
                                <span className="text-red-400 text-sm font-medium">Priorité: {rec.priority}</span>
                              </div>
                              <p className="text-foreground/70 text-sm">{rec.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommandations importantes */}
                    {result.siteAnalysis.recommendations.important.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
                          <FiAlertTriangle className="w-5 h-5" />
                          Importantes ({result.siteAnalysis.recommendations.important.length})
                        </h4>
                        <div className="space-y-3">
                          {result.siteAnalysis.recommendations.important.map((rec, index) => (
                            <div key={index} className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-foreground">{rec.issue}</h5>
                                <span className="text-yellow-400 text-sm font-medium">Priorité: {rec.priority}</span>
                              </div>
                              <p className="text-foreground/70 text-sm">{rec.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommandations mineures */}
                    {result.siteAnalysis.recommendations.minor.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                          <FiInfo className="w-5 h-5" />
                          Mineures ({result.siteAnalysis.recommendations.minor.length})
                        </h4>
                        <div className="space-y-3">
                          {result.siteAnalysis.recommendations.minor.map((rec, index) => (
                            <div key={index} className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-foreground">{rec.issue}</h5>
                                <span className="text-blue-400 text-sm font-medium">Priorité: {rec.priority}</span>
                              </div>
                              <p className="text-foreground/70 text-sm">{rec.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'action' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent">Plan d'action</h3>
                  
                  <div className="space-y-6">
                    {/* Actions immédiates */}
                    {result.actionPlan.immediate.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                          <FiZap className="w-5 h-5" />
                          Actions immédiates
                        </h4>
                        <div className="space-y-3">
                          {result.actionPlan.immediate.map((action, index) => (
                            <div key={index} className="bg-surface/30 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-foreground">{action.task}</h5>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.effort === 'high' ? 'bg-red-900/50 text-red-400' :
                                    action.effort === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-green-900/50 text-green-400'
                                  }`}>
                                    {action.effort === 'high' ? 'Effort élevé' :
                                     action.effort === 'medium' ? 'Effort moyen' :
                                     'Effort faible'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.impact === 'high' ? 'bg-green-900/50 text-green-400' :
                                    action.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-gray-900/50 text-gray-400'
                                  }`}>
                                    {action.impact === 'high' ? 'Impact élevé' :
                                     action.impact === 'medium' ? 'Impact moyen' :
                                     'Impact faible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions à court terme */}
                    {result.actionPlan.shortTerm.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
                          <FiClock className="w-5 h-5" />
                          Actions à court terme
                        </h4>
                        <div className="space-y-3">
                          {result.actionPlan.shortTerm.map((action, index) => (
                            <div key={index} className="bg-surface/30 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-foreground">{action.task}</h5>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.effort === 'high' ? 'bg-red-900/50 text-red-400' :
                                    action.effort === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-green-900/50 text-green-400'
                                  }`}>
                                    {action.effort === 'high' ? 'Effort élevé' :
                                     action.effort === 'medium' ? 'Effort moyen' :
                                     'Effort faible'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.impact === 'high' ? 'bg-green-900/50 text-green-400' :
                                    action.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-gray-900/50 text-gray-400'
                                  }`}>
                                    {action.impact === 'high' ? 'Impact élevé' :
                                     action.impact === 'medium' ? 'Impact moyen' :
                                     'Impact faible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions à long terme */}
                    {result.actionPlan.longTerm.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                          <FiTrendingUp className="w-5 h-5" />
                          Actions à long terme
                        </h4>
                        <div className="space-y-3">
                          {result.actionPlan.longTerm.map((action, index) => (
                            <div key={index} className="bg-surface/30 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-foreground">{action.task}</h5>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.effort === 'high' ? 'bg-red-900/50 text-red-400' :
                                    action.effort === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-green-900/50 text-green-400'
                                  }`}>
                                    {action.effort === 'high' ? 'Effort élevé' :
                                     action.effort === 'medium' ? 'Effort moyen' :
                                     'Effort faible'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.impact === 'high' ? 'bg-green-900/50 text-green-400' :
                                    action.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-gray-900/50 text-gray-400'
                                  }`}>
                                    {action.impact === 'high' ? 'Impact élevé' :
                                     action.impact === 'medium' ? 'Impact moyen' :
                                     'Impact faible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 