import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { globalQueue } from '@/lib/queue-instance'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      url, 
      maxDepth = 3, 
      maxPages = 100, 
      includeExternal = false,
      followRedirects = true,
      checkSensitiveFiles = true
    } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      )
    }

    // Validation des paramètres
    if (maxDepth < 1 || maxDepth > 5) {
      return NextResponse.json(
        { error: 'La profondeur doit être entre 1 et 5' },
        { status: 400 }
      )
    }

    if (maxPages < 1 || maxPages > 500) {
      return NextResponse.json(
        { error: 'Le nombre de pages doit être entre 1 et 500' },
        { status: 400 }
      )
    }

    console.log(`📋 Nouvelle tâche d'énumération de dossiers pour: ${url}`)

    // Ajouter la tâche à la file d'attente
    const taskId = await globalQueue.addTask('folders-enumeration', session.user.id, {
      url,
      options: {
        maxDepth,
        maxPages,
        includeExternal,
        followRedirects,
        checkSensitiveFiles
      }
    })

    return NextResponse.json({
      success: true,
      taskId,
      message: 'Tâche d\'énumération de dossiers ajoutée à la file d\'attente'
    })

  } catch (error) {
    console.error('❌ Erreur API énumération de dossiers:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 