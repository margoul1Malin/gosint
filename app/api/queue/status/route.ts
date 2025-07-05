import { NextRequest, NextResponse } from 'next/server'
import { globalQueue } from '@/lib/queue-instance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    
    console.log(`📡 Requête de statut pour la tâche: ${taskId}`)

    if (!taskId) {
      console.error('❌ ID de tâche manquant dans la requête')
      return NextResponse.json({ error: 'ID de tâche requis' }, { status: 400 })
    }

    console.log('🔍 Recherche de la tâche dans la queue...')
    const taskStatus = globalQueue.getTaskStatus(taskId)
    
    if (!taskStatus) {
      console.error(`❌ Tâche non trouvée: ${taskId}`)
      // Afficher les statistiques de la queue pour déboguer
      const stats = globalQueue.getQueueStats()
      console.log('📊 Statistiques de la queue:', stats)
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    console.log(`✅ Tâche trouvée: ${taskStatus.id} - Status: ${taskStatus.status}`)
    
    return NextResponse.json({
      id: taskStatus.id,
      type: taskStatus.type,
      status: taskStatus.status,
      createdAt: taskStatus.createdAt,
      startedAt: taskStatus.startedAt,
      completedAt: taskStatus.completedAt,
      result: taskStatus.result,
      error: taskStatus.error
    })

  } catch (error) {
    console.error('💥 Erreur lors de la vérification du statut:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 