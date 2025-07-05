interface QueueTask {
  id: string
  type: 'holehe' | 'ignorant' | 'google-dorking' | 'password-leak' | 'email-leak' | 'folders-enumeration'
  userId: string
  data: any
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
}

interface QueueConfig {
  maxConcurrent: number
  timeout: number // en millisecondes
  retryAttempts: number
}

// Configuration des limites par type de tâche
const QUEUE_CONFIGS: Record<string, QueueConfig> = {
  'holehe': {
    maxConcurrent: 2,
    timeout: 120000, // 2 minutes
    retryAttempts: 1
  },
  'ignorant': {
    maxConcurrent: 2,
    timeout: 120000, // 2 minutes
    retryAttempts: 1
  },
  'google-dorking': {
    maxConcurrent: 3,
    timeout: 300000, // 5 minutes
    retryAttempts: 1
  },
  'password-leak': {
    maxConcurrent: 5,
    timeout: 60000, // 1 minute
    retryAttempts: 2
  },
  'email-leak': {
    maxConcurrent: 5,
    timeout: 60000, // 1 minute
    retryAttempts: 2
  },
  'folders-enumeration': {
    maxConcurrent: 2,
    timeout: 600000, // 10 minutes
    retryAttempts: 1
  }
}

export class TaskQueue {
  private tasks: Map<string, QueueTask> = new Map()
  private runningTasks: Map<string, Set<string>> = new Map()
  private userLastRequest: Map<string, Map<string, Date>> = new Map()

  constructor() {
    // Initialiser les sets pour chaque type de tâche
    Object.keys(QUEUE_CONFIGS).forEach(type => {
      this.runningTasks.set(type, new Set())
    })
  }

  // Vérifier si l'utilisateur peut faire une nouvelle requête (rate limiting)
  canUserMakeRequest(userId: string, taskType: string): { allowed: boolean, waitTime?: number } {
    const rateLimits: Record<string, number> = {
      'holehe': 2 * 60 * 1000, // 2 minutes
      'ignorant': 2 * 60 * 1000, // 2 minutes
      'google-dorking': 5 * 60 * 1000, // 5 minutes
      'password-leak': 30 * 1000, // 30 secondes
      'email-leak': 30 * 1000, // 30 secondes
      'folders-enumeration': 3 * 60 * 1000 // 3 minutes
    }

    if (!this.userLastRequest.has(userId)) {
      this.userLastRequest.set(userId, new Map())
    }

    const userRequests = this.userLastRequest.get(userId)!
    const lastRequest = userRequests.get(taskType)
    const rateLimit = rateLimits[taskType] || 60000

    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - lastRequest.getTime()
      if (timeSinceLastRequest < rateLimit) {
        return {
          allowed: false,
          waitTime: Math.ceil((rateLimit - timeSinceLastRequest) / 1000)
        }
      }
    }

    return { allowed: true }
  }

  // Ajouter une tâche à la file d'attente
  async addTask(taskType: string, userId: string, data: any): Promise<string> {
    // Vérifier si l'utilisateur peut faire une requête
    const canRequest = this.canUserMakeRequest(userId, taskType)
    if (!canRequest.allowed) {
      throw new Error(`Rate limit: Attendez ${Math.ceil(canRequest.waitTime! / 1000)} secondes avant de faire une nouvelle requête`)
    }

    // Créer la tâche
    const task: QueueTask = {
      id: `${taskType}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: taskType as any,
      userId,
      data,
      createdAt: new Date(),
      status: 'pending'
    }

    // Stocker la tâche
    this.tasks.set(task.id, task)
    
    // DEBUG: Vérifier le stockage
    console.log(`📝 Tâche créée avec ID: ${task.id}`)
    console.log(`💾 Tâche stockée dans Map: ${this.tasks.has(task.id)}`)
    console.log(`📊 Nombre total de tâches: ${this.tasks.size}`)

    // Mettre à jour le timestamp de la dernière requête
    if (!this.userLastRequest.has(userId)) {
      this.userLastRequest.set(userId, new Map())
    }
    this.userLastRequest.get(userId)!.set(taskType, new Date())

    // Démarrer le traitement de la file d'attente
    setTimeout(() => this.processQueue(), 100)

    return task.id
  }

  // Traiter la file d'attente
  private async processQueue() {
    for (const [taskType, config] of Object.entries(QUEUE_CONFIGS)) {
      const runningCount = this.runningTasks.get(taskType)!.size
      
      if (runningCount < config.maxConcurrent) {
        // Chercher une tâche en attente de ce type
        const pendingTask = Array.from(this.tasks.values())
          .find(task => task.type === taskType && task.status === 'pending')

        if (pendingTask) {
          this.executeTask(pendingTask)
        }
      }
    }
  }

  // Exécuter une tâche
  private async executeTask(task: QueueTask) {
    const config = QUEUE_CONFIGS[task.type]
    const runningSet = this.runningTasks.get(task.type)!

    // Marquer la tâche comme en cours
    task.status = 'running'
    task.startedAt = new Date()
    runningSet.add(task.id)

    console.log(`🚀 Démarrage de la tâche ${task.id} (${task.type}) pour l'utilisateur ${task.userId}`)

    try {
      // Exécuter la tâche avec timeout
      const result = await Promise.race([
        this.executeTaskLogic(task),
        this.createTimeoutPromise(config.timeout)
      ])

      // Tâche terminée avec succès
      task.status = 'completed'
      task.completedAt = new Date()
      task.result = result

      console.log(`✅ Tâche ${task.id} terminée avec succès`)

    } catch (error) {
      // Tâche échouée
      task.status = 'failed'
      task.completedAt = new Date()
      task.error = error instanceof Error ? error.message : 'Erreur inconnue'

      console.error(`❌ Tâche ${task.id} échouée:`, error)
    } finally {
      // Retirer la tâche des tâches en cours
      runningSet.delete(task.id)
      
      // Traiter la prochaine tâche en attente
      setTimeout(() => this.processQueue(), 100)
    }
  }

  // Logique d'exécution spécifique à chaque type de tâche
  private async executeTaskLogic(task: QueueTask): Promise<any> {
    switch (task.type) {
      case 'holehe':
        return this.executeHolehe(task.data)
      case 'ignorant':
        return this.executeIgnorant(task.data)
      case 'google-dorking':
        return this.executeGoogleDorking(task.data)
      case 'password-leak':
        return this.executePasswordLeak(task.data)
      case 'email-leak':
        return this.executeEmailLeak(task.data)
      case 'folders-enumeration':
        return this.executeFoldersEnumeration(task.data)
      default:
        throw new Error(`Type de tâche non supporté: ${task.type}`)
    }
  }

  // Méthodes d'exécution pour chaque type de tâche
  private async executeHolehe(data: any): Promise<any> {
    // Import dynamique pour éviter les dépendances circulaires
    const { executeHolehe } = await import('./holehe-executor')
    return executeHolehe(data.email)
  }

  private async executeIgnorant(data: any): Promise<any> {
    const { executeIgnorant } = await import('./ignorant-executor')
    return executeIgnorant(data.countryCode, data.phoneNumber)
  }

  private async executeGoogleDorking(data: any): Promise<any> {
    const { executeGoogleDorking } = await import('./google-dorking-executor')
    return executeGoogleDorking(data.phoneNumber)
  }

  private async executePasswordLeak(data: any): Promise<any> {
    const { executePasswordLeak } = await import('./password-leak-executor')
    return executePasswordLeak(data.password, data.apiKeys)
  }

  private async executeEmailLeak(data: any): Promise<any> {
    const { executeEmailLeak } = await import('./email-leak-executor')
    return executeEmailLeak(data.email, data.apiKeys)
  }

  private async executeFoldersEnumeration(data: any): Promise<any> {
    const { executeFoldersEnumeration } = await import('./folders-enumeration-executor')
    return executeFoldersEnumeration(data.url, data.options)
  }

  // Créer une promesse de timeout
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: La tâche a pris trop de temps')), timeout)
    })
  }

  // Obtenir le statut d'une tâche
  getTaskStatus(taskId: string): QueueTask | null {
    console.log(`🔍 Recherche de la tâche: ${taskId}`)
    console.log(`📋 Tâches disponibles: ${Array.from(this.tasks.keys()).join(', ')}`)
    console.log(`📊 Nombre total de tâches: ${this.tasks.size}`)
    
    const task = this.tasks.get(taskId)
    if (task) {
      console.log(`✅ Tâche trouvée: ${task.id} - Status: ${task.status}`)
    } else {
      console.log(`❌ Tâche non trouvée: ${taskId}`)
    }
    
    return task || null
  }

  // Obtenir les statistiques de la file d'attente
  getQueueStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    for (const [taskType, config] of Object.entries(QUEUE_CONFIGS)) {
      const runningCount = this.runningTasks.get(taskType)!.size
      const pendingCount = Array.from(this.tasks.values())
        .filter(task => task.type === taskType && task.status === 'pending').length
      
      stats[taskType] = {
        running: runningCount,
        pending: pendingCount,
        maxConcurrent: config.maxConcurrent,
        available: config.maxConcurrent - runningCount
      }
    }
    
    return stats
  }

  // Nettoyer les anciennes tâches (à appeler périodiquement)
  cleanupOldTasks() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.createdAt < oneDayAgo && task.status !== 'running') {
        this.tasks.delete(taskId)
      }
    }
  }
}

// Instance singleton de la file d'attente
export const taskQueue = new TaskQueue() 