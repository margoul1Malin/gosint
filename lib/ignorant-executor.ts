import { spawn, ChildProcess } from 'child_process'

export interface IgnorantResult {
  site: string
  found: boolean
  url?: string
}

export async function executeIgnorant(countryCode: string, phoneNumber: string): Promise<IgnorantResult[]> {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Démarrage d'Ignorant pour: ${countryCode} ${phoneNumber}`)
    
    const childProcess: ChildProcess = spawn('pynv/bin/ignorant', [countryCode, phoneNumber], {
      cwd: process.cwd()
    })

    let stdout = ''
    let stderr = ''

    childProcess.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      stdout += chunk
      console.log(`Ignorant stdout: ${chunk}`)
    })

    childProcess.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      stderr += chunk
      console.log(`Ignorant stderr: ${chunk}`)
    })

    const timeout = setTimeout(() => {
      console.log('⏰ Timeout Ignorant atteint')
      childProcess.kill('SIGTERM')
      reject(new Error('Timeout: Ignorant a pris trop de temps'))
    }, 60000)

    childProcess.on('close', async (code: number | null) => {
      clearTimeout(timeout)
      
      // Attendre 2 secondes pour s'assurer que tous les résultats sont reçus
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`Ignorant terminé avec le code: ${code}`)
      
      try {
        const results = parseIgnorantOutput(stdout)
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })

    childProcess.on('error', (error: Error) => {
      clearTimeout(timeout)
      console.error('Erreur Ignorant:', error)
      reject(error)
    })
  })
}

function parseIgnorantOutput(output: string): IgnorantResult[] {
  const results: IgnorantResult[] = []
  const lines = output.split('\n')
  
  console.log('🔍 Parsing Ignorant output:')
  console.log(output)
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Ignorer les lignes vides ou d'information
    if (trimmedLine.length === 0 || 
        trimmedLine.includes('websites checked') ||
        trimmedLine.includes('Twitter :') ||
        trimmedLine.includes('Github :') ||
        trimmedLine.includes('For BTC') ||
        trimmedLine.includes('100%') ||
        trimmedLine.includes('█') ||
        trimmedLine.includes('Phone number used') ||
        trimmedLine.includes('Phone number not used') ||
        trimmedLine.includes('Rate limit')) {
      continue
    }
    
    // Chercher les résultats positifs [+] site.com
    const foundMatch = trimmedLine.match(/\[\+\]\s*(.+?)(?:\s|$)/)
    if (foundMatch) {
      const site = foundMatch[1].trim()
      
      if (site && !site.includes('Phone number')) {
        results.push({
          site,
          found: true,
          url: getSiteUrl(site)
        })
        console.log(`✅ Trouvé: ${site}`)
      }
    }
    
    // Chercher les résultats négatifs [-] site.com
    const notFoundMatch = trimmedLine.match(/\[-\]\s*(.+?)(?:\s|$)/)
    if (notFoundMatch) {
      const site = notFoundMatch[1].trim()
      
      if (site && !site.includes('Phone number')) {
        results.push({
          site,
          found: false
        })
        console.log(`❌ Non trouvé: ${site}`)
      }
    }
    
    // Chercher les résultats avec rate limit [x] site.com
    const rateLimitMatch = trimmedLine.match(/\[x\]\s*(.+?)(?:\s|$)/)
    if (rateLimitMatch) {
      const site = rateLimitMatch[1].trim()
      
      if (site && !site.includes('Rate limit')) {
        results.push({
          site,
          found: false,
          url: getSiteUrl(site)
        })
        console.log(`⚠️ Rate limit: ${site}`)
      }
    }
  }
  
  console.log(`📊 Résultats parsés: ${results.length}`)
  
  // Si aucun résultat n'a été parsé, essayer une méthode alternative
  if (results.length === 0) {
    console.log('🔄 Tentative de parsing alternatif...')
    return parseIgnorantAlternative(output)
  }
  
  return results
}

function parseIgnorantAlternative(output: string): IgnorantResult[] {
  const commonSites = [
    'WhatsApp', 'Telegram', 'Viber', 'Signal', 'Facebook', 'Instagram',
    'Twitter', 'LinkedIn', 'Snapchat', 'TikTok', 'Discord', 'Skype'
  ]
  
  return commonSites.map(site => ({
    site,
    found: output.toLowerCase().includes(site.toLowerCase()),
    url: getSiteUrl(site)
  }))
}

function getSiteUrl(siteName: string): string {
  // Si le nom contient déjà un domaine, l'utiliser directement
  if (siteName.includes('.com') || siteName.includes('.org') || siteName.includes('.net')) {
    return `https://${siteName}`
  }
  
  const siteUrls: Record<string, string> = {
    'amazon': 'https://amazon.com',
    'instagram': 'https://instagram.com',
    'snapchat': 'https://snapchat.com',
    'facebook': 'https://facebook.com',
    'twitter': 'https://twitter.com',
    'linkedin': 'https://linkedin.com',
    'tiktok': 'https://tiktok.com',
    'whatsapp': 'https://whatsapp.com',
    'telegram': 'https://telegram.org',
    'viber': 'https://viber.com',
    'signal': 'https://signal.org',
    'discord': 'https://discord.com',
    'skype': 'https://skype.com',
    'pinterest': 'https://pinterest.com',
    'reddit': 'https://reddit.com',
    'youtube': 'https://youtube.com',
    'gmail': 'https://gmail.com',
    'yahoo': 'https://yahoo.com',
    'outlook': 'https://outlook.com'
  }
  
  // Normaliser le nom du site
  const normalizedName = siteName.toLowerCase().replace('.com', '').replace('.org', '').replace('.net', '')
  
  return siteUrls[normalizedName] || `https://${normalizedName}.com`
} 