import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface WhoisResult {
  domain: string
  registrar?: string
  registrant?: string
  creationDate?: string
  expirationDate?: string
  updateDate?: string
  nameServers?: string[]
  status?: string[]
  rawOutput: string
  error?: string
}

export async function executeWhois(domain: string): Promise<WhoisResult> {
  const result: WhoisResult = {
    domain: domain.toLowerCase(),
    rawOutput: '',
    nameServers: [],
    status: []
  }

  try {
    console.log(`🔍 Exécution de whois pour: ${domain}`)
    
    // Exécuter la commande whois avec un timeout
    const { stdout, stderr } = await execAsync(`whois ${domain}`, {
      timeout: 30000, // 30 secondes
      maxBuffer: 1024 * 1024 // 1MB
    })

    if (stderr) {
      console.warn(`⚠️ Avertissement whois: ${stderr}`)
    }

    result.rawOutput = stdout

    // Parser les informations importantes
    parseWhoisOutput(stdout, result)

    console.log(`✅ Whois terminé pour ${domain}`)
    console.log(`📊 Résultats parsés:`, {
      registrar: result.registrar,
      creationDate: result.creationDate,
      expirationDate: result.expirationDate,
      nameServers: result.nameServers?.length,
      status: result.status?.length
    })
    
    return result

  } catch (error: any) {
    console.error(`❌ Erreur whois pour ${domain}:`, error.message)
    
    result.error = error.message
    result.rawOutput = error.stdout || ''
    
    // Essayer de parser même en cas d'erreur partielle
    if (error.stdout) {
      parseWhoisOutput(error.stdout, result)
    }
    
    return result
  }
}

function parseWhoisOutput(output: string, result: WhoisResult): void {
  const lines = output.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('%') || trimmedLine.startsWith('#')) continue

    // Registrar - formats multiples
    if (trimmedLine.match(/^registrar:\s*(.+)$/i)) {
      result.registrar = trimmedLine.split(':')[1].trim()
    } else if (trimmedLine.match(/^Registrar:\s*(.+)$/i)) {
      result.registrar = trimmedLine.split(':')[1].trim()
    } else if (trimmedLine.match(/^Registrar Name:\s*(.+)$/i)) {
      result.registrar = trimmedLine.split(':')[1].trim()
    }

    // Registrant - formats multiples
    if (trimmedLine.match(/^registrant:\s*(.+)$/i)) {
      result.registrant = trimmedLine.split(':')[1].trim()
    } else if (trimmedLine.match(/^Registrant:\s*(.+)$/i)) {
      result.registrant = trimmedLine.split(':')[1].trim()
    } else if (trimmedLine.match(/^Registrant Name:\s*(.+)$/i)) {
      result.registrant = trimmedLine.split(':')[1].trim()
    } else if (trimmedLine.match(/^Registrant Organization:\s*(.+)$/i)) {
      result.registrant = trimmedLine.split(':')[1].trim()
    } else if (trimmedLine.match(/^holder-c:\s*(.+)$/i)) {
      result.registrant = trimmedLine.split(':')[1].trim()
    }

    // Dates de création - formats multiples
    if (trimmedLine.match(/^created:\s*(.+)$/i)) {
      result.creationDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Creation Date:\s*(.+)$/i)) {
      result.creationDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Domain Registration Date:\s*(.+)$/i)) {
      result.creationDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Created On:\s*(.+)$/i)) {
      result.creationDate = parseDate(trimmedLine.split(':')[1].trim())
    }

    // Dates d'expiration - formats multiples
    if (trimmedLine.match(/^Expiry Date:\s*(.+)$/i)) {
      result.expirationDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Registry Expiry Date:\s*(.+)$/i)) {
      result.expirationDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Expires:\s*(.+)$/i)) {
      result.expirationDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Expiration Date:\s*(.+)$/i)) {
      result.expirationDate = parseDate(trimmedLine.split(':')[1].trim())
    }

    // Dates de mise à jour - formats multiples
    if (trimmedLine.match(/^last-update:\s*(.+)$/i)) {
      result.updateDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Updated Date:\s*(.+)$/i)) {
      result.updateDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Updated:\s*(.+)$/i)) {
      result.updateDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^Last Modified:\s*(.+)$/i)) {
      result.updateDate = parseDate(trimmedLine.split(':')[1].trim())
    } else if (trimmedLine.match(/^changed:\s*(.+)$/i)) {
      result.updateDate = parseDate(trimmedLine.split(':')[1].trim())
    }

    // Serveurs de noms - formats multiples
    if (trimmedLine.match(/^nserver:\s*(.+)$/i)) {
      const nameServer = trimmedLine.split(':')[1].trim().toLowerCase()
      if (nameServer && !result.nameServers!.includes(nameServer)) {
        result.nameServers!.push(nameServer)
      }
    } else if (trimmedLine.match(/^Name Server:\s*(.+)$/i)) {
      const nameServer = trimmedLine.split(':')[1].trim().toLowerCase()
      if (nameServer && !result.nameServers!.includes(nameServer)) {
        result.nameServers!.push(nameServer)
      }
    } else if (trimmedLine.match(/^Nameserver:\s*(.+)$/i)) {
      const nameServer = trimmedLine.split(':')[1].trim().toLowerCase()
      if (nameServer && !result.nameServers!.includes(nameServer)) {
        result.nameServers!.push(nameServer)
      }
    }

    // Statut du domaine - formats multiples
    if (trimmedLine.match(/^status:\s*(.+)$/i)) {
      const status = trimmedLine.split(':')[1].trim()
      if (status && !result.status!.includes(status)) {
        result.status!.push(status)
      }
    } else if (trimmedLine.match(/^Domain Status:\s*(.+)$/i)) {
      const status = trimmedLine.split(':')[1].trim()
      if (status && !result.status!.includes(status)) {
        result.status!.push(status)
      }
    } else if (trimmedLine.match(/^eppstatus:\s*(.+)$/i)) {
      const status = trimmedLine.split(':')[1].trim()
      if (status && !result.status!.includes(status)) {
        result.status!.push(status)
      }
    }
  }

  // Nettoyer les tableaux vides
  if (result.nameServers!.length === 0) {
    delete result.nameServers
  }
  if (result.status!.length === 0) {
    delete result.status
  }
}

function parseDate(dateString: string): string {
  if (!dateString) return ''
  
  try {
    // Nettoyer la chaîne de date
    let cleaned = dateString.replace(/\s+\(.+\)$/, '').trim()
    
    // Gestion spéciale pour les formats ISO avec Z
    if (cleaned.endsWith('Z')) {
      const date = new Date(cleaned)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // Gestion des formats comme "2025-03-22T16:05:07.016637Z"
    if (cleaned.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      const date = new Date(cleaned)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // Gestion des formats comme "22-Mar-2025"
    if (cleaned.match(/^\d{2}-[A-Za-z]{3}-\d{4}$/)) {
      const date = new Date(cleaned)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // Gestion des formats comme "2025-03-22"
    if (cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(cleaned + 'T00:00:00Z')
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // Essayer de parser directement
    const date = new Date(cleaned)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
    
    // Si le parsing échoue, retourner la chaîne originale
    console.warn(`⚠️ Impossible de parser la date: ${dateString}`)
    return dateString
    
  } catch (error) {
    console.warn(`❌ Erreur lors du parsing de la date: ${dateString}`, error)
    return dateString
  }
} 