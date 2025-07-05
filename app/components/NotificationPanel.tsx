'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, X, MessageSquare, AlertTriangle, Info, Shield, Clock } from 'lucide-react'

interface Notification {
  id: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ADMIN_REPLY' | 'SYSTEM_UPDATE' | 'SECURITY_ALERT'
  title: string
  message: string
  isRead: boolean
  metadata?: any
  createdAt: string
  readAt?: string
}

interface NotificationPanelProps {
  className?: string
}

export default function NotificationPanel({ className = '' }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [currentPage, showUnreadOnly])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(showUnreadOnly && { unreadOnly: 'true' })
      })

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAsRead',
          notificationIds
        }),
      })

      if (response.ok) {
        await loadNotifications()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAllAsRead'
        }),
      })

      if (response.ok) {
        await loadNotifications()
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ADMIN_REPLY':
        return <MessageSquare className="w-5 h-5 text-accent" />
      case 'SUCCESS':
        return <Check className="w-5 h-5 text-primary" />
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-secondary" />
      case 'ERROR':
        return <X className="w-5 h-5 text-red-400" />
      case 'SECURITY_ALERT':
        return <Shield className="w-5 h-5 text-red-400" />
      case 'SYSTEM_UPDATE':
        return <Info className="w-5 h-5 text-accent" />
      default:
        return <Bell className="w-5 h-5 text-foreground/60" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ADMIN_REPLY':
        return 'border-accent/30 bg-accent/5'
      case 'SUCCESS':
        return 'border-primary/30 bg-primary/5'
      case 'WARNING':
        return 'border-secondary/30 bg-secondary/5'
      case 'ERROR':
        return 'border-red-400/30 bg-red-400/5'
      case 'SECURITY_ALERT':
        return 'border-red-400/30 bg-red-400/5'
      case 'SYSTEM_UPDATE':
        return 'border-accent/30 bg-accent/5'
      default:
        return 'border-foreground/30 bg-foreground/5'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className={`bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell className="w-6 h-6 text-primary mr-3" />
          <h2 className="text-2xl font-bold text-primary font-mono">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="ml-3 px-2 py-1 bg-accent/20 border border-accent/30 rounded-full text-xs text-accent font-mono">
              {unreadCount} nouvelles
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
              showUnreadOnly
                ? 'bg-accent/20 border border-accent/30 text-accent'
                : 'bg-surface/30 border border-foreground/30 text-foreground/70 hover:bg-surface/40'
            }`}
          >
            {showUnreadOnly ? 'Toutes' : 'Non lues'}
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-3 py-1 bg-primary/20 border border-primary/30 rounded text-primary hover:bg-primary/30 transition-colors text-sm font-mono"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Tout marquer
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Chargement des notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
          <p className="text-foreground/70">
            {showUnreadOnly ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all hover:bg-surface/30 ${
                notification.isRead 
                  ? 'border-foreground/20 bg-foreground/5 opacity-70' 
                  : getNotificationColor(notification.type)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground font-mono">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-foreground/60 font-mono">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead([notification.id])}
                            className="text-accent hover:text-accent/80 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-foreground/80 whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    
                    {notification.metadata && (
                      <div className="mt-2 text-sm text-foreground/60 font-mono">
                        {notification.metadata.adminName && (
                          <span>Réponse de: {notification.metadata.adminName}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-surface/30 border border-primary/30 rounded text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface/40 transition-colors"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-foreground/70">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-surface/30 border border-primary/30 rounded text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface/40 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 