import puppeteer, { Browser, Page } from 'puppeteer'

export interface Technology {
  name: string
  category: string
  version?: string
  confidence: number
  description: string
  website?: string
  icon?: string
}

export interface TechAnalysisResult {
  url: string
  technologies: Technology[]
  categories: { [key: string]: Technology[] }
  summary: {
    totalTechnologies: number
    categoriesFound: number
    riskLevel: 'low' | 'medium' | 'high'
    securityIssues: string[]
  }
  metadata: {
    title: string
    description: string
    generator?: string
    viewport?: string
    charset?: string
  }
  performance: {
    loadTime: number
    responseTime: number
    resourcesCount: number
    errors: string[]
  }
}

interface TechPattern {
  html?: RegExp[]
  script?: RegExp[]
  css?: RegExp[]
  headers?: { [key: string]: RegExp }
  meta?: { [key: string]: RegExp }
  dom?: string[]
  js?: string[]
  cookies?: string[]
  dns?: string[]
}

interface TechSignature {
  category: string
  description: string
  website: string
  patterns: TechPattern
}

// Base de données complète de signatures technologiques
const TECH_SIGNATURES: { [key: string]: TechSignature } = {
  // Frameworks JavaScript
  'React': {
    category: 'Framework JavaScript',
    description: 'Bibliothèque JavaScript pour créer des interfaces utilisateur',
    website: 'https://reactjs.org',
    patterns: {
      html: [/__REACT_DEVTOOLS_GLOBAL_HOOK__/, /react-dom/, /data-reactroot/],
      script: [/react\.js/, /react\.min\.js/, /react-dom/, /React\.createElement/],
      headers: { 'x-powered-by': /react/i },
      meta: { generator: /react/i },
      dom: ['[data-reactroot]', '[data-react-helmet]'],
      js: ['React', 'ReactDOM', '__REACT_DEVTOOLS_GLOBAL_HOOK__']
    }
  },
  'Next.js': {
    category: 'Framework web',
    description: 'Framework React pour la production',
    website: 'https://nextjs.org',
    patterns: {
      html: [/__NEXT_DATA__/, /_next\/static/, /next\.js/],
      script: [/_next\/static/, /next\.js/, /__NEXT_DATA__/],
      headers: { 'x-powered-by': /next\.js/i },
      meta: { generator: /next\.js/i },
      dom: ['#__next', '[data-next]'],
      js: ['__NEXT_DATA__', 'next']
    }
  },
  'Vue.js': {
    category: 'Framework JavaScript',
    description: 'Framework JavaScript progressif',
    website: 'https://vuejs.org',
    patterns: {
      html: [/vue\.js/, /v-if/, /v-for/, /{{.*}}/],
      script: [/vue\.js/, /vue\.min\.js/, /Vue\.createApp/],
      headers: { 'x-powered-by': /vue/i },
      dom: ['[v-cloak]', '[data-v-]'],
      js: ['Vue', '__VUE__']
    }
  },
  'Angular': {
    category: 'Framework JavaScript',
    description: 'Plateforme de développement web',
    website: 'https://angular.io',
    patterns: {
      html: [/ng-app/, /ng-controller/, /angular\.js/],
      script: [/angular\.js/, /angular\.min\.js/, /@angular/],
      dom: ['[ng-app]', '[ng-controller]'],
      js: ['angular', 'ng']
    }
  },
  'Svelte': {
    category: 'Framework JavaScript',
    description: 'Framework JavaScript compilé',
    website: 'https://svelte.dev',
    patterns: {
      html: [/svelte/, /_app\/immutable/],
      script: [/svelte/, /_app\/immutable/],
      js: ['__SVELTE__']
    }
  },

  // Frameworks CSS
  'Tailwind CSS': {
    category: 'Frameworks UI',
    description: 'Framework CSS utility-first',
    website: 'https://tailwindcss.com',
    patterns: {
      html: [/tailwind/, /tw-/, /bg-\w+/, /text-\w+/, /p-\d+/, /m-\d+/],
      css: [/tailwind/, /--tw-/, /@tailwind/],
      dom: ['[class*="bg-"]', '[class*="text-"]', '[class*="p-"]']
    }
  },
  'Bootstrap': {
    category: 'Frameworks UI',
    description: 'Framework CSS populaire',
    website: 'https://getbootstrap.com',
    patterns: {
      html: [/bootstrap/, /btn-/, /container/, /row/, /col-/],
      css: [/bootstrap/, /\.btn/, /\.container/],
      script: [/bootstrap\.js/, /bootstrap\.min\.js/]
    }
  },
  'Radix UI': {
    category: 'Frameworks UI',
    description: 'Composants UI low-level',
    website: 'https://radix-ui.com',
    patterns: {
      html: [/radix-ui/, /data-radix/],
      script: [/@radix-ui/],
      dom: ['[data-radix-collection-item]', '[data-radix-portal]']
    }
  },
  'shadcn/ui': {
    category: 'Frameworks UI',
    description: 'Composants UI réutilisables',
    website: 'https://ui.shadcn.com',
    patterns: {
      html: [/shadcn/, /cn\(/],
      script: [/shadcn/, /class-variance-authority/],
      css: [/--radius/, /--background/, /--foreground/]
    }
  },

  // CMS
  'WordPress': {
    category: 'CMS',
    description: 'Système de gestion de contenu',
    website: 'https://wordpress.org',
    patterns: {
      html: [/wp-content/, /wp-includes/, /wordpress/],
      headers: { 'x-powered-by': /wordpress/i },
      meta: { generator: /wordpress/i },
      dom: ['[class*="wp-"]', '#wp-admin-bar']
    }
  },
  'Drupal': {
    category: 'CMS',
    description: 'Système de gestion de contenu',
    website: 'https://drupal.org',
    patterns: {
      html: [/drupal/, /sites\/default/, /misc\/drupal/],
      headers: { 'x-powered-by': /drupal/i },
      meta: { generator: /drupal/i }
    }
  },

  // Serveurs web
  'Apache': {
    category: 'Serveur web',
    description: 'Serveur HTTP Apache',
    website: 'https://httpd.apache.org',
    patterns: {
      headers: { 'server': /apache/i }
    }
  },
  'Nginx': {
    category: 'Serveur web',
    description: 'Serveur web et proxy inverse',
    website: 'https://nginx.org',
    patterns: {
      headers: { 'server': /nginx/i }
    }
  },

  // Langages de programmation
  'PHP': {
    category: 'Langage de programmation',
    description: 'Langage de script côté serveur',
    website: 'https://php.net',
    patterns: {
      html: [/\.php/, /PHPSESSID/],
      headers: { 'x-powered-by': /php/i },
      cookies: ['PHPSESSID']
    }
  },
  'Python': {
    category: 'Langage de programmation',
    description: 'Langage de programmation',
    website: 'https://python.org',
    patterns: {
      headers: { 'server': /python/i, 'x-powered-by': /python/i }
    }
  },
  'Node.js': {
    category: 'Langage de programmation',
    description: 'Runtime JavaScript',
    website: 'https://nodejs.org',
    patterns: {
      headers: { 'x-powered-by': /express|node/i }
    }
  },

  // Analytics
  'Google Analytics': {
    category: 'Analytics',
    description: 'Service d\'analyse web',
    website: 'https://analytics.google.com',
    patterns: {
      html: [/google-analytics/, /gtag\(/, /ga\(/],
      script: [/google-analytics/, /gtag/, /googletagmanager/],
      js: ['gtag', 'ga', '_gaq']
    }
  },
  'Google Tag Manager': {
    category: 'Analytics',
    description: 'Système de gestion des balises',
    website: 'https://tagmanager.google.com',
    patterns: {
      html: [/googletagmanager/, /GTM-/],
      script: [/googletagmanager/, /GTM-/],
      js: ['dataLayer']
    }
  },

  // CDN
  'Cloudflare': {
    category: 'CDN',
    description: 'Réseau de diffusion de contenu',
    website: 'https://cloudflare.com',
    patterns: {
      headers: { 'cf-ray': /.+/, 'server': /cloudflare/i },
      dns: ['cloudflare']
    }
  },
  'AWS CloudFront': {
    category: 'CDN',
    description: 'CDN Amazon Web Services',
    website: 'https://aws.amazon.com/cloudfront',
    patterns: {
      headers: { 'x-amz-cf-id': /.+/, 'via': /cloudfront/i }
    }
  },

  // Sécurité
  'HSTS': {
    category: 'Sécurité',
    description: 'HTTP Strict Transport Security',
    website: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
    patterns: {
      headers: { 'strict-transport-security': /.+/ }
    }
  },

  // E-commerce
  'Stripe': {
    category: 'Service de paiement',
    description: 'Plateforme de paiement en ligne',
    website: 'https://stripe.com',
    patterns: {
      html: [/stripe/, /js\.stripe\.com/],
      script: [/js\.stripe\.com/, /stripe\.js/],
      js: ['Stripe']
    }
  },
  'PayPal': {
    category: 'Service de paiement',
    description: 'Service de paiement en ligne',
    website: 'https://paypal.com',
    patterns: {
      html: [/paypal/, /paypalobjects/],
      script: [/paypal/, /paypalobjects/],
      js: ['paypal']
    }
  },
  'BitPay': {
    category: 'Service de paiement',
    description: 'Processeur de paiement Bitcoin',
    website: 'https://bitpay.com',
    patterns: {
      html: [/bitpay/],
      script: [/bitpay/],
      js: ['bitpay']
    }
  },

  // Outils de build
  'Webpack': {
    category: 'Divers',
    description: 'Bundler de modules JavaScript',
    website: 'https://webpack.js.org',
    patterns: {
      html: [/webpack/, /__webpack_require__/],
      script: [/webpack/, /__webpack_require__/],
      js: ['__webpack_require__', 'webpackJsonp']
    }
  },
  'Vite': {
    category: 'Divers',
    description: 'Outil de build frontend',
    website: 'https://vitejs.dev',
    patterns: {
      html: [/vite/, /@vite/],
      script: [/vite/, /@vite/]
    }
  },

  // PaaS
  'Vercel': {
    category: 'PaaS',
    description: 'Plateforme de déploiement',
    website: 'https://vercel.com',
    patterns: {
      headers: { 'x-vercel-id': /.+/, 'server': /vercel/i },
      dns: ['vercel']
    }
  },
  'Netlify': {
    category: 'PaaS',
    description: 'Plateforme de déploiement JAMstack',
    website: 'https://netlify.com',
    patterns: {
      headers: { 'x-nf-request-id': /.+/, 'server': /netlify/i }
    }
  },

  // Générateurs de sites statiques
  'Gatsby': {
    category: 'Générateur de site statique',
    description: 'Générateur de site statique React',
    website: 'https://gatsbyjs.com',
    patterns: {
      html: [/gatsby/, /__gatsby/],
      script: [/gatsby/, /__gatsby/],
      js: ['___gatsby', '__GATSBY_BROWSER_BUNDLE__']
    }
  },
  'Nuxt.js': {
    category: 'Générateur de site statique',
    description: 'Framework Vue.js',
    website: 'https://nuxtjs.org',
    patterns: {
      html: [/nuxt/, /__nuxt/],
      script: [/nuxt/, /__nuxt/],
      js: ['__NUXT__']
    }
  }
}

export async function executeTechAnalysis(url: string): Promise<TechAnalysisResult> {
  const startTime = Date.now()
  let browser: Browser | null = null
  
  try {
    // Normaliser l'URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    console.log(`🔍 Analyse des technologies pour: ${url}`)

    // Lancer Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    })

    const page = await browser.newPage()
    
    // Configurer le user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Intercepter les requêtes pour analyser les headers
    const headers: { [key: string]: string } = {}
    const resources: string[] = []
    
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      request.continue()
    })

    page.on('response', (response) => {
      const responseHeaders = response.headers()
      Object.assign(headers, responseHeaders)
      resources.push(response.url())
    })

    // Naviguer vers la page
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    if (!response) {
      throw new Error('Impossible de charger la page')
    }

    const responseTime = Date.now() - startTime

    // Récupérer le contenu HTML
    const html = await page.content()
    
    // Récupérer les métadonnées
    const metadata = await page.evaluate(() => {
      const getMetaContent = (name: string) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
        return meta ? meta.getAttribute('content') : null
      }

      return {
        title: document.title,
        description: getMetaContent('description') || '',
        generator: getMetaContent('generator') || undefined,
        viewport: getMetaContent('viewport') || undefined,
        charset: document.characterSet
      }
    })

    // Récupérer les scripts et CSS
    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).map(script => ({
        src: script.src,
        content: script.innerHTML
      }))
    })

    const stylesheets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(style => ({
        href: style.getAttribute('href'),
        content: style.innerHTML
      }))
    })

    // Récupérer les variables JavaScript globales
    const jsGlobals = await page.evaluate(() => {
      const globals: string[] = []
      const commonGlobals = [
        'React', 'ReactDOM', 'Vue', 'angular', 'jQuery', '$', 'Stripe', 'gtag', 'ga', 'dataLayer',
        '__NEXT_DATA__', '__NUXT__', '___gatsby', '__webpack_require__', '__REACT_DEVTOOLS_GLOBAL_HOOK__'
      ]
      
      commonGlobals.forEach(global => {
        if (typeof (window as any)[global] !== 'undefined') {
          globals.push(global)
        }
      })
      
      return globals
    })

    // Récupérer les cookies
    const cookies = await page.cookies()

    // Analyser les technologies
    const detectedTechnologies = await analyzeTechnologies({
      html,
      headers,
      scripts,
      stylesheets,
      jsGlobals,
      cookies: cookies.map(c => c.name),
      url,
      metadata
    })

    const loadTime = Date.now() - startTime

    // Grouper par catégorie
    const categories: { [key: string]: Technology[] } = {}
    detectedTechnologies.forEach(tech => {
      if (!categories[tech.category]) {
        categories[tech.category] = []
      }
      categories[tech.category].push(tech)
    })

    // Analyser les problèmes de sécurité
    const securityIssues = analyzeSecurityIssues(headers, detectedTechnologies)

    await browser.close()

    return {
      url,
      technologies: detectedTechnologies,
      categories,
      summary: {
        totalTechnologies: detectedTechnologies.length,
        categoriesFound: Object.keys(categories).length,
        riskLevel: calculateRiskLevel(securityIssues),
        securityIssues
      },
      metadata,
      performance: {
        loadTime,
        responseTime,
        resourcesCount: resources.length,
        errors: []
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error)
    
    if (browser) {
      await browser.close()
    }

    throw new Error(`Erreur lors de l'analyse des technologies: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

interface AnalysisContext {
  html: string
  headers: { [key: string]: string }
  scripts: { src: string; content: string }[]
  stylesheets: { href: string | null; content: string }[]
  jsGlobals: string[]
  cookies: string[]
  url: string
  metadata: any
}

async function analyzeTechnologies(context: AnalysisContext): Promise<Technology[]> {
  const detected: Technology[] = []
  const { html, headers, scripts, stylesheets, jsGlobals, cookies, metadata } = context

  // Analyser chaque signature technologique
  for (const [techName, techData] of Object.entries(TECH_SIGNATURES)) {
    let confidence = 0
    const { patterns } = techData
    
    // Vérifier les patterns HTML
    if (patterns.html) {
      for (const pattern of patterns.html) {
        if (pattern.test(html)) {
          confidence += 25
          break
        }
      }
    }

    // Vérifier les headers HTTP
    if (patterns.headers) {
      for (const [headerName, headerPattern] of Object.entries(patterns.headers)) {
        const headerValue = headers[headerName.toLowerCase()]
        if (headerValue && headerPattern.test(headerValue)) {
          confidence += 30
        }
      }
    }

    // Vérifier les scripts
    if (patterns.script) {
      for (const pattern of patterns.script) {
        const found = scripts.some(script => 
          pattern.test(script.src) || pattern.test(script.content)
        )
        if (found) {
          confidence += 25
          break
        }
      }
    }

    // Vérifier les CSS
    if (patterns.css) {
      for (const pattern of patterns.css) {
        const found = stylesheets.some(style => 
          (style.href && pattern.test(style.href)) || pattern.test(style.content)
        )
        if (found) {
          confidence += 20
          break
        }
      }
    }

    // Vérifier les variables JavaScript globales
    if (patterns.js) {
      for (const jsVar of patterns.js) {
        if (jsGlobals.includes(jsVar)) {
          confidence += 30
        }
      }
    }

    // Vérifier les cookies
    if (patterns.cookies) {
      for (const cookieName of patterns.cookies) {
        if (cookies.includes(cookieName)) {
          confidence += 15
        }
      }
    }

    // Vérifier les métadonnées
    if (patterns.meta) {
      for (const [metaName, metaPattern] of Object.entries(patterns.meta)) {
        const metaValue = metadata[metaName]
        if (metaValue && metaPattern.test(metaValue)) {
          confidence += 25
        }
      }
    }

    // Vérifier les éléments DOM (patterns spéciaux)
    if (patterns.dom) {
      for (const domPattern of patterns.dom) {
        if (html.includes(domPattern) || new RegExp(domPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(html)) {
          confidence += 20
        }
      }
    }

    // Si la confiance est suffisante, ajouter la technologie
    if (confidence >= 20) {
      detected.push({
        name: techName,
        category: techData.category,
        confidence: Math.min(confidence, 100),
        description: techData.description,
        website: techData.website
      })
    }
  }

  // Trier par confiance décroissante
  return detected.sort((a, b) => b.confidence - a.confidence)
}

function analyzeSecurityIssues(headers: { [key: string]: string }, technologies: Technology[]): string[] {
  const issues: string[] = []

  // Vérifier HTTPS
  if (!headers['strict-transport-security']) {
    issues.push('HSTS non configuré')
  }

  // Vérifier les headers de sécurité
  if (!headers['x-frame-options'] && !headers['content-security-policy']) {
    issues.push('Protection contre le clickjacking manquante')
  }

  if (!headers['x-content-type-options']) {
    issues.push('Header X-Content-Type-Options manquant')
  }

  // Vérifier les technologies obsolètes
  const outdatedTechs = technologies.filter(tech => 
    tech.name.includes('jQuery') && tech.version && parseFloat(tech.version) < 3.0
  )

  if (outdatedTechs.length > 0) {
    issues.push('Technologies obsolètes détectées')
  }

  return issues
}

function calculateRiskLevel(securityIssues: string[]): 'low' | 'medium' | 'high' {
  if (securityIssues.length === 0) return 'low'
  if (securityIssues.length <= 2) return 'medium'
  return 'high'
} 