import { spawn, ChildProcess } from 'child_process'

export interface HoleheResult {
  site: string
  found: boolean
  url?: string
  error?: string
}

export async function executeHolehe(email: string): Promise<HoleheResult[]> {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Démarrage de Holehe pour: ${email}`)
    
    // Retirer --only-used pour voir tous les résultats (121 sites)
    const childProcess: ChildProcess = spawn('pynv/bin/holehe', [email, '--no-color'], {
      cwd: process.cwd()
    })

    let stdout = ''
    let stderr = ''

    childProcess.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      stdout += chunk
      console.log(`📤 Holehe stdout: ${chunk}`)
    })

    childProcess.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString()
      stderr += chunk
      console.log(`📤 Holehe stderr: ${chunk}`)
    })

    const timeout = setTimeout(() => {
      console.log('⏰ Timeout Holehe atteint')
      childProcess.kill('SIGTERM')
      reject(new Error('Timeout: Holehe a pris trop de temps'))
    }, 60000)

    childProcess.on('close', async (code: number | null) => {
      clearTimeout(timeout)
      
      // Attendre 2 secondes pour s'assurer que tous les résultats sont reçus
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log(`🏁 Holehe terminé avec le code: ${code}`)
      console.log(`📊 Sortie complète stdout (${stdout.length} caractères):`)
      console.log(stdout)
      console.log(`📊 Sortie complète stderr (${stderr.length} caractères):`)
      console.log(stderr)
      
      try {
        const results = parseHoleheOutput(stdout)
        console.log(`🎯 Résultats finaux: ${results.length} sites`)
        resolve(results)
      } catch (error) {
        console.error('💥 Erreur lors du parsing:', error)
        reject(error)
      }
    })

    childProcess.on('error', (error: Error) => {
      clearTimeout(timeout)
      console.error('💥 Erreur Holehe:', error)
      reject(error)
    })
  })
}

function parseHoleheOutput(output: string): HoleheResult[] {
  const results: HoleheResult[] = []
  const lines = output.split('\n')
  
  console.log(`🔍 Parsing Holehe output (${lines.length} lignes)`)
  console.log(`📋 Lignes à analyser:`)
  lines.forEach((line, index) => {
    if (line.trim().length > 0) {
      console.log(`  ${index + 1}: "${line.trim()}"`)
    }
  })
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim()
    
    // Ignorer les lignes vides
    if (trimmedLine.length === 0) {
      continue
    }
    
    // Ignorer les lignes d'information générales
    if (trimmedLine.includes('*') || 
        trimmedLine.includes('websites checked') ||
        trimmedLine.includes('Email used') ||
        trimmedLine.includes('Email not used') ||
        trimmedLine.includes('Rate limit') ||
        trimmedLine.startsWith('Usage:') ||
        trimmedLine.startsWith('Options:') ||
        trimmedLine.includes('Checking')) {
      console.log(`⏭️ Ligne ignorée (info): "${trimmedLine}"`)
      continue
    }
    
    // Chercher les résultats positifs [+] - comptes trouvés
    const foundMatch = trimmedLine.match(/^\[\+\]\s*(.+?)(?:\s*\/\s*(.+?))?(?:\s*\/\s*(https?:\/\/.+))?$/)
    if (foundMatch) {
      const site = foundMatch[1].trim()
      const fullName = foundMatch[2]?.trim()
      const url = foundMatch[3]?.trim()
      
      console.log(`✅ Compte trouvé parsé: ${site}`)
      results.push({
        site,
        found: true,
        url: url || getSiteUrl(site)
      })
      continue
    }
    
    // Chercher les résultats négatifs [-] - comptes non trouvés
    const notFoundMatch = trimmedLine.match(/^\[-\]\s*(.+)$/)
    if (notFoundMatch) {
      const site = notFoundMatch[1].trim()
      
      console.log(`❌ Compte non trouvé parsé: ${site}`)
      results.push({
        site,
        found: false
      })
      continue
    }
    
    // Chercher les erreurs [x] - rate limits ou erreurs
    const errorMatch = trimmedLine.match(/^\[x\]\s*(.+)$/)
    if (errorMatch) {
      const site = errorMatch[1].trim()
      
      console.log(`⚠️ Erreur/Rate limit parsé: ${site}`)
      results.push({
        site,
        found: false,
        error: 'Rate limit ou erreur'
      })
      continue
    }
    
    // Si aucun pattern ne correspond, log la ligne
    console.log(`❓ Ligne non reconnue: "${trimmedLine}"`)
  }
  
  console.log(`📊 Holehe parsing terminé: ${results.length} résultats`)
  
  // Si aucun résultat n'a été parsé, essayer une méthode alternative
  if (results.length === 0) {
    console.log('⚠️ Aucun résultat parsé, tentative alternative')
    return parseHoleheAlternative(output)
  }
  
  return results
}

function parseHoleheAlternative(output: string): HoleheResult[] {
  const commonSites = [
    'Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'GitHub', 'Google',
    'Yahoo', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Spotify',
    'Discord', 'Reddit', 'Pinterest', 'Tumblr', 'Snapchat', 'TikTok'
  ]
  
  return commonSites.map(site => ({
    site,
    found: output.toLowerCase().includes(site.toLowerCase()),
    url: getSiteUrl(site)
  }))
}

function getSiteUrl(siteName: string): string {
  const siteUrls: Record<string, string> = {
    'Facebook': 'https://facebook.com',
    'Twitter': 'https://twitter.com',
    'Instagram': 'https://instagram.com',
    'LinkedIn': 'https://linkedin.com',
    'GitHub': 'https://github.com',
    'Google': 'https://google.com',
    'Yahoo': 'https://yahoo.com',
    'Microsoft': 'https://microsoft.com',
    'Apple': 'https://apple.com',
    'Amazon': 'https://amazon.com',
    'Netflix': 'https://netflix.com',
    'Spotify': 'https://spotify.com',
    'Discord': 'https://discord.com',
    'Reddit': 'https://reddit.com',
    'Pinterest': 'https://pinterest.com',
    'Tumblr': 'https://tumblr.com',
    'Snapchat': 'https://snapchat.com',
    'TikTok': 'https://tiktok.com'
  }
  
  return siteUrls[siteName] || `https://${siteName.toLowerCase()}.com`
} 