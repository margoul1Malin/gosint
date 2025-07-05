'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Calendar, Shield, Settings, Bell } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import NotificationPanel from '@/app/components/NotificationPanel'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  // Vérifier l'authentification
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400 border-red-400/30 bg-red-400/10'
      case 'PREMIUM': return 'text-accent border-accent/30 bg-accent/10'
      case 'MODERATOR': return 'text-secondary border-secondary/30 bg-secondary/10'
      default: return 'text-primary border-primary/30 bg-primary/10'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-primary font-mono cyber-glow mb-4">
              <span className="text-accent">{'>'}</span> Profil
            </h1>
            <p className="text-xl text-foreground/70">
              Gérez votre compte et vos notifications aOSINT
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 rounded font-mono transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-foreground/70 hover:text-foreground hover:bg-surface/30'
                }`}
              >
                <User className="w-4 h-4 mr-2 inline" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-3 rounded font-mono transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-foreground/70 hover:text-foreground hover:bg-surface/30'
                }`}
              >
                <Bell className="w-4 h-4 mr-2 inline" />
                Notifications
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
                {/* User Avatar & Basic Info */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-24 h-24 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-primary font-mono mb-2">
                      {session.user.name}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-mono border ${getRoleColor(session.user.role)}`}>
                        {session.user.role}
                      </span>
                      <span className="text-foreground/60 font-mono">
                        Statut: {session.user.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-surface/30 border border-primary/20 rounded-lg">
                      <Mail className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-foreground/60 font-mono">Email</p>
                        <p className="text-foreground font-mono">{session.user.email}</p>
                      </div>
                    </div>

                    {session.user.phone && (
                      <div className="flex items-center space-x-3 p-4 bg-surface/30 border border-primary/20 rounded-lg">
                        <Phone className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm text-foreground/60 font-mono">Téléphone</p>
                          <p className="text-foreground font-mono">{session.user.phone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-4 bg-surface/30 border border-primary/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-foreground/60 font-mono">ID Utilisateur</p>
                        <p className="text-foreground font-mono text-xs">{session.user.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-surface/30 border border-primary/20 rounded-lg">
                      <Shield className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-foreground/60 font-mono">Statut du compte</p>
                        <p className="text-foreground font-mono">{session.user.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-surface/30 border border-primary/20 rounded-lg">
                      <User className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-foreground/60 font-mono">Nom complet</p>
                        <p className="text-foreground font-mono">
                          {session.user.firstName && session.user.lastName
                            ? `${session.user.firstName} ${session.user.lastName}`
                            : session.user.name || 'Non renseigné'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-surface/30 border border-primary/20 rounded-lg">
                      <Settings className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-sm text-foreground/60 font-mono">Rôle</p>
                        <p className="text-foreground font-mono">{session.user.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 p-6 bg-surface/30 border border-primary/20 rounded-lg">
                  <h3 className="text-xl font-bold text-primary font-mono mb-4">
                    Informations du compte
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">✓</p>
                      <p className="text-sm text-foreground/60 font-mono">Compte actif</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary">{session.user.role}</p>
                      <p className="text-sm text-foreground/60 font-mono">Niveau d'accès</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-4xl mx-auto">
              <NotificationPanel />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
} 