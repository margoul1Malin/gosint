'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Tentative de connexion avec:', identifier)

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false
      })

      console.log('Résultat de signIn:', result)

      if (result?.error) {
        console.log('Erreur de connexion:', result.error)
        setError('Email/téléphone ou mot de passe incorrect')
      } else {
        console.log('Connexion réussie, vérification de la session...')
        // Vérifier la session et rediriger
        const session = await getSession()
        console.log('Session récupérée:', session)
        if (session) {
          console.log('Redirection vers la page d\'accueil')
          router.push('/')
        }
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err)
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
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

        {/* Formulaire de connexion */}
        <div className="bg-black/80 backdrop-blur-md border border-primary/20 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Connexion
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Email ou Téléphone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="email@example.com ou +33123456789"
                required
              />
            </div>

            <div>
              <label className="block text-foreground text-sm font-medium mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-primary/20 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cyber-button-primary px-6 py-3 rounded-lg font-medium text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-foreground/70 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium">
                S'inscrire
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-accent hover:text-accent/80 text-sm">
              Mot de passe oublié ?
            </Link>
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