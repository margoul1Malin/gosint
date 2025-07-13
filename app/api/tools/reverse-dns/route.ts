import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { promisify } from 'util'
import dns from 'dns'

const reverseAsync = promisify(dns.reverse)
const lookupAsync = promisify(dns.lookup)

interface ReverseDNSResult {
  success: boolean
  result: {
    ip: string
    hostnames: string[]
    found: boolean
    timestamp: string
    responseTime: number
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { ip } = await request.json()

    // Validation de l'adresse IP
    if (!ip || typeof ip !== 'string') {
      return NextResponse.json({ error: 'Adresse IP requise' }, { status: 400 })
    }

    const cleanIP = ip.trim()
    
    // Validation du format IP (IPv4 et IPv6)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    
    if (!ipv4Regex.test(cleanIP) && !ipv6Regex.test(cleanIP)) {
      return NextResponse.json({ 
        error: 'Format d\'adresse IP invalide. Veuillez entrer une adresse IPv4 ou IPv6 valide.' 
      }, { status: 400 })
    }

    // Exécuter le reverse DNS lookup
    const startTime = Date.now()
    
    try {
      const hostnames = await reverseAsync(cleanIP)
      const endTime = Date.now()
      const responseTime = endTime - startTime

      return NextResponse.json({
        success: true,
        result: {
          ip: cleanIP,
          hostnames: hostnames || [],
          found: hostnames && hostnames.length > 0,
          timestamp: new Date().toISOString(),
          responseTime: responseTime
        }
      })

    } catch (dnsError: any) {
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Vérifier si c'est juste qu'il n'y a pas de résolution inverse
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENOENT') {
        return NextResponse.json({
          success: true,
          result: {
            ip: cleanIP,
            hostnames: [],
            found: false,
            timestamp: new Date().toISOString(),
            responseTime: responseTime
          }
        })
      }

      // Autres erreurs DNS
      return NextResponse.json({ 
        error: `Erreur DNS: ${dnsError.message || dnsError}` 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Erreur lors du reverse DNS:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la résolution DNS inverse' 
    }, { status: 500 })
  }
}

// Route GET pour obtenir des informations sur l'outil
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json({
      name: 'Reverse DNS Lookup',
      description: 'Résolution inverse d\'adresse IP vers nom d\'hôte',
      supportedFormats: ['IPv4', 'IPv6'],
      examples: ['8.8.8.8', '1.1.1.1', '2001:4860:4860::8888']
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 