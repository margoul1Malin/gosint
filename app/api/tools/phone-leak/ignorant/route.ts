import { NextRequest, NextResponse } from 'next/server'
import { globalQueue } from '@/lib/queue-instance'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    // Validation du numéro de téléphone
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Parser le numéro de téléphone pour extraire le code pays et le numéro
    const parsePhoneNumber = (phone: string) => {
      // Nettoyer le numéro (supprimer espaces, tirets, etc.)
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
      
      // Si le numéro commence par +, le supprimer
      const normalizedPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone
      
      // Extraire le code pays (les 2-3 premiers chiffres selon les conventions)
      let countryCode = ''
      let phoneNumberOnly = ''
      
      // Codes pays courants (liste non exhaustive)
      const countryCodes = ['33', '1', '44', '49', '39', '34', '351', '32', '31', '41', '43', '45', '46', '47', '48', '420', '421', '36', '40', '385', '386', '387', '381', '382', '383', '389', '30', '90', '7', '380', '375', '372', '371', '370', '358', '354', '353', '352', '356', '357', '359', '359', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '43', '45', '46', '47', '48', '49', '590', '594', '596', '262', '508', '687', '689', '590', '594', '596', '262', '508', '687', '689']
      
      // Essayer de trouver le code pays
      for (const code of countryCodes.sort((a, b) => b.length - a.length)) {
        if (normalizedPhone.startsWith(code)) {
          countryCode = code
          phoneNumberOnly = normalizedPhone.slice(code.length)
          break
        }
      }
      
      // Si aucun code pays trouvé, supposer que c'est un numéro français (33)
      if (!countryCode) {
        if (normalizedPhone.startsWith('0')) {
          countryCode = '33'
          phoneNumberOnly = normalizedPhone.slice(1)
        } else {
          countryCode = '33'
          phoneNumberOnly = normalizedPhone
        }
      }
      
      return { countryCode, phoneNumber: phoneNumberOnly }
    }

    const { countryCode, phoneNumber: parsedPhone } = parsePhoneNumber(phoneNumber)
    
    // Utiliser un userId par défaut ou générer un ID unique
    const userId = 'anonymous_' + Date.now()

    // Ajouter la tâche à la file d'attente
    const taskId = await globalQueue.addTask('ignorant', userId, {
      countryCode,
      phoneNumber: parsedPhone
    })

    return NextResponse.json({
      success: true,
      message: 'Tâche Ignorant ajoutée à la file d\'attente',
      taskId
    })

  } catch (error: any) {
    console.error('Erreur API Ignorant:', error)
    
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 