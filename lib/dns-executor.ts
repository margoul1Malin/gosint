import dns from 'dns'
import { promisify } from 'util'

// Promisification des méthodes DNS
const dnsLookup = promisify(dns.lookup)
const dnsResolve = promisify(dns.resolve)
const dnsResolve4 = promisify(dns.resolve4)
const dnsResolve6 = promisify(dns.resolve6)
const dnsResolveMx = promisify(dns.resolveMx)
const dnsResolveTxt = promisify(dns.resolveTxt)
const dnsResolveNs = promisify(dns.resolveNs)
const dnsResolveCname = promisify(dns.resolveCname)
const dnsResolvePtr = promisify(dns.resolvePtr)
const dnsResolveSoa = promisify(dns.resolveSoa)
const dnsResolveSrv = promisify(dns.resolveSrv)
const dnsResolveNaptr = promisify(dns.resolveNaptr)
const dnsReverse = promisify(dns.reverse)

export interface DNSRecord {
  type: string
  name: string
  value: string | string[]
  ttl?: number
  priority?: number
  weight?: number
  port?: number
  target?: string
  class?: string
  flags?: number
  tag?: string
  regexp?: string
  replacement?: string
}

export interface DNSAnalysisResult {
  domain: string
  timestamp: number
  records: DNSRecord[]
  summary: {
    totalRecords: number
    recordTypes: string[]
    hasIPv4: boolean
    hasIPv6: boolean
    hasMX: boolean
    hasTXT: boolean
    hasNS: boolean
    hasCNAME: boolean
    hasSOA: boolean
    hasSRV: boolean
    hasNAPTR: boolean
    nameservers: string[]
    mailServers: string[]
    ipv4Addresses: string[]
    ipv6Addresses: string[]
  }
  security: {
    spfRecord: string | null
    dmarcRecord: string | null
    dkimSelectors: string[]
    hasCAA: boolean
    caaRecords: string[]
    dnssecEnabled: boolean
  }
  performance: {
    responseTime: number
    errors: string[]
    warnings: string[]
  }
  geolocation?: {
    country?: string
    region?: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

export async function executeDNSAnalysis(domain: string): Promise<DNSAnalysisResult> {
  const startTime = Date.now()
  const records: DNSRecord[] = []
  const errors: string[] = []
  const warnings: string[] = []
  
  // Nettoyer le domaine
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  
  const result: DNSAnalysisResult = {
    domain: cleanDomain,
    timestamp: Date.now(),
    records: [],
    summary: {
      totalRecords: 0,
      recordTypes: [],
      hasIPv4: false,
      hasIPv6: false,
      hasMX: false,
      hasTXT: false,
      hasNS: false,
      hasCNAME: false,
      hasSOA: false,
      hasSRV: false,
      hasNAPTR: false,
      nameservers: [],
      mailServers: [],
      ipv4Addresses: [],
      ipv6Addresses: []
    },
    security: {
      spfRecord: null,
      dmarcRecord: null,
      dkimSelectors: [],
      hasCAA: false,
      caaRecords: [],
      dnssecEnabled: false
    },
    performance: {
      responseTime: 0,
      errors: [],
      warnings: []
    }
  }

  try {
    // Enregistrements A (IPv4)
    try {
      const aRecords = await dnsResolve4(cleanDomain, { ttl: true })
      aRecords.forEach(record => {
        records.push({
          type: 'A',
          name: cleanDomain,
          value: record.address,
          ttl: record.ttl
        })
        result.summary.ipv4Addresses.push(record.address)
      })
      result.summary.hasIPv4 = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA') {
        errors.push(`Erreur A: ${(error as Error).message}`)
      }
    }

    // Enregistrements AAAA (IPv6)
    try {
      const aaaaRecords = await dnsResolve6(cleanDomain, { ttl: true })
      aaaaRecords.forEach(record => {
        records.push({
          type: 'AAAA',
          name: cleanDomain,
          value: record.address,
          ttl: record.ttl
        })
        result.summary.ipv6Addresses.push(record.address)
      })
      result.summary.hasIPv6 = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA') {
        errors.push(`Erreur AAAA: ${(error as Error).message}`)
      }
    }

    // Enregistrements MX (Mail Exchange)
    try {
      const mxRecords = await dnsResolveMx(cleanDomain)
      mxRecords.forEach(record => {
        records.push({
          type: 'MX',
          name: cleanDomain,
          value: record.exchange,
          priority: record.priority
        })
        result.summary.mailServers.push(record.exchange)
      })
      result.summary.hasMX = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA') {
        errors.push(`Erreur MX: ${(error as Error).message}`)
      }
    }

    // Enregistrements TXT
    try {
      const txtRecords = await dnsResolveTxt(cleanDomain)
      txtRecords.forEach(record => {
        const txtValue = Array.isArray(record) ? record.join('') : record
        records.push({
          type: 'TXT',
          name: cleanDomain,
          value: txtValue
        })
        
        // Analyser les enregistrements de sécurité
        if (txtValue.toLowerCase().includes('v=spf1')) {
          result.security.spfRecord = txtValue
        }
        if (txtValue.toLowerCase().includes('v=dmarc1')) {
          result.security.dmarcRecord = txtValue
        }
      })
      result.summary.hasTXT = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA') {
        errors.push(`Erreur TXT: ${(error as Error).message}`)
      }
    }

    // Enregistrements NS (Name Server)
    try {
      const nsRecords = await dnsResolveNs(cleanDomain)
      nsRecords.forEach(record => {
        records.push({
          type: 'NS',
          name: cleanDomain,
          value: record
        })
        result.summary.nameservers.push(record)
      })
      result.summary.hasNS = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA') {
        errors.push(`Erreur NS: ${(error as Error).message}`)
      }
    }

    // Enregistrements CNAME
    try {
      const cnameRecords = await dnsResolveCname(cleanDomain)
      cnameRecords.forEach(record => {
        records.push({
          type: 'CNAME',
          name: cleanDomain,
          value: record
        })
      })
      result.summary.hasCNAME = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA' && 
          (error as NodeJS.ErrnoException).code !== 'ENOTFOUND') {
        errors.push(`Erreur CNAME: ${(error as Error).message}`)
      }
    }

    // Enregistrements SOA (Start of Authority)
    try {
      const soaRecord = await dnsResolveSoa(cleanDomain)
      records.push({
        type: 'SOA',
        name: cleanDomain,
        value: `${soaRecord.nsname} ${soaRecord.hostmaster} ${soaRecord.serial} ${soaRecord.refresh} ${soaRecord.retry} ${soaRecord.expire} ${soaRecord.minttl}`
      })
      result.summary.hasSOA = true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENODATA') {
        errors.push(`Erreur SOA: ${(error as Error).message}`)
      }
    }

    // Enregistrements SRV (Service)
    const commonServices = ['_http._tcp', '_https._tcp', '_ftp._tcp', '_sip._tcp', '_sips._tcp', '_xmpp-server._tcp']
    for (const service of commonServices) {
      try {
        const srvRecords = await dnsResolveSrv(`${service}.${cleanDomain}`)
        srvRecords.forEach(record => {
          records.push({
            type: 'SRV',
            name: `${service}.${cleanDomain}`,
            value: record.name,
            priority: record.priority,
            weight: record.weight,
            port: record.port
          })
        })
        result.summary.hasSRV = true
      } catch (error) {
        // Ignorer les erreurs SRV car la plupart des domaines n'en ont pas
      }
    }

    // Enregistrements CAA (Certificate Authority Authorization)
    try {
      const caaRecords = await dnsResolve(cleanDomain, 'CAA') as any[]
      caaRecords.forEach(record => {
        records.push({
          type: 'CAA',
          name: cleanDomain,
          value: `${record.flags} ${record.tag} ${record.value}`,
          flags: record.flags,
          tag: record.tag
        })
        result.security.caaRecords.push(record.value)
      })
      result.security.hasCAA = true
    } catch (error) {
      // CAA n'est pas supporté partout
    }

    // Recherche DKIM pour les sélecteurs communs
    const dkimSelectors = ['default', 'google', 'k1', 'k2', 'selector1', 'selector2', 'dkim', 'mail']
    for (const selector of dkimSelectors) {
      try {
        const dkimDomain = `${selector}._domainkey.${cleanDomain}`
        const dkimRecords = await dnsResolveTxt(dkimDomain)
        if (dkimRecords.length > 0) {
          dkimRecords.forEach(record => {
            const dkimValue = Array.isArray(record) ? record.join('') : record
            records.push({
              type: 'DKIM',
              name: dkimDomain,
              value: dkimValue
            })
          })
          result.security.dkimSelectors.push(selector)
        }
      } catch (error) {
        // Ignorer les erreurs DKIM
      }
    }

    // Recherche DMARC
    try {
      const dmarcDomain = `_dmarc.${cleanDomain}`
      const dmarcRecords = await dnsResolveTxt(dmarcDomain)
      dmarcRecords.forEach(record => {
        const dmarcValue = Array.isArray(record) ? record.join('') : record
        if (dmarcValue.toLowerCase().includes('v=dmarc1')) {
          records.push({
            type: 'DMARC',
            name: dmarcDomain,
            value: dmarcValue
          })
          result.security.dmarcRecord = dmarcValue
        }
      })
    } catch (error) {
      // Ignorer les erreurs DMARC
    }

    // Reverse DNS pour les adresses IP
    for (const ip of result.summary.ipv4Addresses) {
      try {
        const ptrRecords = await dnsReverse(ip)
        ptrRecords.forEach(record => {
          records.push({
            type: 'PTR',
            name: ip,
            value: record
          })
        })
      } catch (error) {
        // Ignorer les erreurs PTR
      }
    }

    // Finaliser les résultats
    result.records = records
    result.summary.totalRecords = records.length
    result.summary.recordTypes = [...new Set(records.map(r => r.type))]
    result.performance.responseTime = Date.now() - startTime
    result.performance.errors = errors
    result.performance.warnings = warnings

    // Ajouter des avertissements de sécurité
    if (!result.security.spfRecord) {
      warnings.push('Aucun enregistrement SPF trouvé - risque de spoofing email')
    }
    if (!result.security.dmarcRecord) {
      warnings.push('Aucun enregistrement DMARC trouvé - protection email limitée')
    }
    if (result.security.dkimSelectors.length === 0) {
      warnings.push('Aucun enregistrement DKIM trouvé - authentification email manquante')
    }
    if (!result.security.hasCAA) {
      warnings.push('Aucun enregistrement CAA trouvé - contrôle des certificats SSL limité')
    }

    return result

  } catch (error) {
    errors.push(`Erreur générale: ${(error as Error).message}`)
    result.performance.errors = errors
    result.performance.responseTime = Date.now() - startTime
    return result
  }
} 