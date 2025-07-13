import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { spawn } from 'child_process'

interface PortScanResult {
  success: boolean
  result: {
    target: string
    ports: Array<{
      port: number
      protocol: string
      state: string
      service: string
      version?: string
    }>
    totalPorts: number
    openPorts: number
    closedPorts: number
    filteredPorts: number
    scanTime: number
    timestamp: string
    scanType: string
    osInfo?: string
    extraInfo?: {
      mac?: string
      latency?: string
      networkDistance?: string
      deviceType?: string
      serviceInfo?: string
      scriptResults?: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { target, ports, scanType } = await request.json()

    // Validation des entrées
    if (!target || typeof target !== 'string') {
      return NextResponse.json({ error: 'Cible requise' }, { status: 400 })
    }

    if (!ports || typeof ports !== 'string') {
      return NextResponse.json({ error: 'Ports requis' }, { status: 400 })
    }

    // Nettoyer et valider la cible
    const cleanTarget = target.trim()
    if (!cleanTarget) {
      return NextResponse.json({ error: 'Cible invalide' }, { status: 400 })
    }

    // Nettoyer et valider les ports
    const cleanPorts = ports.trim()
    if (!cleanPorts) {
      return NextResponse.json({ error: 'Ports invalides' }, { status: 400 })
    }

    // Valider le type de scan
    const validScanTypes = ['tcp', 'syn', 'udp', 'aggressive', 'os-detection', 'service-detection', 'stealth']
    const selectedScanType = scanType && validScanTypes.includes(scanType) ? scanType : 'tcp'

    // Exécuter le scan avec nmap directement
    const startTime = Date.now()
    
    return new Promise((resolve) => {
      const nmapArgs = [
        '-p', cleanPorts,
        '--open', // Afficher seulement les ports ouverts
        cleanTarget
      ]

      // Ajouter les flags spécifiques selon le type de scan
      switch (selectedScanType) {
        case 'tcp':
          nmapArgs.unshift('-sT') // TCP connect scan
          nmapArgs.push('-T4', '--max-retries=1', '--host-timeout=30s')
          break
        case 'syn':
          nmapArgs.unshift('-sS') // SYN scan
          nmapArgs.push('-T4', '--max-retries=1', '--host-timeout=30s')
          break
        case 'udp':
          nmapArgs.unshift('-sU') // UDP scan
          nmapArgs.push('-T3', '--max-retries=1', '--host-timeout=60s') // UDP plus lent
          break
        case 'aggressive':
          nmapArgs.unshift('-A') // Aggressive scan (OS detection, version detection, script scanning, traceroute)
          nmapArgs.push('-T4', '--max-retries=2', '--host-timeout=60s')
          break
        case 'os-detection':
          nmapArgs.unshift('-O') // OS detection
          nmapArgs.push('-T4', '--max-retries=2', '--host-timeout=45s')
          break
        case 'service-detection':
          nmapArgs.unshift('-sV') // Service version detection
          nmapArgs.push('-T4', '--max-retries=2', '--host-timeout=45s')
          break
        case 'stealth':
          nmapArgs.unshift('-sS', '-f', '-D', 'RND:10') // SYN scan + fragmentation + decoys
          nmapArgs.push('-T2', '--max-retries=1', '--host-timeout=90s') // Plus lent pour la furtivité
          break
      }

      console.log('Executing nmap command:', 'nmap', nmapArgs.join(' '))

      const nmapProcess = spawn('nmap', nmapArgs)
      let output = ''
      let errorOutput = ''

      nmapProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      nmapProcess.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      nmapProcess.on('close', (code) => {
        const endTime = Date.now()
        const scanTime = endTime - startTime

        console.log('=== NMAP SCAN RESULTS DEBUG ===')
        console.log('Nmap process exited with code:', code)
        console.log('Scan type:', selectedScanType)
        console.log('Nmap command:', 'nmap', nmapArgs.join(' '))
        console.log('=== NMAP OUTPUT START ===')
        console.log(output)
        console.log('=== NMAP OUTPUT END ===')
        if (errorOutput) {
          console.log('=== NMAP ERROR OUTPUT ===')
          console.log(errorOutput)
        }

        try {
          // Parser la sortie nmap
          const ports: any[] = []
          let openPorts = 0
          let osInfo = null
          let extraInfo = {}

          // Rechercher les lignes de ports ouverts et informations supplémentaires
          const lines = output.split('\n')
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            
            // Format: "22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)"
            const portMatch = line.match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)\s*(.*)/)
            if (portMatch) {
              const [, portNum, protocol, service, version] = portMatch
              ports.push({
                port: parseInt(portNum),
                protocol: protocol,
                state: 'open',
                service: service || 'unknown',
                version: version.trim() || undefined
              })
              openPorts++
            }

            // Détection d'OS - patterns plus complets
            if (line.includes('OS details:')) {
              osInfo = line.replace('OS details:', '').trim()
            } else if (line.includes('Running:')) {
              osInfo = (osInfo || '') + ' ' + line.replace('Running:', '').trim()
            } else if (line.includes('OS CPE:')) {
              osInfo = (osInfo || '') + ' ' + line.replace('OS CPE:', '').trim()
            } else if (line.match(/^Aggressive OS guesses:/)) {
              // Lire les lignes suivantes pour les suppositions d'OS
              let osGuesses = []
              for (let j = i + 1; j < lines.length && j < i + 5; j++) {
                if (lines[j].trim().startsWith('No exact OS matches')) break
                if (lines[j].trim() && !lines[j].includes('Network Distance:')) {
                  osGuesses.push(lines[j].trim())
                }
              }
              if (osGuesses.length > 0) {
                osInfo = osGuesses.join(', ')
              }
            }

            // Informations MAC
            if (line.includes('MAC Address:')) {
              extraInfo = { ...extraInfo, mac: line.replace('MAC Address:', '').trim() }
            }

            // Informations de latence
            if (line.includes('Latency:')) {
              extraInfo = { ...extraInfo, latency: line.replace('Latency:', '').trim() }
            }

            // Network Distance
            if (line.includes('Network Distance:')) {
              extraInfo = { ...extraInfo, networkDistance: line.replace('Network Distance:', '').trim() }
            }

            // Device type
            if (line.includes('Device type:')) {
              extraInfo = { ...extraInfo, deviceType: line.replace('Device type:', '').trim() }
            }

            // Service info (pour les scans de services)
            if (line.includes('Service Info:')) {
              extraInfo = { ...extraInfo, serviceInfo: line.replace('Service Info:', '').trim() }
            }

            // Host script results
            if (line.includes('Host script results:')) {
              let scriptResults = []
              for (let j = i + 1; j < lines.length && j < i + 10; j++) {
                if (lines[j].trim() && !lines[j].includes('Nmap scan report')) {
                  scriptResults.push(lines[j].trim())
                } else {
                  break
                }
              }
              if (scriptResults.length > 0) {
                extraInfo = { ...extraInfo, scriptResults: scriptResults.join('; ') }
              }
            }
          }

          // Trier les ports par numéro
          ports.sort((a, b) => a.port - b.port)

          console.log('=== PARSING RESULTS ===')
          console.log('Ports found:', ports.length)
          console.log('OS Info:', osInfo)
          console.log('Extra Info:', extraInfo)

          const result: any = {
            target: cleanTarget,
            ports: ports,
            totalPorts: ports.length,
            openPorts: openPorts,
            closedPorts: 0, // Avec --open, on ne voit que les ports ouverts
            filteredPorts: 0,
            scanTime: scanTime,
            timestamp: new Date().toISOString(),
            scanType: selectedScanType
          }

          // Ajouter les informations supplémentaires si disponibles
          if (osInfo) {
            result.osInfo = osInfo
          }
          if (Object.keys(extraInfo).length > 0) {
            result.extraInfo = extraInfo
          }

          resolve(NextResponse.json({
            success: true,
            result: result
          }))

        } catch (parseError) {
          resolve(NextResponse.json({ 
            error: `Erreur lors du traitement des résultats: ${parseError}` 
          }, { status: 500 }))
        }
      })

      nmapProcess.on('error', (error) => {
        resolve(NextResponse.json({ 
          error: `Erreur lors du lancement de nmap: ${error.message}` 
        }, { status: 500 }))
      })

      // Timeout de sécurité
      setTimeout(() => {
        nmapProcess.kill()
        resolve(NextResponse.json({ 
          error: 'Timeout: Le scan a pris trop de temps' 
        }, { status: 500 }))
      }, 300000) // 5 minutes
    })

  } catch (error) {
    console.error('Erreur dans l\'API port-scanner:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Port Scanner',
    description: 'Scanne les ports ouverts sur une cible',
    version: '1.0.0'
  })
} 