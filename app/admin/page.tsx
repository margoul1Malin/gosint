'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, MessageSquare, Shield, Activity, Settings, BarChart3, AlertTriangle, CheckCircle, Clock, X, Wrench } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalMessages: number
  pendingMessages: number
  activeUsers: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMessages: 0,
    pendingMessages: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  // Vérifier les permissions admin
  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Vérifier si l'utilisateur est admin
    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Charger les statistiques
    loadStats()
  }, [session, status, router])

  const loadStats = async () => {
    try {
      setLoading(true)
      // Charger les statistiques depuis l'API
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Chargement du panel admin...</p>
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
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Effets de fond cyberpunk */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Lignes de scan animées */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse delay-1000"></div>
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-secondary to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent animate-pulse delay-1500"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-8xl md:text-[8rem] font-bold font-mono text-primary cyber-glow mb-6">
              ADMIN
            </h1>
            <p className="text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Panel d'administration aOSINT - Gestion complète de la plateforme
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 hover:bg-surface/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm font-mono">UTILISATEURS</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6 hover:border-accent/50 hover:bg-surface/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm font-mono">MESSAGES</p>
                  <p className="text-3xl font-bold text-accent">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-accent" />
              </div>
            </div>

            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:border-secondary/50 hover:bg-surface/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm font-mono">EN ATTENTE</p>
                  <p className="text-3xl font-bold text-secondary">{stats.pendingMessages}</p>
                </div>
                <Clock className="w-8 h-8 text-secondary" />
              </div>
            </div>

            <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 hover:bg-surface/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground/60 text-sm font-mono">ACTIFS</p>
                  <p className="text-3xl font-bold text-primary">{stats.activeUsers}</p>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-surface/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-primary font-mono mb-4 cyber-glow">
              <span className="text-accent">{'>'}</span> Actions rapides
            </h2>
            <p className="text-xl text-foreground/70">
              Gérez votre plateforme aOSINT en quelques clics
            </p>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 transition-all">
              <h3 className="text-lg font-semibold text-accent mb-4">Messages</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/messages" 
                  className="block w-full text-left px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  Gérer les messages
                </Link>
                <Link 
                  href="/admin/messages/new" 
                  className="block w-full text-left px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/40 transition-colors"
                >
                  Nouveau message
                </Link>
              </div>
            </div>

            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 transition-all">
              <h3 className="text-lg font-semibold text-accent mb-4">Utilisateurs</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/users" 
                  className="block w-full text-left px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  Gérer les utilisateurs
                </Link>
                <Link 
                  href="/admin/users/analytics" 
                  className="block w-full text-left px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/40 transition-colors"
                >
                  Analytiques
                </Link>
              </div>
            </div>

            <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 transition-all">
              <h3 className="text-lg font-semibold text-accent mb-4">Outils OSINT</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/tools" 
                  className="block w-full text-left px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
                >
                  Gérer les outils
                </Link>
                <Link 
                  href="/admin/tools/new" 
                  className="block w-full text-left px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/40 transition-colors"
                >
                  Nouvel outil
                </Link>
                <Link 
                  href="/admin/tools/categories" 
                  className="block w-full text-left px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/40 transition-colors"
                >
                  Gérer les catégories
                </Link>
                <Link 
                  href="/admin/tools/categories/new" 
                  className="block w-full text-left px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/40 transition-colors"
                >
                  Nouvelle catégorie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 