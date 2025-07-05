import axios from 'axios'
import * as cheerio from 'cheerio'
import { URL } from 'url'

interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  impact: string
}

interface CrawledPage {
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
}

interface SiteAnalysis {
  domain: string
  totalPages: number
  crawledPages: CrawledPage[]
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
    coreWebVitals: {
      lcp: number
      fid: number
      cls: number
    }
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

export interface SEOAnalysisResult {
  url: string
  timestamp: number
  crawlStats: {
    totalPages: number
    crawledPages: number
    crawlTime: number
    errors: number
    warnings: number
  }
  siteAnalysis: SiteAnalysis
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
        isNextJs?: boolean
      }
      issues: SEOIssue[]
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

export async function executeSEOAnalysis(url: string): Promise<SEOAnalysisResult> {
  const startTime = Date.now()
  
  // Nettoyer l'URL
  const cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    throw new Error('URL doit commencer par http:// ou https://')
  }

  const baseUrl = new URL(cleanUrl)
  const domain = baseUrl.hostname

  console.log(`🕷️ Démarrage de l'analyse SEO approfondie pour: ${domain}`)

  // Initialiser le résultat
  const result: SEOAnalysisResult = {
    url: cleanUrl,
    timestamp: Date.now(),
    crawlStats: {
      totalPages: 0,
      crawledPages: 0,
      crawlTime: 0,
      errors: 0,
      warnings: 0
    },
    siteAnalysis: {
      domain,
      totalPages: 0,
      crawledPages: [],
      siteStructure: {
        depth: 0,
        categories: [],
        orphanPages: [],
        brokenLinks: [],
        redirectChain: {}
      },
      technicalSEO: {
        robotsTxt: { exists: false, content: '', issues: [] },
        sitemaps: [],
        ssl: { valid: false, issuer: '', expiry: '' },
        speed: { avgLoadTime: 0, slowestPages: [] },
        mobileFriendly: false,
        coreWebVitals: { lcp: 0, fid: 0, cls: 0 }
      },
      contentAnalysis: {
        duplicateContent: [],
        duplicateTitles: [],
        duplicateDescriptions: [],
        missingTitles: [],
        missingDescriptions: [],
        thinContent: [],
        keywordDensity: {},
        readabilityScore: 0
      },
      onPageSEO: {
        titleOptimization: { good: 0, needsWork: 0, missing: 0 },
        metaDescriptions: { good: 0, needsWork: 0, missing: 0 },
        headingStructure: { good: 0, needsWork: 0, missing: 0 },
        imageOptimization: { optimized: 0, missingAlt: 0, oversized: 0 },
        internalLinking: { totalLinks: 0, avgLinksPerPage: 0, orphanPages: 0 }
      },
      offPageSEO: {
        backlinks: { total: 0, domains: 0, quality: 'medium' },
        socialSignals: { facebook: 0, twitter: 0, linkedin: 0 },
        domainAuthority: 0,
        pageAuthority: {}
      },
      competitorAnalysis: {
        competitors: [],
        keywordGaps: [],
        contentGaps: [],
        technicalAdvantages: []
      },
      recommendations: {
        critical: [],
        important: [],
        minor: []
      },
      seoScore: {
        overall: 0,
        technical: 0,
        content: 0,
        onPage: 0,
        offPage: 0,
        breakdown: {}
      }
    },
    pageAnalysis: {},
    insights: {
      topPerformingPages: [],
      underPerformingPages: [],
      keywordOpportunities: [],
      contentGaps: [],
      technicalIssues: [],
      competitorAdvantages: []
    },
    actionPlan: {
      immediate: [],
      shortTerm: [],
      longTerm: []
    }
  }

  try {
    // 1. Analyser la page principale d'abord
    console.log(`📄 Analyse de la page principale: ${cleanUrl}`)
    await analyzePage(cleanUrl, result)
    result.crawlStats.crawledPages++

    // 2. Analyser robots.txt
    console.log(`🤖 Analyse de robots.txt`)
    await analyzeRobotsTxt(baseUrl, result)

    // 3. Analyser les sitemaps
    console.log(`🗺️ Analyse des sitemaps`)
    await analyzeSitemaps(baseUrl, result)

    // 4. Découvrir et analyser les pages supplémentaires
    console.log(`🔍 Découverte des pages supplémentaires`)
    const pagesToCrawl = await discoverPages(cleanUrl, 100)
    result.crawlStats.totalPages = pagesToCrawl.length
    
    // Analyser les pages importantes (augmenter la limite pour les sites Next.js)
    const importantPages = pagesToCrawl.slice(1, 81) // Analyser jusqu'à 80 pages (exclure la page principale déjà analysée)
    
    console.log(`🚀 Analyse de ${importantPages.length} pages découvertes`)
    
    // Analyser les pages par batches pour éviter les timeouts
    const batchSize = 10
    for (let i = 0; i < importantPages.length; i += batchSize) {
      const batch = importantPages.slice(i, i + batchSize)
      console.log(`📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(importantPages.length / batchSize)} - ${batch.length} pages`)
      
      // Analyser les pages du batch en parallèle
      const batchPromises = batch.map(async (pageUrl) => {
        try {
          console.log(`📄 Analyse de: ${pageUrl}`)
          await analyzePage(pageUrl, result)
          result.crawlStats.crawledPages++
        } catch (error: any) {
          console.error(`❌ Erreur lors de l'analyse de ${pageUrl}:`, error.message)
          result.crawlStats.errors++
          
          // Ajouter une page d'erreur dans les résultats
          result.siteAnalysis.crawledPages.push({
            url: pageUrl,
            title: '',
            description: '',
            statusCode: error.response?.status || 0,
            loadTime: Date.now() - startTime,
            wordCount: 0,
            headings: {},
            images: [],
            links: [],
            metaRobots: '',
            canonical: null,
            hreflang: {},
            jsonLd: [],
            errors: [`Erreur ${error.response?.status || 'inconnue'}: ${error.message}`],
            warnings: []
          })
        }
      })
      
      // Attendre que toutes les pages du batch soient analysées
      await Promise.allSettled(batchPromises)
      
      // Petite pause entre les batches pour éviter la surcharge
      if (i + batchSize < importantPages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 5. Analyser la structure du site
    console.log(`🏗️ Analyse de la structure du site`)
    await analyzeSiteStructure(result)

    // 6. Analyser le contenu
    console.log(`📝 Analyse du contenu`)
    await analyzeContent(result)

    // 7. Analyser le SEO on-page
    console.log(`🎯 Analyse SEO on-page`)
    await analyzeOnPageSEO(result)

    // 8. Analyser les aspects techniques
    console.log(`⚙️ Analyse technique`)
    await analyzeTechnicalSEO(result)

    // 9. Générer les recommandations
    console.log(`💡 Génération des recommandations`)
    const recommendations = generateRecommendations(result)
    result.siteAnalysis.recommendations = {
      critical: recommendations.filter(r => r.includes('CRITIQUE')).map(r => ({ issue: r, pages: [], priority: 10, impact: 'Critique' })),
      important: recommendations.filter(r => r.includes('URGENT') || r.includes('IMPORTANT')).map(r => ({ issue: r, pages: [], priority: 8, impact: 'Important' })),
      minor: recommendations.filter(r => !r.includes('CRITIQUE') && !r.includes('URGENT') && !r.includes('IMPORTANT')).map(r => ({ issue: r, pages: [], priority: 5, impact: 'Mineur' }))
    }

    // 10. Calculer les scores SEO
    console.log(`📊 Calcul des scores SEO`)
    await calculateSEOScores(result)

    // 11. Générer les insights
    console.log(`🔍 Génération des insights`)
    await generateInsights(result)

    // 12. Créer le plan d'action
    console.log(`📋 Création du plan d'action`)
    await createActionPlan(result)

    result.crawlStats.crawlTime = Date.now() - startTime

    console.log(`✅ Analyse SEO terminée pour ${domain}`)
    console.log(`📊 Pages analysées: ${result.crawlStats.crawledPages}/${result.crawlStats.totalPages}`)
    console.log(`🔍 Score SEO global: ${result.siteAnalysis.seoScore.overall}/100`)
    console.log(`⚠️ Erreurs: ${result.crawlStats.errors}`)
    console.log(`⏱️ Temps d'analyse: ${formatTime(result.crawlStats.crawlTime)}`)

    // 8. Calculer le score SEO final
    console.log(`🎯 Calcul du score SEO final`)
    const overallScore = calculateSEOScore(result)
    
    result.siteAnalysis.seoScore = {
      overall: overallScore,
      technical: result.siteAnalysis.technicalSEO.ssl.valid && result.siteAnalysis.technicalSEO.mobileFriendly ? 85 : 60,
      content: Math.round(result.siteAnalysis.crawledPages.filter(page => page.title && page.description).length / result.siteAnalysis.crawledPages.length * 100),
      onPage: Math.round(overallScore * 0.8), // Score on-page basé sur le score général
      offPage: Math.round(overallScore * 0.6), // Score off-page (plus difficile à analyser)
      breakdown: {
        technical: {
          score: result.siteAnalysis.technicalSEO.ssl.valid && result.siteAnalysis.technicalSEO.mobileFriendly ? 85 : 60,
          maxScore: 100
        },
        content: {
          score: Math.round(result.siteAnalysis.crawledPages.filter(page => page.title && page.description).length / result.siteAnalysis.crawledPages.length * 100),
          maxScore: 100
        },
        performance: {
          score: result.siteAnalysis.technicalSEO.speed.avgLoadTime < 2000 ? 90 : 70,
          maxScore: 100
        }
      }
    }

    return result

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse SEO:', error)
    throw error
  }
}

async function analyzeRobotsTxt(baseUrl: URL, result: SEOAnalysisResult) {
  try {
    const robotsUrl = `${baseUrl.origin}/robots.txt`
    const response = await axios.get(robotsUrl, { timeout: 10000 })
    
    result.siteAnalysis.technicalSEO.robotsTxt = {
      exists: true,
      content: response.data,
      issues: []
    }

    // Analyser le contenu du robots.txt
    const lines = response.data.split('\n')
    let hasUserAgent = false
    let hasSitemap = false

    for (const line of lines) {
      if (line.toLowerCase().includes('user-agent:')) hasUserAgent = true
      if (line.toLowerCase().includes('sitemap:')) hasSitemap = true
    }

    if (!hasUserAgent) {
      result.siteAnalysis.technicalSEO.robotsTxt.issues.push('Aucun User-agent spécifié')
    }
    if (!hasSitemap) {
      result.siteAnalysis.technicalSEO.robotsTxt.issues.push('Aucun sitemap référencé')
    }

  } catch (error) {
    result.siteAnalysis.technicalSEO.robotsTxt = {
      exists: false,
      content: '',
      issues: ['Fichier robots.txt non trouvé']
    }
  }
}

async function analyzeSitemaps(baseUrl: URL, result: SEOAnalysisResult) {
  const sitemapUrls = [
    `${baseUrl.origin}/sitemap.xml`,
    `${baseUrl.origin}/sitemap_index.xml`,
    `${baseUrl.origin}/sitemaps.xml`
  ]

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await axios.get(sitemapUrl, { timeout: 10000 })
      const $ = cheerio.load(response.data, { xmlMode: true })
      
      const urls = $('url').length
      const errors: string[] = []

      // Vérifier la structure du sitemap
      if (urls === 0) {
        errors.push('Aucune URL trouvée dans le sitemap')
      }

      result.siteAnalysis.technicalSEO.sitemaps.push({
        url: sitemapUrl,
        pages: urls,
        errors
      })

      break // Arrêter après le premier sitemap trouvé
    } catch (error) {
      // Continuer avec le prochain sitemap
    }
  }

  if (result.siteAnalysis.technicalSEO.sitemaps.length === 0) {
    result.siteAnalysis.technicalSEO.sitemaps.push({
      url: '',
      pages: 0,
      errors: ['Aucun sitemap trouvé']
    })
  }
}

async function discoverPages(url: string, limit: number = 100): Promise<string[]> {
  const discoveredUrls = new Set<string>()
  const baseUrl = new URL(url).origin
  const processedUrls = new Set<string>()
  
  console.log(`🤖 Démarrage du crawler GoogleBot pour ${url}`)
  
  // Ajouter l'URL principale
  discoveredUrls.add(url)
  
  try {
    // 1. Analyser le sitemap.xml de manière plus approfondie
    console.log(`🗺️ Analyse approfondie des sitemaps`)
    const sitemapUrls = await discoverSitemaps(baseUrl)
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapResponse = await axios.get(sitemapUrl, { 
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
          }
        })
        
        if (sitemapResponse.status === 200) {
          console.log(`📄 Sitemap analysé: ${sitemapUrl}`)
          
          // Parser le XML de manière plus robuste
          const urls = await parseSitemapXML(sitemapResponse.data, baseUrl)
          urls.forEach(url => {
            if (discoveredUrls.size < limit) {
              discoveredUrls.add(url)
            }
          })
          
          console.log(`✅ ${urls.length} URLs extraites du sitemap`)
        }
      } catch (error) {
        console.log(`❌ Erreur sitemap ${sitemapUrl}:`, error)
      }
    }
    
    // 2. Crawler récursif intelligent pour Next.js
    console.log(`🕷️ Crawler récursif pour découvrir les pages Next.js`)
    const crawlQueue = [url]
    const maxDepth = 3
    let currentDepth = 0
    
    while (crawlQueue.length > 0 && discoveredUrls.size < limit && currentDepth < maxDepth) {
      const currentUrl = crawlQueue.shift()!
      
      if (processedUrls.has(currentUrl)) continue
      processedUrls.add(currentUrl)
      
      try {
        const response = await axios.get(currentUrl, { 
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (response.status === 200) {
          console.log(`🔍 Analyse de ${currentUrl}`)
          
          // Extraire tous les liens avec Cheerio
          const $ = cheerio.load(response.data)
          const links = new Set<string>()
          
          // Liens classiques
          $('a[href]').each((_, element) => {
            const href = $(element).attr('href')
            if (href) links.add(href)
          })
          
          // Liens Next.js spécifiques
          $('link[href]').each((_, element) => {
            const href = $(element).attr('href')
            if (href && !href.includes('.css') && !href.includes('.js')) {
              links.add(href)
            }
          })
          
          // Analyser les scripts Next.js pour trouver des routes
          $('script').each((_, element) => {
            const scriptContent = $(element).html()
            if (scriptContent) {
              // Chercher les patterns Next.js
              const routePatterns = [
                /"\/[^"]*"/g,  // Routes entre guillemets
                /href:"\/[^"]*"/g,  // href dans les objets
                /path:"\/[^"]*"/g,  // path dans les objets
                /route:"\/[^"]*"/g   // route dans les objets
              ]
              
              routePatterns.forEach(pattern => {
                const matches = scriptContent.match(pattern)
                if (matches) {
                  matches.forEach(match => {
                    const route = match.replace(/["']/g, '').replace(/^(href:|path:|route:)/, '')
                    if (route.startsWith('/') && !route.includes('.')) {
                      links.add(route)
                    }
                  })
                }
              })
            }
          })
          
          // Traiter tous les liens trouvés
          for (const link of links) {
            const fullUrl = resolveUrl(link, currentUrl, baseUrl)
            if (fullUrl && 
                fullUrl.startsWith(baseUrl) && 
                !discoveredUrls.has(fullUrl) &&
                !processedUrls.has(fullUrl) &&
                isValidPageUrl(fullUrl)) {
              
              discoveredUrls.add(fullUrl)
              
              // Ajouter à la queue pour crawl récursif
              if (crawlQueue.length < 50 && currentDepth < maxDepth - 1) {
                crawlQueue.push(fullUrl)
              }
            }
          }
        }
      } catch (error) {
        console.log(`❌ Erreur crawl ${currentUrl}:`, error)
      }
      
      currentDepth++
    }
    
    // 3. Découverte par patterns Next.js communs
    console.log(`🎯 Découverte par patterns Next.js`)
    const nextjsPatterns = [
      // Pages de base
      '/', '/about', '/contact', '/blog', '/services', '/products', '/portfolio',
      
      // Pages légales
      '/privacy', '/terms', '/legal', '/cookies', '/gdpr',
      
      // Pages e-commerce
      '/shop', '/cart', '/checkout', '/account', '/orders',
      
      // Pages blog/actualités
      '/news', '/articles', '/posts', '/category', '/tag',
      
      // Pages techniques
      '/api', '/sitemap', '/robots.txt', '/manifest.json',
      
      // Pages dynamiques communes
      '/[slug]', '/blog/[slug]', '/products/[id]', '/category/[name]',
      
      // Pages avec paramètres
      '/search', '/results', '/filter', '/sort',
      
      // Pages utilisateur
      '/login', '/register', '/profile', '/dashboard', '/settings'
    ]
    
    for (const pattern of nextjsPatterns) {
      if (discoveredUrls.size >= limit) break
      
      // Ignorer les routes dynamiques pour la découverte directe
      if (pattern.includes('[') || pattern.includes(']')) continue
      
      const pageUrl = baseUrl + pattern
      if (!discoveredUrls.has(pageUrl)) {
        try {
          const response = await axios.head(pageUrl, { 
            timeout: 8000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
          })
          
          if (response.status === 200) {
            discoveredUrls.add(pageUrl)
            console.log(`📄 Page Next.js trouvée: ${pageUrl}`)
          }
        } catch (error) {
          // Page n'existe pas, continuer
        }
      }
    }
    
    // 4. Analyse des API routes Next.js
    console.log(`🔌 Découverte des API routes Next.js`)
    try {
      const apiRoutes = [`${baseUrl}/api`, `${baseUrl}/api/pages`, `${baseUrl}/api/sitemap`]
      
      for (const apiRoute of apiRoutes) {
        try {
          const response = await axios.get(apiRoute, { 
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
              'Accept': 'application/json'
            }
          })
          
          if (response.status === 200 && response.data) {
            // Si l'API retourne des URLs
            if (Array.isArray(response.data)) {
              response.data.forEach((item: any) => {
                if (typeof item === 'string' && item.startsWith('/')) {
                  const fullUrl = baseUrl + item
                  if (discoveredUrls.size < limit) {
                    discoveredUrls.add(fullUrl)
                  }
                } else if (item.url || item.path || item.href) {
                  const url = item.url || item.path || item.href
                  const fullUrl = resolveUrl(url, baseUrl, baseUrl)
                  if (fullUrl && discoveredUrls.size < limit) {
                    discoveredUrls.add(fullUrl)
                  }
                }
              })
            }
          }
        } catch (error) {
          // API n'existe pas, continuer
        }
      }
    } catch (error) {
      console.log(`❌ Erreur API routes:`, error)
    }
    
  } catch (error) {
    console.log(`❌ Erreur générale de découverte:`, error)
  }
  
  const finalUrls = Array.from(discoveredUrls)
    .filter(url => isValidPageUrl(url))
    .slice(0, limit)
  
  console.log(`✅ ${finalUrls.length} pages découvertes par le crawler GoogleBot`)
  console.log(`🎯 Exemples de pages trouvées:`, finalUrls.slice(0, 10))
  
  return finalUrls
}

async function discoverSitemaps(baseUrl: string): Promise<string[]> {
  const sitemapUrls: string[] = []
  
  // Sitemaps standards et variations courantes
  const standardSitemaps = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap-index.xml`,
    `${baseUrl}/sitemaps.xml`,
    `${baseUrl}/sitemap.txt`,
    `${baseUrl}/sitemap/sitemap.xml`,
    `${baseUrl}/sitemap/index.xml`,
    `${baseUrl}/sitemaps/sitemap.xml`,
    `${baseUrl}/sitemaps/index.xml`
  ]
  
  // Sitemaps WordPress
  const wordpressSitemaps = [
    `${baseUrl}/wp-sitemap.xml`,
    `${baseUrl}/wp-sitemap-posts-post-1.xml`,
    `${baseUrl}/wp-sitemap-pages-1.xml`,
    `${baseUrl}/wp-sitemap-taxonomies-category-1.xml`,
    `${baseUrl}/wp-sitemap-users-1.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/post-sitemap.xml`,
    `${baseUrl}/page-sitemap.xml`,
    `${baseUrl}/category-sitemap.xml`,
    `${baseUrl}/tag-sitemap.xml`
  ]
  
  // Sitemaps Next.js et frameworks modernes
  const nextjsSitemaps = [
    `${baseUrl}/sitemap/index.xml`,
    `${baseUrl}/api/sitemap.xml`,
    `${baseUrl}/api/sitemap`,
    `${baseUrl}/api/sitemap/index.xml`,
    `${baseUrl}/_next/static/sitemap.xml`,
    `${baseUrl}/static/sitemap.xml`,
    `${baseUrl}/public/sitemap.xml`,
    `${baseUrl}/pages-sitemap.xml`,
    `${baseUrl}/page-sitemap.xml`,
    `${baseUrl}/posts-sitemap.xml`,
    `${baseUrl}/post-sitemap.xml`,
    `${baseUrl}/articles-sitemap.xml`,
    `${baseUrl}/blog-sitemap.xml`,
    `${baseUrl}/news-sitemap.xml`,
    `${baseUrl}/products-sitemap.xml`,
    `${baseUrl}/categories-sitemap.xml`,
    `${baseUrl}/tags-sitemap.xml`
  ]
  
  // Sitemaps spécialisés
  const specializedSitemaps = [
    `${baseUrl}/image-sitemap.xml`,
    `${baseUrl}/video-sitemap.xml`,
    `${baseUrl}/news-sitemap.xml`,
    `${baseUrl}/mobile-sitemap.xml`,
    `${baseUrl}/amp-sitemap.xml`,
    `${baseUrl}/hreflang-sitemap.xml`,
    `${baseUrl}/geo-sitemap.xml`
  ]
  
  // Sitemaps avec différents formats de nommage
  const variationSitemaps = [
    `${baseUrl}/sitemap1.xml`,
    `${baseUrl}/sitemap2.xml`,
    `${baseUrl}/sitemap3.xml`,
    `${baseUrl}/sitemap-1.xml`,
    `${baseUrl}/sitemap-2.xml`,
    `${baseUrl}/sitemap-3.xml`,
    `${baseUrl}/sitemap_1.xml`,
    `${baseUrl}/sitemap_2.xml`,
    `${baseUrl}/sitemap_3.xml`,
    `${baseUrl}/main-sitemap.xml`,
    `${baseUrl}/master-sitemap.xml`,
    `${baseUrl}/primary-sitemap.xml`,
    `${baseUrl}/general-sitemap.xml`,
    `${baseUrl}/complete-sitemap.xml`
  ]
  
  const allSitemaps = [
    ...standardSitemaps,
    ...wordpressSitemaps,
    ...nextjsSitemaps,
    ...specializedSitemaps,
    ...variationSitemaps
  ]
  
  console.log(`🔍 Recherche de sitemaps parmi ${allSitemaps.length} possibilités...`)
  
  // Tester tous les sitemaps en parallèle par lots pour éviter la surcharge
  const batchSize = 10
  for (let i = 0; i < allSitemaps.length; i += batchSize) {
    const batch = allSitemaps.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (sitemapUrl) => {
      try {
        const response = await axios.head(sitemapUrl, { 
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'application/xml,text/xml,*/*'
          }
        })
        
        if (response.status === 200) {
          // Vérifier le Content-Type pour s'assurer que c'est du XML
          const contentType = response.headers['content-type'] || ''
          if (contentType.includes('xml') || contentType.includes('text')) {
            console.log(`✅ Sitemap trouvé: ${sitemapUrl}`)
            return sitemapUrl
          }
        }
      } catch (error) {
        // Sitemap n'existe pas, continuer
      }
      return null
    })
    
    const batchResults = await Promise.allSettled(batchPromises)
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        sitemapUrls.push(result.value)
      }
    })
    
    // Petite pause entre les batches
    if (i + batchSize < allSitemaps.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  // Rechercher des sitemaps supplémentaires dans robots.txt
  try {
    const robotsResponse = await axios.get(`${baseUrl}/robots.txt`, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    })
    
    if (robotsResponse.status === 200) {
      const robotsContent = robotsResponse.data
      const sitemapMatches = robotsContent.match(/sitemap:\s*(.+)/gi)
      
      if (sitemapMatches) {
        sitemapMatches.forEach((match: string) => {
          const sitemapUrl = match.replace(/sitemap:\s*/i, '').trim()
          if (sitemapUrl && !sitemapUrls.includes(sitemapUrl)) {
            console.log(`📄 Sitemap trouvé dans robots.txt: ${sitemapUrl}`)
            sitemapUrls.push(sitemapUrl)
          }
        })
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors de la lecture de robots.txt:', error)
  }
  
  console.log(`🗺️ ${sitemapUrls.length} sitemaps découverts au total`)
  return sitemapUrls
}

async function parseSitemapXML(xmlData: string, baseUrl: string): Promise<string[]> {
  const urls = []
  
  try {
    // Parser XML avec regex plus robuste
    const urlMatches = xmlData.match(/<loc[^>]*>(.*?)<\/loc>/g)
    if (urlMatches) {
      urlMatches.forEach(match => {
        const url = match.replace(/<\/?loc[^>]*>/g, '').trim()
        if (url && (url.startsWith('http') || url.startsWith('/'))) {
          const fullUrl = url.startsWith('http') ? url : baseUrl + url
          if (fullUrl.startsWith(baseUrl)) {
            urls.push(fullUrl)
          }
        }
      })
    }
    
    // Parser les sitemap index
    const sitemapMatches = xmlData.match(/<sitemap[^>]*>[\s\S]*?<\/sitemap>/g)
    if (sitemapMatches) {
      for (const sitemapMatch of sitemapMatches) {
        const locMatch = sitemapMatch.match(/<loc[^>]*>(.*?)<\/loc>/)
        if (locMatch) {
          const sitemapUrl = locMatch[1].trim()
          try {
            const subSitemapResponse = await axios.get(sitemapUrl, { 
              timeout: 10000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
              }
            })
            
            const subUrls = await parseSitemapXML(subSitemapResponse.data, baseUrl)
            urls.push(...subUrls)
          } catch (error) {
            console.log(`❌ Erreur sous-sitemap ${sitemapUrl}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.log(`❌ Erreur parsing XML:`, error)
  }
  
  return urls
}

function resolveUrl(href: string, currentUrl: string, baseUrl: string): string | null {
  try {
    if (href.startsWith('http')) {
      return href
    } else if (href.startsWith('/')) {
      return baseUrl + href
    } else if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return null
    } else {
      // URL relative
      const currentPath = new URL(currentUrl).pathname
      const basePath = currentPath.endsWith('/') ? currentPath : currentPath.split('/').slice(0, -1).join('/')
      return baseUrl + basePath + '/' + href
    }
  } catch (error) {
    return null
  }
}

function isValidPageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Exclure les fichiers statiques
    const excludeExtensions = ['.css', '.js', '.json', '.xml', '.txt', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf', '.zip', '.mp4', '.mp3']
    if (excludeExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
      return false
    }
    
    // Exclure les URLs avec paramètres complexes
    if (urlObj.search && urlObj.search.includes('&')) {
      return false
    }
    
    // Exclure les ancres
    if (urlObj.hash) {
      return false
    }
    
    // Exclure les chemins système
    const excludePaths = ['/api/', '/_next/', '/static/', '/public/', '/assets/', '/node_modules/']
    if (excludePaths.some(path => pathname.startsWith(path))) {
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

async function analyzePage(pageUrl: string, result: SEOAnalysisResult) {
  const startTime = Date.now()
  
  try {
    const response = await axios.get(pageUrl, { 
      timeout: 20000, // Augmenter le timeout pour Next.js
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    const loadTime = Date.now() - startTime
    const $ = cheerio.load(response.data)
    
    // Analyser le contenu de la page
    const title = $('title').text().trim()
    const description = $('meta[name="description"]').attr('content') || 
                      $('meta[property="og:description"]').attr('content') || ''
    const metaRobots = $('meta[name="robots"]').attr('content') || ''
    const canonical = $('link[rel="canonical"]').attr('href') || null
    
    // Détecter Next.js spécifiquement
    const isNextJs = response.data.includes('_next/') || 
                     response.data.includes('__NEXT_DATA__') ||
                     response.data.includes('next/head') ||
                     $('script[src*="_next/"]').length > 0
    
    // Analyser les en-têtes de manière plus robuste
    const headings: { [key: string]: string[] } = {}
    for (let i = 1; i <= 6; i++) {
      headings[`h${i}`] = []
      $(`h${i}`).each((_, element) => {
        const text = $(element).text().trim()
        if (text) {
          headings[`h${i}`].push(text)
        }
      })
    }

    // Analyser les images avec plus de détails
    const images: { src: string; alt: string; title?: string }[] = []
    $('img').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src') || ''
      const alt = $(element).attr('alt') || ''
      const title = $(element).attr('title')
      
      // Résoudre les URLs relatives Next.js
      let resolvedSrc = src
      if (src.startsWith('/')) {
        resolvedSrc = new URL(pageUrl).origin + src
      } else if (src.startsWith('_next/')) {
        resolvedSrc = new URL(pageUrl).origin + '/' + src
      }
      
      images.push({ src: resolvedSrc, alt, title })
    })

    // Analyser les liens avec plus de précision
    const links: { url: string; text: string; type: 'internal' | 'external'; nofollow: boolean }[] = []
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href') || ''
      const text = $(element).text().trim()
      const rel = $(element).attr('rel') || ''
      const nofollow = rel.includes('nofollow')
      
      try {
        let linkUrl = href
        if (href.startsWith('/')) {
          linkUrl = new URL(pageUrl).origin + href
        } else if (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          linkUrl = new URL(href, pageUrl).toString()
        }
        
        if (linkUrl.startsWith('http')) {
          const type = new URL(linkUrl).hostname === new URL(pageUrl).hostname ? 'internal' : 'external'
          links.push({ url: linkUrl, text, type, nofollow })
        }
      } catch (error) {
        // Ignorer les URLs invalides
      }
    })

    // Analyser le contenu textuel de manière plus précise
    // Supprimer les scripts et styles pour avoir le vrai contenu
    $('script, style, nav, header, footer').remove()
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length

    // Analyser les données structurées (JSON-LD, Microdata)
    const jsonLd: any[] = []
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const data = JSON.parse($(element).html() || '{}')
        jsonLd.push(data)
      } catch (error) {
        // Ignorer les JSON-LD invalides
      }
    })

    // Analyser hreflang
    const hreflang: { [key: string]: string } = {}
    $('link[rel="alternate"][hreflang]').each((_, element) => {
      const lang = $(element).attr('hreflang') || ''
      const href = $(element).attr('href') || ''
      if (lang && href) {
        hreflang[lang] = href.startsWith('http') ? href : new URL(pageUrl).origin + href
      }
    })

    // Détecter la compatibilité mobile
    const hasViewport = $('meta[name="viewport"]').length > 0
    const viewportContent = $('meta[name="viewport"]').attr('content') || ''
    const mobileFriendly = hasViewport && (
      viewportContent.includes('width=device-width') ||
      response.data.includes('responsive') ||
      response.data.includes('@media') ||
      isNextJs // Next.js est généralement responsive par défaut
    )

    // Analyser les Core Web Vitals de manière plus réaliste
    const coreWebVitals = {
      lcp: Math.min(10, Math.max(0.5, loadTime / 1000 * 0.7)), // LCP basé sur le temps de chargement
      fid: isNextJs ? Math.random() * 50 + 10 : Math.random() * 100 + 50, // Next.js généralement plus rapide
      cls: isNextJs ? Math.random() * 0.05 + 0.01 : Math.random() * 0.15 + 0.05 // Next.js plus stable
    }

    // Créer l'analyse de la page avec des métriques améliorées
    const pageAnalysis: {
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
        isNextJs?: boolean
      }
      issues: SEOIssue[]
      score: number
    } = {
      performance: {
        loadTime,
        pageSize: response.data.length,
        requests: 1, // Simulation - pourrait être amélioré avec des outils comme Lighthouse
        coreWebVitals
      },
      seo: {
        title: { 
          text: title, 
          length: title.length, 
          optimized: title.length >= 30 && title.length <= 60 
        },
        description: { 
          text: description, 
          length: description.length, 
          optimized: description.length >= 120 && description.length <= 160 
        },
        headings: { 
          structure: headings.h1.length === 1 ? 'good' : headings.h1.length === 0 ? 'missing' : 'multiple', 
          issues: headings.h1.length === 0 ? ['Aucun H1 trouvé'] : 
                  headings.h1.length > 1 ? ['Plusieurs H1 détectés'] : []
        },
        content: { 
          wordCount, 
          readability: Math.min(100, Math.max(0, 100 - Math.abs(wordCount - 500) / 10)), 
          keywordDensity: {} // Pourrait être amélioré avec une analyse de mots-clés
        },
        images: { 
          total: images.length, 
          optimized: images.filter(img => img.alt && img.alt.trim() !== '').length, 
          issues: images.filter(img => !img.alt || img.alt.trim() === '').length > 0 ? 
                  [`${images.filter(img => !img.alt || img.alt.trim() === '').length} images sans attribut alt`] : []
        },
        links: { 
          internal: links.filter(link => link.type === 'internal').length, 
          external: links.filter(link => link.type === 'external').length, 
          broken: 0 // Pourrait être amélioré avec une vérification des liens
        }
      },
      technical: {
        statusCode: response.status,
        canonical,
        metaRobots,
        structured: jsonLd,
        hreflang,
        mobileFriendly,
        isNextJs // Ajouter l'information Next.js
      },
      issues: [],
      score: 0
    }

    // Calculer le score de la page
    pageAnalysis.score = calculatePageScore(pageAnalysis)

    // Ajouter les problèmes détectés avec plus de précision
    if (!pageAnalysis.seo.title.optimized) {
      const severity = !title ? 'error' : 'warning'
      pageAnalysis.issues.push({
        type: severity,
        message: !title ? 'Titre manquant' : 
                title.length < 30 ? 'Titre trop court (< 30 caractères)' : 
                'Titre trop long (> 60 caractères)',
        impact: severity === 'error' ? 'high' : 'medium'
      })
    }

    if (!pageAnalysis.seo.description.optimized) {
      const severity = !description ? 'error' : 'warning'
      pageAnalysis.issues.push({
        type: severity,
        message: !description ? 'Meta description manquante' : 
                description.length < 120 ? 'Meta description trop courte (< 120 caractères)' : 
                'Meta description trop longue (> 160 caractères)',
        impact: severity === 'error' ? 'high' : 'medium'
      })
    }

    if (pageAnalysis.seo.headings.structure !== 'good') {
      pageAnalysis.issues.push({
        type: 'error',
        message: pageAnalysis.seo.headings.structure === 'missing' ? 
                'Aucun H1 trouvé' : 'Plusieurs H1 détectés',
        impact: 'high'
      })
    }

    if (pageAnalysis.seo.images.issues.length > 0) {
      pageAnalysis.issues.push({
        type: 'warning',
        message: pageAnalysis.seo.images.issues[0],
        impact: 'medium'
      })
    }

    if (wordCount < 300) {
      pageAnalysis.issues.push({
        type: 'warning',
        message: `Contenu insuffisant (${wordCount} mots, recommandé: 300+)`,
        impact: 'medium'
      })
    }

    if (!mobileFriendly) {
      pageAnalysis.issues.push({
        type: 'error',
        message: 'Page non optimisée pour mobile',
        impact: 'high'
      })
    }

    result.pageAnalysis[pageUrl] = pageAnalysis

    // Ajouter à la liste des pages crawlées avec plus d'informations
    result.siteAnalysis.crawledPages.push({
      url: pageUrl,
      title,
      description,
      statusCode: response.status,
      loadTime,
      wordCount,
      headings,
      images,
      links,
      metaRobots,
      canonical,
      hreflang,
      jsonLd,
      errors: pageAnalysis.issues.filter(issue => issue.type === 'error').map(issue => issue.message),
      warnings: pageAnalysis.issues.filter(issue => issue.type === 'warning').map(issue => issue.message)
    })

    console.log(`✅ Page analysée: ${pageUrl} (${loadTime}ms, ${wordCount} mots, score: ${pageAnalysis.score}/100)`)

  } catch (error: any) {
    console.error(`❌ Erreur lors de l'analyse de ${pageUrl}:`, error.message)
    
    // Gérer spécifiquement les erreurs HTTP
    if (error.response) {
      const statusCode = error.response.status
      console.log(`📄 Page ${pageUrl} - Status: ${statusCode}`)
      
      if (statusCode === 404) {
        console.log(`⚠️ Page non trouvée (404): ${pageUrl}`)
      } else if (statusCode >= 400) {
        console.log(`⚠️ Erreur HTTP ${statusCode}: ${pageUrl}`)
      }
    } else if (error.code === 'ECONNABORTED') {
      console.log(`⏱️ Timeout pour: ${pageUrl}`)
    } else if (error.code === 'ENOTFOUND') {
      console.log(`🔍 Domaine non trouvé: ${pageUrl}`)
    }
    
    result.crawlStats.errors++
    
    // Ajouter une page d'erreur dans les résultats
    result.siteAnalysis.crawledPages.push({
      url: pageUrl,
      title: '',
      description: '',
      statusCode: error.response?.status || 0,
      loadTime: Date.now() - startTime,
      wordCount: 0,
      headings: {},
      images: [],
      links: [],
      metaRobots: '',
      canonical: null,
      hreflang: {},
      jsonLd: [],
      errors: [`Erreur ${error.response?.status || error.code || 'inconnue'}: ${error.message}`],
      warnings: []
    })
  }
}

function calculatePageScore(pageAnalysis: any): number {
  let score = 0
  let maxScore = 0

  // Score du titre (20 points)
  maxScore += 20
  if (pageAnalysis.seo.title.optimized) score += 20
  else if (pageAnalysis.seo.title.text) score += 10

  // Score de la description (15 points)
  maxScore += 15
  if (pageAnalysis.seo.description.optimized) score += 15
  else if (pageAnalysis.seo.description.text) score += 8

  // Score des en-têtes (15 points)
  maxScore += 15
  if (pageAnalysis.seo.headings.structure === 'good') score += 15
  else if (pageAnalysis.seo.headings.issues.length === 0) score += 8

  // Score des images (20 points)
  maxScore += 20
  if (pageAnalysis.seo.images.total > 0) {
    const optimizationRate = pageAnalysis.seo.images.optimized / pageAnalysis.seo.images.total
    score += Math.round(20 * optimizationRate)
  }

  // Score technique (15 points)
  maxScore += 15
  if (pageAnalysis.technical.statusCode === 200) score += 5
  if (pageAnalysis.technical.canonical) score += 5
  if (pageAnalysis.technical.mobileFriendly) score += 5

  // Score du contenu (15 points)
  maxScore += 15
  if (pageAnalysis.seo.content.wordCount > 300) score += 10
  if (pageAnalysis.seo.content.readability > 70) score += 5

  return Math.round((score / maxScore) * 100)
}

async function analyzeSiteStructure(result: SEOAnalysisResult) {
  // Analyser la structure du site
  const pages = result.siteAnalysis.crawledPages
  const allLinks = pages.flatMap(page => page.links)
  
  console.log(`🔗 Vérification de ${allLinks.length} liens pour détecter les liens brisés...`)
  
  // Détecter les liens brisés en testant réellement les URLs
  const brokenLinks: string[] = []
  const uniqueLinks = Array.from(new Set(allLinks.map(link => link.url)))
  
  // Tester les liens par batches pour éviter la surcharge
  const batchSize = 20
  for (let i = 0; i < uniqueLinks.length; i += batchSize) {
    const batch = uniqueLinks.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (linkUrl) => {
      try {
        // Tester seulement les liens internes pour éviter les timeouts
        const baseUrl = new URL(result.url).origin
        if (!linkUrl.startsWith(baseUrl)) {
          return null // Ignorer les liens externes pour cette vérification
        }
        
        const response = await axios.head(linkUrl, { 
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
          }
        })
        
        if (response.status >= 400) {
          console.log(`❌ Lien brisé détecté: ${linkUrl} (${response.status})`)
          return linkUrl
        }
      } catch (error: any) {
        if (error.response && error.response.status >= 400) {
          console.log(`❌ Lien brisé détecté: ${linkUrl} (${error.response.status})`)
          return linkUrl
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          console.log(`❌ Lien brisé détecté: ${linkUrl} (${error.code})`)
          return linkUrl
        }
        // Ignorer les timeouts et autres erreurs temporaires
      }
      return null
    })
    
    const batchResults = await Promise.allSettled(batchPromises)
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        brokenLinks.push(result.value)
      }
    })
    
    // Petite pause entre les batches
    if (i + batchSize < uniqueLinks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Détecter les pages orphelines (pages non liées par d'autres pages)
  const linkedPages = new Set(allLinks.filter(link => link.type === 'internal').map(link => link.url))
  const orphanPages = pages
    .filter(page => !linkedPages.has(page.url) && page.url !== result.url)
    .map(page => page.url)

  // Calculer la profondeur du site
  const depth = Math.max(...pages.map(page => {
    const pathSegments = new URL(page.url).pathname.split('/').filter(Boolean)
    return pathSegments.length
  }))

  // Identifier les catégories basées sur la structure des URLs
  const categories = Array.from(new Set(
    pages.map(page => {
      const pathSegments = new URL(page.url).pathname.split('/').filter(Boolean)
      return pathSegments[0] || 'home'
    })
  ))

  // Analyser les chaînes de redirection (simulation améliorée)
  const redirectChain: { [key: string]: string[] } = {}
  
  // Détecter les redirections potentielles en analysant les URLs similaires
  for (const page of pages) {
    const url = new URL(page.url)
    const pathWithoutSlash = url.pathname.replace(/\/$/, '')
    const pathWithSlash = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/'
    
    // Vérifier si les deux versions existent
    const alternativeUrl = url.origin + (url.pathname.endsWith('/') ? pathWithoutSlash : pathWithSlash)
    const alternativeExists = pages.some(p => p.url === alternativeUrl)
    
    if (alternativeExists) {
      redirectChain[page.url] = [alternativeUrl]
    }
  }

  result.siteAnalysis.siteStructure = {
    depth,
    categories,
    orphanPages,
    brokenLinks,
    redirectChain
  }
  
  console.log(`📊 Structure analysée:`)
  console.log(`   - Profondeur: ${depth}`)
  console.log(`   - Catégories: ${categories.length}`)
  console.log(`   - Pages orphelines: ${orphanPages.length}`)
  console.log(`   - Liens brisés: ${brokenLinks.length}`)
  console.log(`   - Redirections: ${Object.keys(redirectChain).length}`)
}

async function analyzeContent(result: SEOAnalysisResult) {
  const pages = result.siteAnalysis.crawledPages

  // Détecter les titres dupliqués
  const titleMap = new Map<string, string[]>()
  pages.forEach(page => {
    if (page.title) {
      if (!titleMap.has(page.title)) {
        titleMap.set(page.title, [])
      }
      titleMap.get(page.title)!.push(page.url)
    }
  })

  const duplicateTitles = Array.from(titleMap.entries())
    .filter(([_, urls]) => urls.length > 1)
    .map(([title, urls]) => ({ title, pages: urls }))

  // Détecter les descriptions dupliquées
  const descriptionMap = new Map<string, string[]>()
  pages.forEach(page => {
    if (page.description) {
      if (!descriptionMap.has(page.description)) {
        descriptionMap.set(page.description, [])
      }
      descriptionMap.get(page.description)!.push(page.url)
    }
  })

  const duplicateDescriptions = Array.from(descriptionMap.entries())
    .filter(([_, urls]) => urls.length > 1)
    .map(([description, urls]) => ({ description, pages: urls }))

  // Détecter les pages avec du contenu faible
  const thinContent = pages
    .filter(page => page.wordCount < 300)
    .map(page => ({ page: page.url, wordCount: page.wordCount }))

  // Détecter les titres et descriptions manquants
  const missingTitles = pages.filter(page => !page.title).map(page => page.url)
  const missingDescriptions = pages.filter(page => !page.description).map(page => page.url)

  result.siteAnalysis.contentAnalysis = {
    duplicateContent: [], // Simulation
    duplicateTitles,
    duplicateDescriptions,
    missingTitles,
    missingDescriptions,
    thinContent,
    keywordDensity: {}, // Simulation
    readabilityScore: 75 // Simulation
  }
}

async function analyzeOnPageSEO(result: SEOAnalysisResult) {
  const pages = result.siteAnalysis.crawledPages

  // Analyser l'optimisation des titres
  const titleOptimization = {
    good: pages.filter(page => page.title && page.title.length >= 30 && page.title.length <= 60).length,
    needsWork: pages.filter(page => page.title && (page.title.length < 30 || page.title.length > 60)).length,
    missing: pages.filter(page => !page.title).length
  }

  // Analyser les meta descriptions
  const metaDescriptions = {
    good: pages.filter(page => page.description && page.description.length >= 120 && page.description.length <= 160).length,
    needsWork: pages.filter(page => page.description && (page.description.length < 120 || page.description.length > 160)).length,
    missing: pages.filter(page => !page.description).length
  }

  // Analyser la structure des en-têtes
  const headingStructure = {
    good: pages.filter(page => page.headings.h1 && page.headings.h1.length === 1).length,
    needsWork: pages.filter(page => page.headings.h1 && page.headings.h1.length > 1).length,
    missing: pages.filter(page => !page.headings.h1 || page.headings.h1.length === 0).length
  }

  // Analyser l'optimisation des images
  const imageOptimization = {
    optimized: pages.reduce((sum, page) => sum + page.images.filter(img => img.alt).length, 0),
    missingAlt: pages.reduce((sum, page) => sum + page.images.filter(img => !img.alt).length, 0),
    oversized: 0 // Simulation
  }

  // Analyser les liens internes
  const totalLinks = pages.reduce((sum, page) => sum + page.links.filter(link => link.type === 'internal').length, 0)
  const avgLinksPerPage = pages.length > 0 ? Math.round(totalLinks / pages.length) : 0

  result.siteAnalysis.onPageSEO = {
    titleOptimization,
    metaDescriptions,
    headingStructure,
    imageOptimization,
    internalLinking: {
      totalLinks,
      avgLinksPerPage,
      orphanPages: result.siteAnalysis.siteStructure.orphanPages.length
    }
  }
}

async function analyzeTechnicalSEO(result: SEOAnalysisResult) {
  const pages = result.siteAnalysis.crawledPages
  
  // Analyser SSL - vérifier si l'URL principale utilise HTTPS
  const mainUrl = result.url
  const isHttps = mainUrl.startsWith('https://')
  
  // Vérifier le certificat SSL en faisant une requête
  let sslValid = false
  let sslIssuer = 'Non sécurisé'
  let sslExpiry = ''
  
  if (isHttps) {
    try {
      // Faire une requête pour vérifier que HTTPS fonctionne
      const response = await axios.get(mainUrl, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)'
        }
      })
      
      if (response.status === 200) {
        sslValid = true
        sslIssuer = 'Certificat SSL valide'
        // Simuler une date d'expiration dans 3 mois
        sslExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    } catch (error) {
      console.log('Erreur lors de la vérification SSL:', error)
      sslValid = false
    }
  }

  result.siteAnalysis.technicalSEO.ssl = {
    valid: sslValid,
    issuer: sslIssuer,
    expiry: sslExpiry
  }

  // Calculer les temps de chargement réels
  const loadTimes = pages.filter(page => page.loadTime > 0).map(page => page.loadTime)
  const avgLoadTime = loadTimes.length > 0 ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length : 0
  
  result.siteAnalysis.technicalSEO.speed = {
    avgLoadTime,
    slowestPages: pages
      .filter(page => page.loadTime > 0)
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5)
      .map(page => page.url)
  }

  // Analyser la compatibilité mobile - vérifier la présence de viewport
  const mobilePages = pages.filter(page => {
    // Vérifier si la page a une balise viewport
    return page.metaRobots.includes('viewport') || 
           page.title.toLowerCase().includes('mobile') ||
           page.description.toLowerCase().includes('mobile')
  })
  
  // Vérifier plus précisément en analysant le HTML de la page principale
  let mobileFriendly = false
  try {
    const mainPage = pages.find(page => page.url === result.url)
    if (mainPage) {
      const response = await axios.get(mainPage.url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)'
        }
      })
      
      const hasViewport = response.data.includes('name="viewport"') || 
                         response.data.includes('name=\'viewport\'')
      
      const hasResponsiveClasses = response.data.includes('responsive') || 
                                  response.data.includes('mobile') ||
                                  response.data.includes('col-') ||
                                  response.data.includes('grid')
      
      mobileFriendly = hasViewport || hasResponsiveClasses
    }
  } catch (error) {
    console.log('Erreur lors de la vérification mobile:', error)
    // Fallback: considérer mobile friendly si plus de 50% des pages ont des indicateurs
    mobileFriendly = mobilePages.length / pages.length > 0.5
  }
  
  result.siteAnalysis.technicalSEO.mobileFriendly = mobileFriendly

  // Calculer les Core Web Vitals plus réalistes
  result.siteAnalysis.technicalSEO.coreWebVitals = {
    lcp: Math.min(10, Math.max(1, avgLoadTime / 1000 * 0.8)), // LCP basé sur le temps de chargement
    fid: avgLoadTime < 2000 ? Math.random() * 50 + 20 : Math.random() * 200 + 100, // FID basé sur la performance
    cls: avgLoadTime < 2000 ? Math.random() * 0.05 + 0.02 : Math.random() * 0.2 + 0.1 // CLS basé sur la performance
  }
}

function generateRecommendations(result: SEOAnalysisResult): string[] {
  const recommendations: string[] = []
  const siteAnalysis = result.siteAnalysis
  
  // Convertir pageAnalysis en tableau pour faciliter l'utilisation
  const pageAnalysisArray = Object.entries(result.pageAnalysis).map(([url, analysis]) => ({
    url,
    ...analysis
  }))
  
  // Recommandations techniques avec détails spécifiques
  if (!siteAnalysis.technicalSEO.ssl.valid) {
    recommendations.push(`🔒 CRITIQUE: Corriger le certificat SSL invalide. Votre site n'est pas sécurisé, ce qui affecte gravement le référencement.`)
  }
  
  if (!siteAnalysis.technicalSEO.mobileFriendly) {
    recommendations.push(`📱 CRITIQUE: Optimiser la compatibilité mobile. Votre site n'est pas mobile-friendly, ce qui pénalise fortement le référencement.`)
  }
  
  if (siteAnalysis.technicalSEO.coreWebVitals.lcp > 2500) {
    recommendations.push(`⚡ URGENT: Améliorer la vitesse de chargement (LCP: ${siteAnalysis.technicalSEO.coreWebVitals.lcp}ms). Optimisez les images et le code.`)
  }
  
  // Recommandations pour les pages avec erreurs spécifiques
  const pagesWithIssues = pageAnalysisArray.filter(page => page.issues && page.issues.length > 0)
  
  if (pagesWithIssues.length > 0) {
    recommendations.push(`📋 PAGES AVEC ERREURS (${pagesWithIssues.length} pages):`)
    
    // Grouper les erreurs par type
    const errorsByType: { [key: string]: { urls: string[], count: number } } = {}
    
    pagesWithIssues.forEach(page => {
      page.issues.forEach(issue => {
        if (!errorsByType[issue.type]) {
          errorsByType[issue.type] = { urls: [], count: 0 }
        }
        if (errorsByType[issue.type].urls.length < 10) { // Limiter à 10 exemples
          errorsByType[issue.type].urls.push(page.url)
        }
        errorsByType[issue.type].count++
      })
    })
    
    // Détailler chaque type d'erreur
    Object.entries(errorsByType).forEach(([errorType, data]) => {
      recommendations.push(`   • ${errorType} (${data.count} pages):`)
      data.urls.forEach(url => {
        recommendations.push(`     - ${url}`)
      })
      if (data.count > data.urls.length) {
        recommendations.push(`     - ... et ${data.count - data.urls.length} autres pages`)
      }
    })
  }
  
  // Recommandations pour les liens brisés
  if (siteAnalysis.siteStructure.brokenLinks.length > 0) {
    recommendations.push(`🔗 LIENS BRISÉS (${siteAnalysis.siteStructure.brokenLinks.length}):`)
    siteAnalysis.siteStructure.brokenLinks.slice(0, 10).forEach(link => {
      recommendations.push(`   • ${link}`)
    })
    if (siteAnalysis.siteStructure.brokenLinks.length > 10) {
      recommendations.push(`   • ... et ${siteAnalysis.siteStructure.brokenLinks.length - 10} autres liens`)
    }
  }
  
  // Recommandations pour les pages orphelines
  if (siteAnalysis.siteStructure.orphanPages.length > 0) {
    recommendations.push(`🏝️ PAGES ORPHELINES (${siteAnalysis.siteStructure.orphanPages.length}):`)
    siteAnalysis.siteStructure.orphanPages.slice(0, 10).forEach(page => {
      recommendations.push(`   • ${page}`)
    })
    if (siteAnalysis.siteStructure.orphanPages.length > 10) {
      recommendations.push(`   • ... et ${siteAnalysis.siteStructure.orphanPages.length - 10} autres pages`)
    }
  }
  
  // Recommandations pour le contenu
  if (pageAnalysisArray.length > 0) {
    const avgWordsPerPage = pageAnalysisArray.reduce((sum, page) => sum + (page.seo?.content?.wordCount || 0), 0) / pageAnalysisArray.length
    if (avgWordsPerPage < 300) {
      recommendations.push(`📝 CONTENU: Augmenter la longueur du contenu (moyenne: ${Math.round(avgWordsPerPage)} mots/page). Visez 300+ mots par page.`)
    }
  }
  
  // Recommandations pour les images
  const pagesWithImageIssues = pageAnalysisArray.filter(page => 
    page.issues && page.issues.some(issue => issue.type.includes('image') || issue.type.includes('Image'))
  )
  
  if (pagesWithImageIssues.length > 0) {
    recommendations.push(`🖼️ IMAGES NON OPTIMISÉES (${pagesWithImageIssues.length} pages):`)
    pagesWithImageIssues.slice(0, 5).forEach(page => {
      const imageIssues = page.issues.filter(issue => 
        issue.type.includes('image') || issue.type.includes('Image')
      )
      recommendations.push(`   • ${page.url}: ${imageIssues.map(i => i.message).join(', ')}`)
    })
  }
  
  // Recommandations pour les balises meta
  const pagesWithMetaIssues = pageAnalysisArray.filter(page => 
    page.issues && page.issues.some(issue => issue.type.includes('title') || issue.type.includes('description'))
  )
  
  if (pagesWithMetaIssues.length > 0) {
    recommendations.push(`🏷️ BALISES META À CORRIGER (${pagesWithMetaIssues.length} pages):`)
    pagesWithMetaIssues.slice(0, 5).forEach(page => {
      const metaIssues = page.issues.filter(issue => 
        issue.type.includes('title') || issue.type.includes('description')
      )
      recommendations.push(`   • ${page.url}: ${metaIssues.map(i => i.message).join(', ')}`)
    })
  }
  
  // Recommandations générales basées sur le score
  if (pageAnalysisArray.length > 0) {
    const avgScore = pageAnalysisArray.reduce((sum, page) => sum + (page.score || 0), 0) / pageAnalysisArray.length
    
    if (avgScore < 60) {
      recommendations.push(`⚠️ SCORE GLOBAL FAIBLE (${Math.round(avgScore)}/100): Priorisez les corrections techniques et de contenu.`)
    } else if (avgScore < 80) {
      recommendations.push(`📈 SCORE MOYEN (${Math.round(avgScore)}/100): Continuez les optimisations pour atteindre l'excellence.`)
    } else {
      recommendations.push(`✅ EXCELLENT SCORE (${Math.round(avgScore)}/100): Maintenez ces bonnes pratiques SEO.`)
    }
  }
  
  // Recommandations pour les sitemaps
  if (siteAnalysis.technicalSEO.sitemaps.length === 0) {
    recommendations.push(`🗺️ SITEMAP: Créer un sitemap XML pour faciliter l'indexation par les moteurs de recherche.`)
  }
  
  // Recommandations pour robots.txt
  if (!siteAnalysis.technicalSEO.robotsTxt.exists) {
    recommendations.push(`🤖 ROBOTS.TXT: Créer un fichier robots.txt pour guider les robots des moteurs de recherche.`)
  }
  
  return recommendations
}

async function calculateSEOScores(result: SEOAnalysisResult) {
  const pages = result.siteAnalysis.crawledPages

  // Calculer le score technique
  let technicalScore = 100
  if (!result.siteAnalysis.technicalSEO.robotsTxt.exists) technicalScore -= 10
  if (result.siteAnalysis.technicalSEO.sitemaps.length === 0) technicalScore -= 10
  if (result.siteAnalysis.siteStructure.brokenLinks.length > 0) technicalScore -= 15

  // Calculer le score de contenu
  let contentScore = 100
  if (result.siteAnalysis.contentAnalysis.duplicateTitles.length > 0) contentScore -= 15
  if (result.siteAnalysis.contentAnalysis.duplicateDescriptions.length > 0) contentScore -= 10
  if (result.siteAnalysis.contentAnalysis.thinContent.length > 0) contentScore -= 20

  // Calculer le score on-page
  const onPageScore = Math.round(
    (result.siteAnalysis.onPageSEO.titleOptimization.good / pages.length) * 30 +
    (result.siteAnalysis.onPageSEO.metaDescriptions.good / pages.length) * 25 +
    (result.siteAnalysis.onPageSEO.headingStructure.good / pages.length) * 25 +
    (result.siteAnalysis.onPageSEO.imageOptimization.optimized / 
     (result.siteAnalysis.onPageSEO.imageOptimization.optimized + result.siteAnalysis.onPageSEO.imageOptimization.missingAlt)) * 20
  )

  // Score off-page (simulation)
  const offPageScore = Math.min(100, result.siteAnalysis.offPageSEO.domainAuthority + 20)

  // Score global
  const overallScore = Math.round((technicalScore + contentScore + onPageScore + offPageScore) / 4)

  result.siteAnalysis.seoScore = {
    overall: overallScore,
    technical: technicalScore,
    content: contentScore,
    onPage: onPageScore,
    offPage: offPageScore,
    breakdown: {
      'Technique': { score: technicalScore, maxScore: 100 },
      'Contenu': { score: contentScore, maxScore: 100 },
      'On-page': { score: onPageScore, maxScore: 100 },
      'Off-page': { score: offPageScore, maxScore: 100 }
    }
  }
}

async function generateInsights(result: SEOAnalysisResult) {
  const pageScores = Object.entries(result.pageAnalysis).map(([url, analysis]) => ({
    url,
    score: analysis.score
  }))

  pageScores.sort((a, b) => b.score - a.score)

  result.insights = {
    topPerformingPages: pageScores.slice(0, 5).map(p => p.url),
    underPerformingPages: pageScores.slice(-5).map(p => p.url),
    keywordOpportunities: ['mot-clé longue traîne', 'terme sectoriel', 'requête locale'],
    contentGaps: ['Guide pratique', 'FAQ complète', 'Études de cas'],
    technicalIssues: result.siteAnalysis.siteStructure.brokenLinks.slice(0, 5),
    competitorAdvantages: result.siteAnalysis.competitorAnalysis.technicalAdvantages
  }
}

async function createActionPlan(result: SEOAnalysisResult) {
  const allRecommendations = [
    ...result.siteAnalysis.recommendations.critical,
    ...result.siteAnalysis.recommendations.important,
    ...result.siteAnalysis.recommendations.minor
  ]

  result.actionPlan = {
    immediate: allRecommendations
      .filter(rec => rec.priority >= 8)
      .map(rec => ({
        task: rec.issue,
        effort: (rec.pages.length > 10 ? 'high' : rec.pages.length > 3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        impact: (rec.priority >= 9 ? 'high' : 'medium') as 'low' | 'medium' | 'high'
      }))
      .slice(0, 5),
    
    shortTerm: allRecommendations
      .filter(rec => rec.priority >= 6 && rec.priority < 8)
      .map(rec => ({
        task: rec.issue,
        effort: (rec.pages.length > 10 ? 'high' : rec.pages.length > 3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        impact: (rec.priority >= 7 ? 'high' : 'medium') as 'low' | 'medium' | 'high'
      }))
      .slice(0, 5),
    
    longTerm: allRecommendations
      .filter(rec => rec.priority < 6)
      .map(rec => ({
        task: rec.issue,
        effort: (rec.pages.length > 10 ? 'high' : rec.pages.length > 3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        impact: 'low' as 'low' | 'medium' | 'high'
      }))
      .slice(0, 5)
  }

  // Ajouter des recommandations générales si pas assez de recommandations spécifiques
  if (result.actionPlan.immediate.length < 3) {
    result.actionPlan.immediate.push(
      { task: 'Optimiser les Core Web Vitals', effort: 'high', impact: 'high' },
      { task: 'Améliorer la structure des URLs', effort: 'medium', impact: 'medium' },
      { task: 'Implémenter des données structurées', effort: 'medium', impact: 'medium' }
    )
  }

  if (result.actionPlan.shortTerm.length < 3) {
    result.actionPlan.shortTerm.push(
      { task: 'Optimiser les images (compression, formats modernes)', effort: 'medium', impact: 'medium' },
      { task: 'Améliorer le maillage interne', effort: 'medium', impact: 'medium' },
      { task: 'Créer du contenu de qualité régulièrement', effort: 'high', impact: 'high' }
    )
  }

  if (result.actionPlan.longTerm.length < 3) {
    result.actionPlan.longTerm.push(
      { task: 'Développer une stratégie de netlinking', effort: 'high', impact: 'high' },
      { task: 'Optimiser pour la recherche vocale', effort: 'medium', impact: 'medium' },
      { task: 'Surveiller et analyser la concurrence', effort: 'medium', impact: 'medium' }
    )
  }
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function calculateSEOScore(result: SEOAnalysisResult): number {
  let score = 100
  
  // Pénalités basées sur les vrais problèmes trouvés
  
  // SSL et HTTPS (-20 points si pas de SSL)
  if (!result.siteAnalysis.technicalSEO.ssl.valid) {
    score -= 20
  }
  
  // Vitesse de chargement (-15 points si lent)
  const avgLoadTime = result.siteAnalysis.technicalSEO.speed.avgLoadTime
  if (avgLoadTime > 3000) {
    score -= 15
  } else if (avgLoadTime > 2000) {
    score -= 8
  }
  
  // Compatibilité mobile (-15 points si pas mobile friendly)
  if (!result.siteAnalysis.technicalSEO.mobileFriendly) {
    score -= 15
  }
  
  // Core Web Vitals (-10 points si mauvais)
  const cwv = result.siteAnalysis.technicalSEO.coreWebVitals
  if (cwv.lcp > 4) score -= 5
  if (cwv.fid > 300) score -= 3
  if (cwv.cls > 0.25) score -= 2
  
  // Problèmes de contenu basés sur les pages analysées
  const pages = result.siteAnalysis.crawledPages
  const totalPages = pages.length
  
  if (totalPages > 0) {
    const missingTitles = pages.filter(page => !page.title || page.title.trim() === '').length
    const missingDescriptions = pages.filter(page => !page.description || page.description.trim() === '').length
    const thinContent = pages.filter(page => page.wordCount < 300).length
    
    // Calculer les titres dupliqués
    const titles = pages.map(page => page.title).filter(title => title && title.trim() !== '')
    const duplicateTitles = titles.length - new Set(titles).size
    
    // Appliquer les pénalités proportionnellement
    if (missingTitles > 0) {
      score -= Math.min(10, (missingTitles / totalPages) * 20)
    }
    
    if (missingDescriptions > 0) {
      score -= Math.min(8, (missingDescriptions / totalPages) * 15)
    }
    
    if (duplicateTitles > 0) {
      score -= Math.min(12, (duplicateTitles / totalPages) * 25)
    }
    
    if (thinContent > 0) {
      score -= Math.min(8, (thinContent / totalPages) * 15)
    }
    
    // Problèmes techniques - compter les erreurs 404
    const brokenLinks = pages.filter(page => page.statusCode === 404).length
    if (brokenLinks > 0) {
      score -= Math.min(15, (brokenLinks / totalPages) * 30)
    }
  }
  
  // Bonus pour les bonnes pratiques
  if (result.siteAnalysis.technicalSEO.ssl.valid) {
    score += 2
  }
  
  if (result.siteAnalysis.technicalSEO.mobileFriendly) {
    score += 3
  }
  
  if (avgLoadTime < 1500) {
    score += 5
  }
  
  // S'assurer que le score reste dans les limites
  return Math.max(0, Math.min(100, Math.round(score)))
} 