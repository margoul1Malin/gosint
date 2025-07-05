import { NextRequest, NextResponse } from 'next/server'

interface ApiKeys {
  serpApi: string
}

interface DorkResult {
  dork: string
  query: string
  results: SearchResult[]
  error?: string
}

interface SearchResult {
  title: string
  link: string
  snippet?: string
  position?: number
}

// Liste des dorks prédéfinis basée sur le script fourni
const PREDEFINED_DORKS = [
  'site:facebook.com intext:"{}"',
  'site:twitter.com intext:"{}"',
  'site:linkedin.com intext:"{}"',
  'site:linkedin.com/in/ intext:"{}"',
  'site:instagram.com intext:"{}"',
  'site:vk.com intext:"{}"',
  'site:tiktok.com/@ intext:"{}"',
  'site:snapchat.com/add/ intext:"{}"',
  'site:hs3x.com intext:"{}"',
  'site:receive-sms-now.com intext:"{}"',
  'site:smslisten.com intext:"{}"',
  'site:smsnumbersonline.com intext:"{}"',
  'site:freesmscode.com intext:"{}"',
  'site:whosenumber.info intext:"{}" intitle:"who called"',
  'intitle:"Phone Fraud" intext:"{}"',
  'site:findwhocallsme.com intext:"{}"',
  'site:annuaire-inverse.net intext:"{}"',
  'site:leboncoin.fr intext:"{}"',
  'site:pagesjaunes.fr intext:"{}"',
  'site:forums.jeuxvideo.com intext:"{}"',
  'site:commentcamarche.net intext:"{}"',
  'site:societe.com intext:"{}"',
  'site:numinfo.net intext:"{}"',
  'site:sync.me intext:"{}"',
  'site:pastebin.com intext:"{}"',
  'site:ghostbin.com intext:"{}"',
  'site:justpaste.it intext:"{}"',
  'site:controlc.com intext:"{}"',
  'site:hastebin.com intext:"{}"',
  'site:haveibeenpwned.com intext:"{}"',
  'site:breachdirectory.org intext:"{}"',
  'site:dehashed.com intext:"{}"',
  'site:snusbase.com intext:"{}"',
  'site:leak-lookup.com intext:"{}"',
  'site:intelx.io intext:"{}"',
  'site:exposedrips.net intext:"{}"',
  'site:dark.fail intext:"{}"',
  'site:pastebin.com intext:"{} password"',
  'site:ghostbin.com intext:"{} password"',
  'site:justpaste.it intext:"{} password"',
  'site:controlc.com intext:"{} password"',
  'site:hastebin.com intext:"{} password"',
  'intext:"{} password"',
  'intext:"{} email password"',
  'intext:"{} leaked"',
  'intext:"{} breach"',
  'intext:"{} dump"',
  'intext:"{} credentials"',
  'intext:"{} hacked"',
]

// Fonction pour effectuer une recherche avec un dork spécifique
async function searchDork(target: string, dork: string, apiKey: string): Promise<DorkResult> {
  const query = dork.replace('{}', target)
  
  try {
    // Construire l'URL avec les paramètres comme dans le script Python
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: apiKey,
      num: '5'
    })

    const url = `https://serpapi.com/search?${params.toString()}`
    console.log(`Recherche: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'AOSINT-Google-Dorking/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erreur HTTP ${response.status}: ${errorText}`)
      return {
        dork,
        query,
        results: [],
        error: `Erreur API SerpApi: ${response.status} - ${errorText}`
      }
    }

    const data = await response.json()
    
    if (data.error) {
      console.error(`Erreur SerpApi: ${data.error}`)
      return {
        dork,
        query,
        results: [],
        error: `Erreur SerpApi: ${data.error}`
      }
    }

    const results: SearchResult[] = []
    
    if (data.organic_results && data.organic_results.length > 0) {
      data.organic_results.forEach((result: any, index: number) => {
        results.push({
          title: result.title || 'Pas de titre',
          link: result.link || '',
          snippet: result.snippet || '',
          position: index + 1
        })
      })
      console.log(`Dork "${dork}" - ${results.length} résultats trouvés`)
    } else {
      console.log(`Dork "${dork}" - Aucun résultat`)
    }

    return {
      dork,
      query,
      results
    }

  } catch (error) {
    console.error(`Exception pour dork "${dork}":`, error)
    return {
      dork,
      query,
      results: [],
      error: `Exception: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
  }
}

// Fonction pour ajouter un délai entre les requêtes
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  try {
    const { target, apiKeys } = await request.json()

    if (!target) {
      return NextResponse.json({ error: 'Cible requise' }, { status: 400 })
    }

    if (!apiKeys?.serpApi) {
      return NextResponse.json({ error: 'Clé API SerpApi requise' }, { status: 400 })
    }

    console.log(`🎯 Début de la recherche Google Dorking pour: ${target}`)
    console.log(`🔑 Utilisation de la clé API: ${apiKeys.serpApi.substring(0, 10)}...`)

    const results: DorkResult[] = []
    let totalResults = 0
    let successfulDorks = 0
    let errors = 0

    // Traiter chaque dork avec un délai pour éviter les limites de taux
    for (let i = 0; i < PREDEFINED_DORKS.length; i++) {
      const dork = PREDEFINED_DORKS[i]
      
      console.log(`➡️  Recherche avec dork ${i + 1}/${PREDEFINED_DORKS.length}: ${dork.replace('{}', target)}`)
      
      const result = await searchDork(target, dork, apiKeys.serpApi)
      results.push(result)
      
      if (result.error) {
        errors++
        console.log(`❌ Erreur pour dork ${i + 1}: ${result.error}`)
      } else {
        if (result.results.length > 0) {
          successfulDorks++
          totalResults += result.results.length
          console.log(`✅ Dork ${i + 1} - ${result.results.length} résultats trouvés`)
        } else {
          console.log(`⚪ Dork ${i + 1} - Aucun résultat`)
        }
      }
      
      // Ajouter un délai de 200ms entre les requêtes pour respecter les limites de taux
      if (i < PREDEFINED_DORKS.length - 1) {
        await delay(200)
      }
    }

    console.log(`🏁 Recherche terminée. ${successfulDorks} dorks avec résultats, ${totalResults} résultats totaux, ${errors} erreurs`)

    return NextResponse.json({
      results,
      summary: {
        totalDorks: PREDEFINED_DORKS.length,
        successfulDorks,
        totalResults,
        errors
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la recherche Google Dorking:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
} 