import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// @ts-ignore
const Traceroute = require('nodejs-traceroute')

interface TracerouteHop {
  hop: number
  ip: string
  hostname?: string
  rtt1?: number
  rtt2?: number
  rtt3?: number
  timeout?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { target } = await request.json()

    // Validation de la cible
    if (!target || typeof target !== 'string') {
      return NextResponse.json({ error: 'Cible requise (domaine ou IP)' }, { status: 400 })
    }

    const cleanTarget = target.trim()
    
    // Validation basique du format (domaine ou IP)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!ipRegex.test(cleanTarget) && !domainRegex.test(cleanTarget)) {
      return NextResponse.json({ 
        error: 'Format invalide. Veuillez entrer une adresse IP valide ou un nom de domaine.' 
      }, { status: 400 })
    }

    // Exécuter le traceroute
    const startTime = Date.now()
    
    return new Promise((resolve) => {
      const hops: TracerouteHop[] = []
      
      // Créer une instance de Traceroute
      const tracer = new Traceroute()
      
      // Écouter les événements
      tracer.on('hop', (hop: any) => {
        const hopData: TracerouteHop = {
          hop: hop.hop || hops.length + 1,
          ip: hop.ip || '*',
          hostname: hop.hostname || undefined,
          rtt1: hop.rtt1 && hop.rtt1 !== '*' ? parseFloat(hop.rtt1.replace(' ms', '')) : undefined,
          rtt2: hop.rtt2 && hop.rtt2 !== '*' ? parseFloat(hop.rtt2.replace(' ms', '')) : undefined,
          rtt3: hop.rtt3 && hop.rtt3 !== '*' ? parseFloat(hop.rtt3.replace(' ms', '')) : undefined,
          timeout: hop.ip === '*' || hop.rtt1 === '*'
        }
        hops.push(hopData)
      })

      tracer.on('close', (code: number) => {
        const endTime = Date.now()
        const totalTime = endTime - startTime

        resolve(NextResponse.json({
          success: true,
          result: {
            target: cleanTarget,
            hops: hops,
            totalHops: hops.length,
            totalTime: totalTime,
            timestamp: new Date().toISOString(),
            exitCode: code
          }
        }))
      })

      tracer.on('error', (error: any) => {
        resolve(NextResponse.json({ 
          error: `Erreur lors du traceroute: ${error.message || error}` 
        }, { status: 500 }))
      })

      // Lancer le traceroute
      tracer.trace(cleanTarget)

      // Timeout global de 60 secondes
      setTimeout(() => {
        tracer.kill()
        resolve(NextResponse.json({ 
          error: 'Timeout: Le traceroute a pris trop de temps à s\'exécuter' 
        }, { status: 408 }))
      }, 60000)
    })

  } catch (error) {
    console.error('Erreur lors du traceroute:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'exécution du traceroute' 
    }, { status: 500 })
  }
} 