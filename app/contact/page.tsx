'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Shield, AlertCircle, User } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function ContactPage() {
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          subject: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rediriger vers la page de connexion si pas connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin'
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
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
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-8xl md:text-[8rem] font-bold font-mono text-primary cyber-glow mb-6">
              Contact
            </h1>
            <p className="text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Contactez l'équipe aOSINT pour vos questions ou suggestions
            </p>
          </div>
        </div>
      </section>

      {/* User Info Display */}
      <section className="py-8 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-primary mr-3" />
              <h3 className="text-xl font-semibold text-primary font-mono">Utilisateur connecté</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-foreground/80">
              <div>
                <span className="text-accent font-mono">Nom:</span> {session.user?.name || 'Non défini'}
              </div>
              <div>
                <span className="text-accent font-mono">Email:</span> {session.user?.email || 'Non défini'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-surface/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-primary font-mono mb-4 cyber-glow">
              <span className="text-accent">{'>'}</span> Envoyez-nous un message
            </h2>
            <p className="text-xl text-foreground/70 mb-8">
              Décrivez votre demande et nous vous répondrons rapidement
            </p>
          </div>

          <div className="bg-surface/20 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-primary font-medium mb-2 font-mono">
                  Sujet *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Objet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-primary font-medium mb-2 font-mono">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-background border border-primary/30 rounded-lg text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center">
                  <Shield className="w-5 h-5 text-primary mr-3" />
                  <p className="text-primary">Message envoyé avec succès ! Nous vous répondrons sous 24h.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-error/10 border border-error/30 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-error mr-3" />
                  <p className="text-error">Erreur lors de l'envoi. Veuillez réessayer.</p>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cyber-button-primary px-8 py-4 rounded-lg font-bold text-lg flex items-center transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2 font-mono">Réponse rapide</h3>
              <p className="text-foreground/70">
                Nous nous engageons à répondre à tous les messages sous 24 heures ouvrables
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-accent mb-2 font-mono">Support personnalisé</h3>
              <p className="text-foreground/70">
                Notre équipe d'experts vous accompagne avec un support adapté à vos besoins
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 