import { NextRequest, NextResponse } from 'next/server'

interface GoogleDorksResult {
  category: string
  site: string
  found: boolean
  url: string
}

// Fonction pour normaliser le numéro de téléphone
function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/[^\d+]/g, '')
  
  if (normalized.startsWith('0')) {
    normalized = '+33' + normalized.substring(1)
  }
  
  if (!normalized.startsWith('+')) {
    normalized = '+33' + normalized
  }
  
  return normalized
}

// Fonction pour générer les différents formats du numéro
function generatePhoneFormats(normalizedPhone: string) {
  const withoutPlus = normalizedPhone.replace('+', '')
  const withPlus = normalizedPhone
  const localFormat = '0' + normalizedPhone.substring(3)
  const spacedFormat = localFormat.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  
  return {
    withoutPlus,
    withPlus,
    localFormat,
    spacedFormat
  }
}

// Fonction pour vérifier si une URL Google retourne des résultats
async function checkGoogleDork(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      return false
    }
    
    const html = await response.text()
    
    // Vérifier si Google retourne des résultats
    // Si la page contient "did not match any documents" ou "No results found", il n'y a pas de résultats
    const noResultsPatterns = [
      'did not match any documents',
      'No results found',
      'Aucun document ne correspond',
      'Aucun résultat trouvé'
    ]
    
    const hasNoResults = noResultsPatterns.some(pattern => 
      html.toLowerCase().includes(pattern.toLowerCase())
    )
    
    // Vérifier s'il y a des résultats de recherche
    const hasResults = html.includes('class="g"') || html.includes('class="tF2Cxc"')
    
    return hasResults && !hasNoResults
  } catch (error) {
    console.error('Erreur lors de la vérification Google Dork:', error)
    return false
  }
}

// Fonction pour créer les URLs Google Dorks
function createGoogleDorksUrls(formats: any) {
  const { withoutPlus, withPlus, localFormat, spacedFormat } = formats
  
  const dorks = [
    // Social Media
    {
      category: 'Social Media',
      site: 'facebook.com',
      url: `https://www.google.com/search?q=site%3Afacebook.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'twitter.com',
      url: `https://www.google.com/search?q=site%3Atwitter.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'linkedin.com',
      url: `https://www.google.com/search?q=site%3Alinkedin.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'linkedin.com/in/',
      url: `https://www.google.com/search?q=site%3Alinkedin.com%2Fin%2F+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'instagram.com',
      url: `https://www.google.com/search?q=site%3Ainstagram.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'vk.com',
      url: `https://www.google.com/search?q=site%3Avk.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'tiktok.com/@',
      url: `https://www.google.com/search?q=site%3Atiktok.com%2F%40+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Social Media',
      site: 'snapchat.com/add/',
      url: `https://www.google.com/search?q=site%3Asnapchat.com%2Fadd%2F+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    
    // Disposable Providers
    {
      category: 'Disposable Providers',
      site: 'hs3x.com',
      url: `https://www.google.com/search?q=site%3Ahs3x.com+intext%3A%22${withoutPlus}%22`
    },
    {
      category: 'Disposable Providers',
      site: 'receive-sms-now.com',
      url: `https://www.google.com/search?q=site%3Areceive-sms-now.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Disposable Providers',
      site: 'smslisten.com',
      url: `https://www.google.com/search?q=site%3Asmslisten.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Disposable Providers',
      site: 'smsnumbersonline.com',
      url: `https://www.google.com/search?q=site%3Asmsnumbersonline.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Disposable Providers',
      site: 'freesmscode.com',
      url: `https://www.google.com/search?q=site%3Afreesmscode.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    
    // Reputation
    {
      category: 'Reputation',
      site: 'whosenumber.info',
      url: `https://www.google.com/search?q=site%3Awhosenumber.info+intext%3A%22${withPlus}%22+intitle%3A%22who+called%22`
    },
    {
      category: 'Reputation',
      site: 'Phone Fraud',
      url: `https://www.google.com/search?q=intitle%3A%22Phone+Fraud%22+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Reputation',
      site: 'findwhocallsme.com',
      url: `https://www.google.com/search?q=site%3Afindwhocallsme.com+intext%3A%22${withPlus}%22+%7C+intext%3A%22${withoutPlus}%22`
    },
    {
      category: 'Reputation',
      site: 'annuaire-inverse.net',
      url: `https://www.google.com/search?q=site%3Aannuaire-inverse.net+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    
    // French Sites
    {
      category: 'French Sites',
      site: 'leboncoin.fr',
      url: `https://www.google.com/search?q=site%3Aleboncoin.fr+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'French Sites',
      site: 'pagesjaunes.fr',
      url: `https://www.google.com/search?q=site%3Apagesjaunes.fr+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'French Sites',
      site: 'forums.jeuxvideo.com',
      url: `https://www.google.com/search?q=site%3Aforums.jeuxvideo.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'French Sites',
      site: 'commentcamarche.net',
      url: `https://www.google.com/search?q=site%3Acommentcamarche.net+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'French Sites',
      site: 'societe.com',
      url: `https://www.google.com/search?q=site%3Asociete.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    
    // Individuals
    {
      category: 'Individuals',
      site: 'numinfo.net',
      url: `https://www.google.com/search?q=site%3Anuminfo.net+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Individuals',
      site: 'sync.me',
      url: `https://www.google.com/search?q=site%3Async.me+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Individuals',
      site: 'pastebin.com',
      url: `https://www.google.com/search?q=site%3Apastebin.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Individuals',
      site: 'ghostbin.com',
      url: `https://www.google.com/search?q=site%3Aghostbin.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Individuals',
      site: 'justpaste.it',
      url: `https://www.google.com/search?q=site%3Ajustpaste.it+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Individuals',
      site: 'controlc.com',
      url: `https://www.google.com/search?q=site%3Acontrolc.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    {
      category: 'Individuals',
      site: 'hastebin.com',
      url: `https://www.google.com/search?q=site%3Ahastebin.com+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    },
    
    // General
    {
      category: 'General',
      site: 'General Search',
      url: `https://www.google.com/search?q=intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22+%7C+intext%3A%22${spacedFormat}%22`
    },
    {
      category: 'General',
      site: 'Documents',
      url: `https://www.google.com/search?q=%28ext%3Adoc+%7C+ext%3Adocx+%7C+ext%3Aodt+%7C+ext%3Apdf+%7C+ext%3Artf+%7C+ext%3Atxt+%7C+ext%3Axls%29+intext%3A%22${withoutPlus}%22+%7C+intext%3A%22${withPlus}%22+%7C+intext%3A%22${localFormat}%22`
    }
  ]
  
  return dorks
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    const formats = generatePhoneFormats(normalizedPhone)
    
    // Créer les URLs Google Dorks
    const dorksUrls = createGoogleDorksUrls(formats)
    
    // Vérifier chaque dork (limiter à 5 en parallèle pour éviter d'être bloqué)
    const results: GoogleDorksResult[] = []
    const batchSize = 5
    
    for (let i = 0; i < dorksUrls.length; i += batchSize) {
      const batch = dorksUrls.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async (dork) => {
          const found = await checkGoogleDork(dork.url)
          return {
            category: dork.category,
            site: dork.site,
            found,
            url: dork.url
          }
        })
      )
      
      results.push(...batchResults)
      
      // Délai entre les batches pour éviter d'être bloqué
      if (i + batchSize < dorksUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    return NextResponse.json({
      phoneNumber: normalizedPhone,
      results,
      summary: {
        totalChecks: results.length,
        foundResults: results.filter(r => r.found).length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification Google Dorks:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 