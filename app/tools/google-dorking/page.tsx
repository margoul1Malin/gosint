'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiSearch, FiKey, FiExternalLink, FiLoader, FiSave, FiTrash2, FiCheckCircle, FiAlertCircle, FiEye, FiTarget } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'

interface ApiKeys {
  serpApi: string
}

interface DorkResult {
  dork: string
  query: string
  results: SearchResult[]
  error?: string
}

interface SearchResult {
  title: string
  link: string
  snippet?: string
  position?: number
}

interface GoogleDorkingResponse {
  results: DorkResult[]
  summary: {
    totalDorks: number
    successfulDorks: number
    totalResults: number
    errors: number
  }
  error?: string
}

export default function GoogleDorkingPage() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    serpApi: ''
  })
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [savingKeys, setSavingKeys] = useState(false)
  const [results, setResults] = useState<DorkResult[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState('')
  const [hasStoredKeys, setHasStoredKeys] = useState(false)

  // Charger les clés API sauvegardées au montage du composant
  useEffect(() => {
    if (session?.user) {
      loadStoredApiKeys()
    }
  }, [session])

  const loadStoredApiKeys = async () => {
    setLoadingKeys(true)
    try {
      const response = await fetch('/api/user/api-keys')
      const data = await response.json()
      
      if (data.hasKeys) {
        setHasStoredKeys(true)
        // Charger les vraies clés pour utilisation
        const decryptResponse = await fetch('/api/user/api-keys/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        const decryptData = await decryptResponse.json()
        if (decryptData.apiKeys) {
          // Extraire uniquement les clés pour google-dorking
          const googleDorkingKeys = {
            serpApi: decryptData.apiKeys.serpApi || ''
          }
          setApiKeys(googleDorkingKeys)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clés API:', error)
    } finally {
      setLoadingKeys(false)
    }
  }

  const saveApiKeys = async () => {
    if (!session?.user) {
      setError('Vous devez être connecté pour sauvegarder vos clés API')
      return
    }

    if (!apiKeys.serpApi) {
      setError('Veuillez remplir la clé API SerpApi avant de sauvegarder')
      return
    }

    setSavingKeys(true)
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKeys: apiKeys
        })
      })

      const data = await response.json()
      if (data.success) {
        setHasStoredKeys(true)
        setError('')
        // Afficher un message de succès temporaire
        const successMsg = 'Clés API sauvegardées avec succès !'
        setError(successMsg)
        setTimeout(() => setError(''), 3000)
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      setError('Erreur de connexion lors de la sauvegarde')
    } finally {
      setSavingKeys(false)
    }
  }

  const deleteStoredKeys = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setHasStoredKeys(false)
        setApiKeys({
          serpApi: ''
        })
        setError('Clés API supprimées avec succès')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur lors de la suppression des clés API')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!target.trim()) {
      setError('Veuillez entrer une cible à rechercher')
      return
    }

    if (!apiKeys.serpApi) {
      setError('Veuillez configurer votre clé API SerpApi')
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setSummary(null)

    try {
      const response = await fetch('/api/tools/google-dorking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target,
          apiKeys
        })
      })

      const data: GoogleDorkingResponse = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la recherche')
        return
      }

      setResults(data.results || [])
      setSummary(data.summary)

    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const renderResult = (result: DorkResult, index: number) => {
    return (
      <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Dork #{index + 1}
            </h3>
            <div className="bg-gray-900 rounded p-2 mb-3">
              <code className="text-blue-300 text-sm break-all">{result.query}</code>
            </div>
          </div>
          <div className="ml-4">
            {result.results.length > 0 && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                {result.results.length} résultat(s)
              </span>
            )}
            {result.results.length === 0 && !result.error && (
              <span className="bg-gray-500 text-white px-2 py-1 rounded text-sm">
                Aucun résultat
              </span>
            )}
            {result.error && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                Erreur
              </span>
            )}
          </div>
        </div>

        {result.error && (
          <div className="text-red-400 flex items-center gap-2 mb-3">
            <FiAlertCircle className="w-4 h-4" />
            <span>{result.error}</span>
          </div>
        )}

        {result.results.length > 0 && (
          <div className="space-y-3">
            {result.results.map((searchResult, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded p-3 border border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium flex-1 mr-2">
                    {searchResult.title}
                  </h4>
                  <a
                    href={searchResult.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                  >
                    <FiExternalLink className="w-3 h-3" />
                    Ouvrir
                  </a>
                </div>
                <p className="text-blue-400 text-sm mb-2 break-all">
                  {searchResult.link}
                </p>
                {searchResult.snippet && (
                  <p className="text-gray-300 text-sm">
                    {searchResult.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ToolsLayout
      title="Google Dorking"
      description="Recherche OSINT avancée avec des dorks Google prédéfinis"
      icon={<FiSearch className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire des clés API */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiKey className="w-5 h-5" />
              Configuration API
            </h2>
            
            {session?.user && (
              <div className="flex items-center gap-2">
                {hasStoredKeys && (
                  <button
                    onClick={deleteStoredKeys}
                    className="text-red-400 hover:text-red-300 p-1 rounded"
                    title="Supprimer les clés sauvegardées"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={saveApiKeys}
                  disabled={savingKeys}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  {savingKeys ? (
                    <FiLoader className="w-3 h-3 animate-spin" />
                  ) : (
                    <FiSave className="w-3 h-3" />
                  )}
                  Sauvegarder
                </button>
              </div>
            )}
          </div>

          {loadingKeys && (
            <div className="text-center py-4">
              <FiLoader className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-400 mt-2">Chargement des clés API...</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clé API SerpApi
              </label>
              <input
                type="password"
                value={apiKeys.serpApi}
                onChange={(e) => setApiKeys(prev => ({ ...prev, serpApi: e.target.value }))}
                placeholder="Votre clé API SerpApi"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Obtenez votre clé API sur <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">serpapi.com</a>
              </p>
            </div>

            {hasStoredKeys && (
              <div className="text-green-400 text-sm flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                Clés API sauvegardées et chargées
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FiTarget className="w-5 h-5" />
            Recherche de cible
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cible à rechercher
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="nom, email, numéro de téléphone, pseudo..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Entrez n'importe quelle information (nom, email, téléphone, etc.)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <FiSearch className="w-4 h-4" />
                  Lancer la recherche
                </>
              )}
            </button>
          </form>

          {error && (
            <div className={`mt-4 p-3 border rounded-md flex items-center gap-2 ${
              error.includes('succès') 
                ? 'bg-green-900 border-green-700 text-green-300' 
                : 'bg-red-900 border-red-700 text-red-300'
            }`}>
              <FiAlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Résumé des résultats */}
      {summary && (
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Résumé de la recherche</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{summary.totalDorks}</div>
              <div className="text-sm text-gray-400">Dorks testés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{summary.successfulDorks}</div>
              <div className="text-sm text-gray-400">Dorks avec résultats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{summary.totalResults}</div>
              <div className="text-sm text-gray-400">Résultats totaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
              <div className="text-sm text-gray-400">Erreurs</div>
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Résultats de la recherche</h2>
          <div className="space-y-6">
            {results.map(renderResult)}
          </div>
        </div>
      )}

      {/* Informations sur les dorks */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300 mb-4">
          <FiEye className="w-5 h-5" />
          <span className="font-medium">Dorks utilisés:</span>
        </div>
        <p className="text-gray-400 mb-2">
          Cet outil utilise {results.length > 0 ? summary?.totalDorks : '48'} dorks prédéfinis pour rechercher votre cible sur:
        </p>
        <ul className="text-gray-400 space-y-1 text-sm">
          <li>• Réseaux sociaux (Facebook, Twitter, LinkedIn, Instagram, etc.)</li>
          <li>• Sites de numéros de téléphone et SMS</li>
          <li>• Forums et sites communautaires</li>
          <li>• Sites de paste et fuites de données</li>
          <li>• Bases de données de violations</li>
          <li>• Sites d'annuaires et d'informations</li>
        </ul>
      </div>

      {/* Note de responsabilité */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300">
          <FiAlertCircle className="w-5 h-5" />
          <span className="font-medium">Utilisation responsable:</span>
        </div>
        <p className="text-gray-400 mt-2">
          Cet outil est destiné à des fins légitimes de recherche OSINT. Respectez la vie privée et les lois en vigueur. 
          N'utilisez ces informations que dans un cadre légal et éthique.
        </p>
      </div>
    </ToolsLayout>
  )
} 