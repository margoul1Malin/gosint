import puppeteer, { Browser, Page } from 'puppeteer'
import { URL } from 'url'

export interface CrawledPage {
  url: string
  title: string
  statusCode: number
  size: number
  contentType: string
  depth: number
  parent?: string
  children: string[]
  links: string[]
  forms: FormInfo[]
  headers: { [key: string]: string }
  lastModified?: string
  isDirectory: boolean
  extension?: string
  discoveryMethod: 'crawl' | 'sitemap' | 'robots' | 'directory'
}

export interface FormInfo {
  action: string
  method: string
  inputs: Array<{
    name: string
    type: string
    required: boolean
  }>
}

export interface FoldersEnumerationResult {
  targetUrl: string
  totalPages: number
  totalDirectories: number
  maxDepth: number
  sitemap: CrawledPage[]
  directories: string[]
  files: { [extension: string]: string[] }
  forms: FormInfo[]
  errors: string[]
  statistics: {
    statusCodes: { [code: number]: number }
    contentTypes: { [type: string]: number }
    extensions: { [ext: string]: number }
  }
  discoveryMethods: {
    crawl: number
    sitemap: number
    robots: number
    directory: number
  }
  security: {
    sensitiveFiles: string[]
    exposedDirectories: string[]
    adminPanels: string[]
    configFiles: string[]
  }
}

// User-Agents variés pour éviter la détection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
]

// Headers variés pour simuler différents navigateurs
const HEADER_SETS = [
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
  },
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  },
  {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site'
  }
]

// Listes de fichiers et dossiers sensibles à rechercher
const SENSITIVE_FILES = [
  'robots.txt', 'sitemap.xml', '.htaccess', 'web.config', 'wp-config.php',
  'config.php', 'database.php', 'settings.php', '.env', '.git',
  'admin.php', 'login.php', 'phpmyadmin', 'wp-admin', 'admin',
  'backup.sql', 'dump.sql', 'config.json', 'package.json',
  'composer.json', '.DS_Store', 'thumbs.db', 'error_log'
]

const ADMIN_PATHS = [
  'admin', 'administrator', 'wp-admin', 'phpmyadmin', 'cpanel',
  'webmail', 'mail', 'ftp', 'ssh', 'panel', 'control', 'manage',
  'dashboard', 'backend', 'console', 'system'
]

const DIRECTORY_PATHS = [
  'assets', 'css', 'js', 'images', 'img', 'uploads', 'files',
  'documents', 'downloads', 'media', 'static', 'public',
  'resources', 'lib', 'vendor', 'node_modules', 'bower_components',
  'wp-content', 'wp-includes', 'themes', 'plugins', 'modules',
  'includes', 'templates', 'layouts', 'partials', 'components'
]

// Fonction pour obtenir des headers aléatoires
function getRandomHeaders(): { userAgent: string; headers: any } {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  const headers = HEADER_SETS[Math.floor(Math.random() * HEADER_SETS.length)]
  return { userAgent, headers }
}

// Fonction pour ajouter des délais aléatoires
function randomDelay(min: number = 500, max: number = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

export async function executeFoldersEnumeration(
  targetUrl: string,
  options: {
    maxDepth?: number
    maxPages?: number
    includeExternal?: boolean
    followRedirects?: boolean
    checkSensitiveFiles?: boolean
  } = {}
): Promise<FoldersEnumerationResult> {
  const startTime = Date.now()
  let browser: Browser | null = null
  
  const {
    maxDepth = 3,
    maxPages = 100,
    includeExternal = false,
    followRedirects = true,
    checkSensitiveFiles = true
  } = options

  try {
    // Normaliser l'URL
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    const baseUrl = new URL(targetUrl)
    console.log(`🕷️ Début du crawling pour: ${targetUrl}`)

    // Lancer Puppeteer avec options anti-détection
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
        '--window-size=1920,1080'
      ]
    })

    // Structures de données pour le crawling
    const visited = new Set<string>()
    const urlsToProcess = new Set<string>() // URLs découvertes mais pas encore traitées
    const sitemap: CrawledPage[] = []
    const errors: string[] = []
    const directories = new Set<string>()
    const files: { [extension: string]: string[] } = {}
    const forms: FormInfo[] = []
    const statistics = {
      statusCodes: {} as { [code: number]: number },
      contentTypes: {} as { [type: string]: number },
      extensions: {} as { [ext: string]: number }
    }
    const discoveryMethods = {
      crawl: 0,
      sitemap: 0,
      robots: 0,
      directory: 0
    }
    const security = {
      sensitiveFiles: [] as string[],
      exposedDirectories: [] as string[],
      adminPanels: [] as string[],
      configFiles: [] as string[]
    }

    // Fonction pour normaliser les URLs
    const normalizeUrl = (url: string, baseUrl: URL): string | null => {
      try {
        const parsed = new URL(url, baseUrl.origin)
        
        // Filtrer les URLs externes si nécessaire
        if (!includeExternal && parsed.hostname !== baseUrl.hostname) {
          return null
        }

        // Supprimer les fragments et paramètres de query pour la structure
        parsed.hash = ''
        parsed.search = ''
        
        return parsed.toString()
      } catch {
        return null
      }
    }

    // Fonction pour calculer la profondeur d'une URL
    const getUrlDepth = (url: string): number => {
      const pathname = new URL(url).pathname
      // Compter les segments de chemin (excluant les segments vides)
      const segments = pathname.split('/').filter(segment => segment.length > 0)
      return segments.length
    }

    // Fonction pour obtenir le parent logique d'une URL
    const getLogicalParent = (url: string): string | null => {
      try {
        const parsed = new URL(url)
        const pathSegments = parsed.pathname.split('/').filter(segment => segment.length > 0)
        
        if (pathSegments.length === 0) {
          return null // URL racine
        }
        
        // Retirer le dernier segment pour obtenir le parent
        pathSegments.pop()
        const parentPath = pathSegments.length > 0 ? '/' + pathSegments.join('/') + '/' : '/'
        
        return `${parsed.protocol}//${parsed.host}${parentPath}`
      } catch {
        return null
      }
    }

    // Fonction pour créer un parent manquant
    const createMissingParent = (parentUrl: string, depth: number): CrawledPage => {
      const parsed = new URL(parentUrl)
      const pathSegments = parsed.pathname.split('/').filter(segment => segment.length > 0)
      const folderName = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'racine'
      
      return {
        url: parentUrl,
        title: `Dossier: ${folderName}`,
        statusCode: 200,
        size: 0,
        contentType: 'directory',
        depth: depth,
        parent: getLogicalParent(parentUrl) || undefined,
        children: [],
        links: [],
        forms: [],
        headers: {},
        isDirectory: true,
        discoveryMethod: 'directory'
      }
    }

    // Fonction pour s'assurer que tous les parents existent
    const ensureParentExists = (url: string, urlToPage: Map<string, CrawledPage>): void => {
      const parentUrl = getLogicalParent(url)
      if (!parentUrl) return
      
      if (!urlToPage.has(parentUrl)) {
        // Créer le parent manquant
        const parentDepth = getUrlDepth(parentUrl)
        const missingParent = createMissingParent(parentUrl, parentDepth)
        urlToPage.set(parentUrl, missingParent)
        sitemap.push(missingParent)
        
        // Récursivement s'assurer que le grand-parent existe aussi
        ensureParentExists(parentUrl, urlToPage)
      }
    }

    // Fonction pour extraire l'extension d'un fichier
    const getExtension = (url: string): string | undefined => {
      const pathname = new URL(url).pathname
      const lastDot = pathname.lastIndexOf('.')
      const lastSlash = pathname.lastIndexOf('/')
      
      if (lastDot > lastSlash && lastDot !== -1) {
        return pathname.substring(lastDot + 1).toLowerCase()
      }
      return undefined
    }

    // Fonction pour déterminer si c'est un dossier
    const isDirectory = (url: string): boolean => {
      const pathname = new URL(url).pathname
      return pathname.endsWith('/') || !getExtension(url)
    }

    // Fonction pour extraire le chemin du dossier
    const getDirectoryPath = (url: string): string => {
      const pathname = new URL(url).pathname
      if (pathname.endsWith('/')) {
        return pathname
      }
      return pathname.substring(0, pathname.lastIndexOf('/') + 1)
    }

    // ÉTAPE 1: Découverte rapide via sitemap.xml et robots.txt
    console.log('🗺️ Découverte via sitemap et robots.txt...')
    const initialPage = await browser.newPage()
    await setupPageAntiDetection(initialPage)
    await discoverUrlsFromSpecialFiles(initialPage, baseUrl, urlsToProcess, discoveryMethods, security)
    await initialPage.close()

    // Ajouter l'URL de base
    urlsToProcess.add(targetUrl)

    // ÉTAPE 2: Trier les URLs par profondeur pour un crawling logique
    const sortedUrls = Array.from(urlsToProcess).sort((a, b) => {
      const depthA = getUrlDepth(a)
      const depthB = getUrlDepth(b)
      if (depthA !== depthB) {
        return depthA - depthB // Traiter les URLs moins profondes en premier
      }
      return a.localeCompare(b) // Ordre alphabétique pour les URLs de même profondeur
    })

    // ÉTAPE 3: Crawling intelligent basé sur la structure
    console.log(`🔍 Crawling de ${sortedUrls.length} URLs découvertes...`)
    
    for (const url of sortedUrls) {
      if (visited.has(url) || visited.size >= maxPages) {
        continue
      }

      const depth = getUrlDepth(url)
      if (depth > maxDepth) {
        continue
      }

      visited.add(url)
      console.log(`🔍 Crawling: ${url} (profondeur: ${depth})`)

      let page: Page | null = null
      try {
        page = await browser.newPage()
        await setupPageAntiDetection(page)
        
        // Délai aléatoire entre les requêtes
        await randomDelay(500, 1500) // Réduit car on a moins de requêtes grâce au sitemap

        const response = await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 15000
        })

        if (!response) {
          errors.push(`Pas de réponse pour: ${url}`)
          continue
        }

        const statusCode = response.status()
        const headers = response.headers()
        const contentType = headers['content-type'] || 'unknown'

        // Statistiques
        statistics.statusCodes[statusCode] = (statistics.statusCodes[statusCode] || 0) + 1
        statistics.contentTypes[contentType] = (statistics.contentTypes[contentType] || 0) + 1

        // Ignorer les erreurs 4xx et 5xx sauf si on veut les documenter
        if (statusCode >= 400) {
          errors.push(`Erreur ${statusCode} pour: ${url}`)
          continue
        }

        // Extraire les informations de la page
        const pageInfo = await page.evaluate(() => {
          const title = document.title
          const links = Array.from(document.querySelectorAll('a[href]'))
            .map(a => (a as HTMLAnchorElement).href)
            .filter(href => href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:'))

          const forms = Array.from(document.querySelectorAll('form')).map(form => ({
            action: form.action,
            method: form.method || 'GET',
            inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
              name: input.getAttribute('name') || '',
              type: input.getAttribute('type') || 'text',
              required: input.hasAttribute('required')
            }))
          }))

          return { title, links, forms }
        })

        const extension = getExtension(url)
        const isDir = isDirectory(url)
        const dirPath = getDirectoryPath(url)
        const logicalParent = getLogicalParent(url)

        // Ajouter aux statistiques d'extensions
        if (extension) {
          statistics.extensions[extension] = (statistics.extensions[extension] || 0) + 1
          if (!files[extension]) files[extension] = []
          files[extension].push(url)
        }

        // Ajouter aux dossiers
        if (isDir) {
          directories.add(dirPath)
        }

        // Créer l'entrée du sitemap avec parent logique
        const crawledPage: CrawledPage = {
          url,
          title: pageInfo.title,
          statusCode,
          size: (await response.text()).length,
          contentType,
          depth,
          parent: logicalParent && visited.has(logicalParent) ? logicalParent : undefined,
          children: [],
          links: pageInfo.links,
          forms: pageInfo.forms,
          headers,
          lastModified: headers['last-modified'],
          isDirectory: isDir,
          extension,
          discoveryMethod: urlsToProcess.has(url) ? 'sitemap' : 'crawl'
        }

        sitemap.push(crawledPage)
        forms.push(...pageInfo.forms)
        
        if (urlsToProcess.has(url)) {
          discoveryMethods.sitemap++
        } else {
          discoveryMethods.crawl++
        }

        // Découvrir de nouveaux liens uniquement si on n'a pas atteint la limite
        if (visited.size < maxPages) {
          for (const link of pageInfo.links) {
            const normalizedLink = normalizeUrl(link, baseUrl)
            if (normalizedLink && !visited.has(normalizedLink) && !urlsToProcess.has(normalizedLink)) {
              const linkDepth = getUrlDepth(normalizedLink)
              if (linkDepth <= maxDepth) {
                urlsToProcess.add(normalizedLink)
              }
            }
          }
        }

        // Vérifier les fichiers sensibles
        if (checkSensitiveFiles) {
          await checkSensitiveFilesInPage(url, security)
        }

      } catch (error) {
        const errorMsg = `Erreur lors du crawling de ${url}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      } finally {
        if (page) {
          await page.close()
        }
      }
    }

    // ÉTAPE 4: Énumération de dossiers additionnelle
    if (checkSensitiveFiles) {
      const enumerationPage = await browser.newPage()
      await setupPageAntiDetection(enumerationPage)
      await enumerateCommonDirectories(enumerationPage, baseUrl, directories, security, discoveryMethods)
      await enumerationPage.close()
    }

    // ÉTAPE 5: Construire l'arbre hiérarchique basé sur la structure des URLs
    console.log('🌳 Construction de l\'arbre hiérarchique...')
    const urlToPage = new Map(sitemap.map(page => [page.url, page]))
    
    // Première passe : s'assurer que tous les parents existent
    console.log('🔧 Création des parents manquants...')
    const originalSitemapSize = sitemap.length
    for (const page of [...sitemap]) { // Copie pour éviter la modification pendant l'itération
      ensureParentExists(page.url, urlToPage)
    }
    
    if (sitemap.length > originalSitemapSize) {
      console.log(`📁 ${sitemap.length - originalSitemapSize} dossiers parents créés`)
    }
    
    // Deuxième passe : établir les relations parent-enfant correctes
    console.log('🔗 Établissement des relations parent-enfant...')
    sitemap.forEach(page => {
      const parentUrl = getLogicalParent(page.url)
      if (parentUrl && urlToPage.has(parentUrl)) {
        page.parent = parentUrl
        const parentPage = urlToPage.get(parentUrl)
        if (parentPage && !parentPage.children.includes(page.url)) {
          parentPage.children.push(page.url)
        }
      }
    })

    // Troisième passe : trier les enfants intelligemment
    console.log('📊 Tri des enfants par type et nom...')
    sitemap.forEach(page => {
      if (page.children.length > 0) {
        page.children.sort((a, b) => {
          const pageA = urlToPage.get(a)
          const pageB = urlToPage.get(b)
          
          if (!pageA || !pageB) return 0
          
          // Les dossiers avant les fichiers
          if (pageA.isDirectory && !pageB.isDirectory) return -1
          if (!pageA.isDirectory && pageB.isDirectory) return 1
          
          // Ensuite par ordre alphabétique
          return pageA.url.localeCompare(pageB.url)
        })
      }
    })

    // Quatrième passe : calculer les statistiques correctes
    const realDirectories = sitemap.filter(page => page.isDirectory).length
    const realFiles = sitemap.filter(page => !page.isDirectory).length
    
    console.log(`📊 Structure finale: ${realDirectories} dossiers, ${realFiles} fichiers`)
    console.log(`🌳 Arbre hiérarchique construit avec ${sitemap.length} nœuds`)

    await browser.close()

    const result: FoldersEnumerationResult = {
      targetUrl,
      totalPages: sitemap.length,
      totalDirectories: directories.size,
      maxDepth: Math.max(...sitemap.map(p => p.depth)),
      sitemap,
      directories: Array.from(directories),
      files,
      forms,
      errors,
      statistics,
      discoveryMethods,
      security
    }

    console.log(`✅ Crawling terminé: ${result.totalPages} pages, ${result.totalDirectories} dossiers`)
    console.log(`📊 Méthodes de découverte: Sitemap: ${discoveryMethods.sitemap}, Crawl: ${discoveryMethods.crawl}, Robots: ${discoveryMethods.robots}`)
    return result

  } catch (error) {
    console.error('❌ Erreur lors du crawling:', error)
    
    if (browser) {
      await browser.close()
    }

    throw new Error(`Erreur lors de l'énumération des dossiers: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

async function setupPageAntiDetection(page: Page): Promise<void> {
  // Configurer un User-Agent aléatoire
  const { userAgent, headers } = getRandomHeaders()
  await page.setUserAgent(userAgent)
  await page.setExtraHTTPHeaders(headers)
  
  // Configurer une taille d'écran aléatoire
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 100),
    height: 1080 + Math.floor(Math.random() * 100)
  })
  
  // Désactiver les images pour accélérer le chargement - une seule fois
  if (!page.listenerCount('request')) {
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      // Vérifier si la requête n'est pas déjà traitée
      if (req.isInterceptResolutionHandled()) {
        return
      }
      
      if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort()
      } else {
        req.continue()
      }
    })
  }
  
  // Masquer les traces de Puppeteer
  await page.evaluateOnNewDocument(() => {
    // Supprimer les traces de webdriver
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    })
    
    // Ajouter des propriétés manquantes
    Object.defineProperty(navigator, 'languages', {
      get: () => ['fr-FR', 'fr', 'en-US', 'en'],
    })
    
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    })
  })
}

async function discoverUrlsFromSpecialFiles(
  page: Page,
  baseUrl: URL,
  urlsToProcess: Set<string>,
  discoveryMethods: any,
  security: any
): Promise<void> {
  // Liste exhaustive des fichiers sitemap courants
  const sitemapFiles = [
    'sitemap.xml',
    'sitemap_index.xml',
    'sitemapindex.xml',
    'sitemap-index.xml',
    'page-sitemap.xml',
    'post-sitemap.xml',
    'category-sitemap.xml',
    'product-sitemap.xml',
    'news-sitemap.xml',
    'image-sitemap.xml',
    'video-sitemap.xml',
    'mobile-sitemap.xml',
    'sitemap1.xml',
    'sitemap2.xml',
    'sitemap.xml.gz',
    'wp-sitemap.xml',
    'wp-sitemap-posts-post-1.xml',
    'wp-sitemap-posts-page-1.xml',
    'wp-sitemap-taxonomies-category-1.xml',
    'wp-sitemap-users-1.xml',
    'feed/',
    'rss.xml',
    'atom.xml'
  ]

  const robotsFile = 'robots.txt'
  const processedSitemaps = new Set<string>()

  // Fonction pour traiter un sitemap XML
  const processSitemap = async (sitemapUrl: string): Promise<void> => {
    if (processedSitemaps.has(sitemapUrl)) return
    processedSitemaps.add(sitemapUrl)

    try {
      console.log(`🗺️ Traitement du sitemap: ${sitemapUrl}`)
      await randomDelay(300, 800)
      const response = await page.goto(sitemapUrl, { timeout: 10000 })
      
      if (response && response.status() === 200) {
        const content = await response.text()
        
        // Vérifier si c'est un index de sitemaps
        if (content.includes('<sitemapindex') || content.includes('<sitemap>')) {
          console.log(`📋 Index de sitemaps détecté dans: ${sitemapUrl}`)
          const sitemapLinks = content.match(/<loc>(.*?)<\/loc>/gi)
          if (sitemapLinks) {
            for (const match of sitemapLinks) {
              const url = match.replace(/<\/?loc>/g, '').trim()
              if (url.includes('.xml') || url.includes('sitemap')) {
                await processSitemap(url) // Récursion pour traiter les sous-sitemaps
              }
            }
          }
        }
        
        // Extraire les URLs des pages
        const urlMatches = content.match(/<loc>(.*?)<\/loc>/gi)
        if (urlMatches) {
          let urlCount = 0
          urlMatches.forEach(match => {
            const url = match.replace(/<\/?loc>/g, '').trim()
            // Éviter d'ajouter d'autres sitemaps comme des pages
            if (!url.includes('sitemap') && !url.endsWith('.xml')) {
              urlsToProcess.add(url)
              discoveryMethods.sitemap++
              urlCount++
            }
          })
          console.log(`📍 ${urlCount} URLs de pages trouvées dans: ${sitemapUrl}`)
        }
        
        security.sensitiveFiles.push(sitemapUrl)
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors du traitement de ${sitemapUrl}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  // ÉTAPE 1: Analyser robots.txt pour trouver les sitemaps déclarés
  try {
    const robotsUrl = new URL(robotsFile, baseUrl.origin).toString()
    console.log(`🤖 Analyse de robots.txt: ${robotsUrl}`)
    await randomDelay(500, 1000)
    const response = await page.goto(robotsUrl, { timeout: 10000 })
    
    if (response && response.status() === 200) {
      const content = await response.text()
      console.log(`📄 Robots.txt trouvé et analysé`)
      
      // Extraire les sitemaps déclarés
      const sitemapUrls = content.match(/Sitemap:\s*(.+)/gi)
      if (sitemapUrls) {
        console.log(`🗺️ ${sitemapUrls.length} sitemaps déclarés dans robots.txt`)
        for (const match of sitemapUrls) {
          const url = match.replace(/Sitemap:\s*/i, '').trim()
          await processSitemap(url)
        }
      }
      
      // Extraire les chemins interdits qui peuvent révéler des dossiers
      const disallowUrls = content.match(/Disallow:\s*(.+)/gi)
      if (disallowUrls) {
        disallowUrls.forEach(match => {
          const path = match.replace(/Disallow:\s*/i, '').trim()
          if (path && path !== '/' && !path.includes('*') && path.length > 1) {
            try {
              const url = new URL(path, baseUrl.origin).toString()
              urlsToProcess.add(url)
              discoveryMethods.robots++
            } catch (e) {
              // Ignorer les chemins invalides
            }
          }
        })
      }
      
      security.sensitiveFiles.push(robotsUrl)
    }
  } catch (error) {
    console.log(`⚠️ Impossible d'accéder à robots.txt: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }

  // ÉTAPE 2: Tester les sitemaps courants si aucun n'a été trouvé dans robots.txt
  if (processedSitemaps.size === 0) {
    console.log(`🔍 Recherche de sitemaps courants...`)
    for (const sitemapFile of sitemapFiles) {
      try {
        const sitemapUrl = new URL(sitemapFile, baseUrl.origin).toString()
        await processSitemap(sitemapUrl)
      } catch (error) {
        // Continuer avec le prochain sitemap
      }
    }
  }

  // ÉTAPE 3: Recherche de sitemaps WordPress spécifiques
  const wpSitemapPatterns = [
    'wp-sitemap.xml',
    'wp-sitemap-posts-post-1.xml',
    'wp-sitemap-posts-page-1.xml',
    'wp-sitemap-taxonomies-category-1.xml',
    'wp-sitemap-taxonomies-post_tag-1.xml',
    'wp-sitemap-users-1.xml'
  ]

  console.log(`🔍 Recherche de sitemaps WordPress...`)
  for (const wpSitemap of wpSitemapPatterns) {
    try {
      const wpSitemapUrl = new URL(wpSitemap, baseUrl.origin).toString()
      await processSitemap(wpSitemapUrl)
    } catch (error) {
      // Continuer avec le prochain sitemap
    }
  }

  // ÉTAPE 4: Recherche de sitemaps numérotés (sitemap1.xml, sitemap2.xml, etc.)
  console.log(`🔍 Recherche de sitemaps numérotés...`)
  for (let i = 1; i <= 10; i++) {
    try {
      const numberedSitemapUrl = new URL(`sitemap${i}.xml`, baseUrl.origin).toString()
      await processSitemap(numberedSitemapUrl)
    } catch (error) {
      // Continuer avec le prochain sitemap
    }
  }

  // ÉTAPE 5: Recherche dans des dossiers courants
  const commonSitemapPaths = [
    'sitemaps/sitemap.xml',
    'xml/sitemap.xml',
    'feed/sitemap.xml',
    'wp-content/sitemap.xml',
    'content/sitemap.xml'
  ]

  console.log(`🔍 Recherche dans les dossiers courants...`)
  for (const sitemapPath of commonSitemapPaths) {
    try {
      const pathSitemapUrl = new URL(sitemapPath, baseUrl.origin).toString()
      await processSitemap(pathSitemapUrl)
    } catch (error) {
      // Continuer avec le prochain sitemap
    }
  }
  
  console.log(`✅ Découverte terminée: ${urlsToProcess.size} URLs trouvées, ${processedSitemaps.size} sitemaps traités`)
  console.log(`📊 Sitemaps découverts: ${Array.from(processedSitemaps).join(', ')}`)
}

async function checkSensitiveFilesInPage(url: string, security: any): Promise<void> {
  const baseUrl = new URL(url)
  const pathname = baseUrl.pathname.toLowerCase()
  
  // Vérifier les fichiers sensibles
  for (const sensitiveFile of SENSITIVE_FILES) {
    if (pathname.includes(sensitiveFile)) {
      security.sensitiveFiles.push(url)
      break
    }
  }
  
  // Vérifier les panneaux d'administration
  for (const adminPath of ADMIN_PATHS) {
    if (pathname.includes(adminPath)) {
      security.adminPanels.push(url)
      break
    }
  }
  
  // Vérifier les fichiers de configuration
  if (pathname.includes('config') || pathname.includes('settings') || pathname.includes('.env')) {
    security.configFiles.push(url)
  }
}

async function enumerateCommonDirectories(
  page: Page,
  baseUrl: URL,
  directories: Set<string>,
  security: any,
  discoveryMethods: any
): Promise<void> {
  console.log('🔍 Énumération des dossiers communs...')
  
  for (const dirPath of DIRECTORY_PATHS) {
    try {
      const dirUrl = new URL(dirPath + '/', baseUrl.origin).toString()
      await randomDelay(1000, 3000) // Délai plus long pour l'énumération
      await setupPageAntiDetection(page)
      
      const response = await page.goto(dirUrl, { timeout: 10000 })
      
      if (response && response.status() === 200) {
        const content = await response.text()
        
        // Vérifier si c'est un listing de dossier
        if (content.includes('Index of') || content.includes('Directory listing') || 
            content.includes('<title>Index of') || content.includes('Parent Directory')) {
          directories.add('/' + dirPath + '/')
          security.exposedDirectories.push(dirUrl)
          discoveryMethods.directory++
          console.log(`📁 Dossier exposé trouvé: ${dirPath}`)
        }
      }
    } catch (error) {
      // Ignorer les erreurs pour l'énumération
    }
  }
} 