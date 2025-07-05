import { taskQueue } from './queue'

// Utiliser l'instance singleton existante
export const globalQueue = taskQueue

// Nettoyer les anciennes tâches toutes les 10 minutes
setInterval(() => {
  globalQueue.cleanupOldTasks()
}, 10 * 60 * 1000) 