import { NextRequest, NextResponse } from 'next/server'
import { globalQueue } from '@/lib/queue-instance'

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()
    console.log(`📨 Nouvelle requête Holehe pour email: ${email}, userId: ${userId}`)

    if (!email) {
      console.error('❌ Email manquant dans la requête')
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Utiliser un userId par défaut ou générer un ID unique si pas fourni
    const finalUserId = userId || 'anonymous_' + Date.now()
    console.log(`👤 Utilisation de l'userId: ${finalUserId}`)

    // Ajouter la tâche à la file d'attente
    console.log('🔄 Ajout de la tâche à la file d\'attente...')
    const taskId = await globalQueue.addTask('holehe', finalUserId, { email })
    console.log(`✅ Tâche Holehe créée avec ID: ${taskId}`)

    return NextResponse.json({
      success: true,
      taskId,
      message: 'Tâche Holehe ajoutée à la file d\'attente'
    })

  } catch (error) {
    console.error('💥 Erreur lors de l\'ajout de la tâche Holehe:', error)
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      console.error('⏰ Rate limit atteint:', error.message)
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