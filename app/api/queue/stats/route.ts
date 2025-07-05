import { NextRequest, NextResponse } from 'next/server'
import { globalQueue } from '@/lib/queue-instance'

export async function GET(request: NextRequest) {
  try {
    const stats = globalQueue.getQueueStats()
    
    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 