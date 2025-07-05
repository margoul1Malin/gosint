'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, User, Calendar, Clock, CheckCircle, AlertTriangle, Trash2, Eye, Reply, Filter, Send } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

interface ContactMessage {
  id: string
  subject: string
  message: string
  status: 'PENDING' | 'RESOLVED' | 'ARCHIVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminMessages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  // Vérifier les permissions admin
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    loadMessages()
  }, [session, status, router, currentPage, filterStatus, filterPriority])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterPriority !== 'all' && { priority: filterPriority })
      })

      const response = await fetch(`/api/admin/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await loadMessages()
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      setIsReplying(true)
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reply: replyText.trim(),
          originalSubject: selectedMessage.subject
        }),
      })

      if (response.ok) {
        setReplyText('')
        setShowReplyForm(false)
        // Marquer le message comme résolu après réponse
        await updateMessageStatus(selectedMessage.id, 'RESOLVED')
        alert('Réponse envoyée avec succès !')
      } else {
        alert('Erreur lors de l\'envoi de la réponse')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error)
      alert('Erreur lors de l\'envoi de la réponse')
    } finally {
      setIsReplying(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadMessages()
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-secondary border-secondary/30 bg-secondary/10'
      case 'RESOLVED': return 'text-primary border-primary/30 bg-primary/10'
      case 'ARCHIVED': return 'text-foreground/60 border-foreground/30 bg-foreground/10'
      default: return 'text-foreground/60 border-foreground/30 bg-foreground/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-accent border-accent/30 bg-accent/10'
      case 'MEDIUM': return 'text-secondary border-secondary/30 bg-secondary/10'
      case 'HIGH': return 'text-primary border-primary/30 bg-primary/10'
      case 'URGENT': return 'text-red-400 border-red-400/30 bg-red-400/10'
      default: return 'text-foreground/60 border-foreground/30 bg-foreground/10'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Chargement des messages...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-accent hover:text-accent/80 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
              <h1 className="text-4xl font-bold text-primary font-mono cyber-glow">
                <span className="text-accent">{'>'}</span> Messages de contact
              </h1>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-accent mr-2" />
                <span className="text-foreground/70 font-mono">Filtres:</span>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface/30 border border-primary/30 rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary/50"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="RESOLVED">Résolu</option>
                <option value="ARCHIVED">Archivé</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-surface/30 border border-primary/30 rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary/50"
              >
                <option value="all">Toutes les priorités</option>
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Élevée</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          {/* Liste des messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Liste */}
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`bg-surface/20 backdrop-blur-sm border rounded-lg p-6 cursor-pointer transition-all hover:bg-surface/30 ${
                    selectedMessage?.id === message.id
                      ? 'border-primary/50 bg-surface/30'
                      : 'border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary font-mono mb-2">
                        {message.subject}
                      </h3>
                      <div className="flex items-center text-sm text-foreground/70 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        {message.user.name} ({message.user.email})
                      </div>
                      <div className="flex items-center text-sm text-foreground/70">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-mono border ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-mono border ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground/70">Aucun message trouvé</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
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

            {/* Détails du message */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              {selectedMessage ? (
                <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary font-mono mb-2">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-foreground/70">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {selectedMessage.user.name}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-accent mb-3">Message:</h3>
                    <div className="bg-surface/30 border border-primary/20 rounded-lg p-4">
                      <p className="text-foreground/80 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-mono border ${getStatusColor(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-mono border ${getPriorityColor(selectedMessage.priority)}`}>
                        {selectedMessage.priority}
                      </span>
                    </div>
                  </div>

                  {/* Formulaire de réponse */}
                  {showReplyForm && (
                    <div className="mb-6 p-4 bg-surface/30 border border-accent/30 rounded-lg">
                      <h3 className="text-lg font-semibold text-accent mb-3">Répondre à {selectedMessage.user.name}:</h3>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tapez votre réponse ici..."
                        className="w-full h-32 bg-surface/30 border border-primary/30 rounded-lg p-3 text-foreground placeholder-foreground/50 focus:outline-none focus:border-primary/50 resize-none"
                      />
                      <div className="flex justify-end space-x-3 mt-3">
                        <button
                          onClick={() => {
                            setShowReplyForm(false)
                            setReplyText('')
                          }}
                          className="px-4 py-2 bg-surface/30 border border-foreground/30 rounded text-foreground hover:bg-surface/40 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={sendReply}
                          disabled={!replyText.trim() || isReplying}
                          className="flex items-center px-4 py-2 bg-accent/20 border border-accent/30 rounded text-accent hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReplying ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {isReplying ? 'Envoi...' : 'Envoyer'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-accent mb-3">Actions:</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="flex items-center justify-center px-4 py-2 bg-accent/20 border border-accent/30 rounded text-accent hover:bg-accent/30 transition-colors"
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Répondre
                      </button>

                      <button
                        onClick={() => updateMessageStatus(selectedMessage.id, 'RESOLVED')}
                        className="flex items-center justify-center px-4 py-2 bg-primary/20 border border-primary/30 rounded text-primary hover:bg-primary/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Résoudre
                      </button>

                      <button
                        onClick={() => updateMessageStatus(selectedMessage.id, 'ARCHIVED')}
                        className="flex items-center justify-center px-4 py-2 bg-foreground/10 border border-foreground/30 rounded text-foreground hover:bg-foreground/20 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Archiver
                      </button>

                      <button
                        onClick={() => updateMessageStatus(selectedMessage.id, 'PENDING')}
                        className="flex items-center justify-center px-4 py-2 bg-secondary/20 border border-secondary/30 rounded text-secondary hover:bg-secondary/30 transition-colors"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        En attente
                      </button>

                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="flex items-center justify-center px-4 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors col-span-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6 text-center">
                  <MessageSquare className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground/70">Sélectionnez un message pour voir les détails</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 