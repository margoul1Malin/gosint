'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.name || !formData.email) {
      setError('Le nom et l\'email sont requis')
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Format d\'email invalide')
      return false
    }

    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Format de téléphone invalide')
      return false
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Compte créé avec succès ! Redirection vers la connexion...')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.message || data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      {/* Fond avec effets cyberpunk */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      
      {/* Lignes de scan */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-mono text-primary cyber-glow mb-2">
            aOSINT
          </h1>
          <p className="text-accent font-mono text-sm">
            Advanced Open Source Intelligence
          </p>
          <div className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-black/80 backdrop-blur-md border border-primary/20 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Inscription
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                className="w-full px-4 py-3 bg-black/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Votre nom complet"
                required
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full px-4 py-3 bg-black/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                Téléphone (optionnel)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-black/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Minimum 8 caractères"
                required
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-black/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Confirmer le mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cyber-button-primary px-6 py-3 rounded-lg font-medium text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inscription...
                </span>
              ) : (
                'S\'inscrire'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/70 text-sm">
              Déjà un compte ?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-foreground/50 text-xs">
            © 2024 aOSINT. Plateforme sécurisée d'intelligence open source.
          </p>
        </div>
      </div>
    </div>
  )
} 