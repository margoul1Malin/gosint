import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { macAddress } = await request.json()

    // Validation de l'adresse MAC
    if (!macAddress || typeof macAddress !== 'string') {
      return NextResponse.json({ error: 'Adresse MAC requise' }, { status: 400 })
    }

    // Nettoyer et valider l'adresse MAC (6 premiers caractères)
    const cleanMac = macAddress.replace(/[^a-fA-F0-9]/g, '').toUpperCase()
    
    if (cleanMac.length < 6) {
      return NextResponse.json({ 
        error: 'Adresse MAC invalide. Veuillez entrer au moins 6 caractères hexadécimaux.' 
      }, { status: 400 })
    }

    // Prendre seulement les 6 premiers caractères (OUI)
    const oui = cleanMac.substring(0, 6)

    // Lire le fichier macaddr.txt
    const filePath = path.join(process.cwd(), 'public', 'macaddr.txt')
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        error: 'Base de données MAC non disponible' 
      }, { status: 500 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n')

    // Rechercher le fabricant
    let vendor = null
    for (const line of lines) {
      if (line.trim()) {
        const [macPrefix, vendorName] = line.split('\t')
        if (macPrefix && macPrefix.trim().toUpperCase() === oui) {
          vendor = vendorName ? vendorName.trim() : 'Fabricant inconnu'
          break
        }
      }
    }

    if (!vendor) {
      return NextResponse.json({
        success: true,
        result: {
          macAddress: macAddress,
          oui: oui,
          vendor: 'Fabricant non trouvé',
          found: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      result: {
        macAddress: macAddress,
        oui: oui,
        vendor: vendor,
        found: true,
        formattedMac: `${oui.substring(0, 2)}:${oui.substring(2, 4)}:${oui.substring(4, 6)}`
      }
    })

  } catch (error) {
    console.error('Erreur lors du lookup MAC:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la recherche du fabricant' 
    }, { status: 500 })
  }
} 