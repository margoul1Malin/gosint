'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiLock, FiKey, FiSearch, FiShield, FiAlertCircle, FiCheckCircle, FiLoader, FiSave, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'

interface ApiKeys {
  leakCheck: string
  haveIBeenPwned: string
}

interface PasswordResult {
  service: string
  found: boolean
  data?: any
  error?: string
}

export default function PasswordLeakPage() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    leakCheck: '',
    haveIBeenPwned: ''
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [savingKeys, setSavingKeys] = useState(false)
  const [results, setResults] = useState<PasswordResult[]>([])
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
          // Extraire uniquement les clés pour password-leak
          const passwordLeakKeys = {
            leakCheck: decryptData.apiKeys.leakCheck || '',
            haveIBeenPwned: decryptData.apiKeys.haveIBeenPwned || ''
          }
          setApiKeys(passwordLeakKeys)
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

    // Vérifier qu'au moins une clé est remplie
    if (!apiKeys.leakCheck && !apiKeys.haveIBeenPwned) {
      setError('Veuillez remplir au moins une clé API avant de sauvegarder')
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
          leakCheck: '',
          haveIBeenPwned: ''
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
    
    if (!password.trim()) {
      setError('Veuillez entrer un mot de passe')
      return
    }

    // Vérifier qu'au moins une API est configurée
    if (!apiKeys.leakCheck && !apiKeys.haveIBeenPwned) {
      setError('Veuillez configurer au moins une clé API')
      return
    }

    setLoading(true)
    setError('')
    setResults([])

    try {
      const response = await fetch('/api/tools/password-leak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          apiKeys
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la vérification')
        return
      }

      setResults(data.results || [])

    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const renderResult = (result: PasswordResult) => {
    const getServiceIcon = (service: string) => {
      switch (service) {
        case 'leakcheck': return <FiShield className="w-5 h-5" />
        case 'haveibeenpwned': return <FiLock className="w-5 h-5" />
        default: return <FiAlertCircle className="w-5 h-5" />
      }
    }

    const getServiceName = (service: string) => {
      switch (service) {
        case 'leakcheck': return 'LeakCheck'
        case 'haveibeenpwned': return 'HaveIBeenPwned'
        default: return service
      }
    }

    const renderLeakCheckData = (data: any) => {
      if (!data) return null
      
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-400">Statut:</span>
              <span className="ml-2 text-white">{data.success ? 'Succès' : 'Échec'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Fuites trouvées:</span>
              <span className="ml-2 text-white">{data.found || 0}</span>
            </div>
          </div>
          
          {data.sources && data.sources.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-400">Sources des fuites:</span>
              <div className="mt-2 space-y-2">
                {data.sources.map((source: any, index: number) => (
                  <div key={index} className="bg-red-900/30 border border-red-800 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-red-300 font-medium">{source.name}</span>
                      <span className="text-red-400 text-sm">{source.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    const renderHaveIBeenPwnedData = (data: any) => {
      if (!data) return null
      
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-400">Expositions:</span>
              <span className="ml-2 text-white">{data.count || 0}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Compromis:</span>
              <span className={`ml-2 ${data.count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {data.count > 0 ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
          
          {data.breaches && data.breaches.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-400">Violations de données:</span>
              <div className="mt-2 space-y-2">
                {data.breaches.map((breach: any, index: number) => (
                  <div key={index} className="bg-red-900/30 border border-red-800 rounded p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-red-300 font-medium">{breach.Name}</span>
                      <span className="text-red-400 text-sm">{breach.BreachDate}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{breach.Description}</p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">Données compromises: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {breach.DataClasses?.map((dataClass: string, idx: number) => (
                          <span key={idx} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                            {dataClass}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    const renderParsedData = () => {
      if (!result.data) return null
      
      switch (result.service) {
        case 'leakcheck':
          return renderLeakCheckData(result.data)
        case 'haveibeenpwned':
          return renderHaveIBeenPwnedData(result.data)
        default:
          return null
      }
    }

    return (
      <div key={result.service} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {getServiceIcon(result.service)}
          <h3 className="text-lg font-semibold text-white">{getServiceName(result.service)}</h3>
          {result.found && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
              Mot de passe compromis
            </span>
          )}
          {!result.found && !result.error && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
              Mot de passe sécurisé
            </span>
          )}
        </div>

        {result.error ? (
          <div className="text-red-400 flex items-center gap-2 mb-3">
            <FiAlertCircle className="w-4 h-4" />
            <span>{result.error}</span>
          </div>
        ) : (
          <div className="text-green-400 flex items-center gap-2 mb-3">
            <FiCheckCircle className="w-4 h-4" />
            <span>Vérification réussie</span>
          </div>
        )}

        {/* Affichage des données parsées */}
        {result.data && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Informations:</h4>
            <div className="bg-gray-900/50 rounded p-3">
              {renderParsedData()}
            </div>
          </div>
        )}

        {/* Affichage du résultat complet pour debug */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <details className="cursor-pointer">
            <summary className="text-sm font-semibold text-gray-400 hover:text-gray-300">
              Résultat complet (JSON)
            </summary>
            <div className="mt-2 bg-gray-900 rounded p-3 overflow-x-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    )
  }

  return (
    <ToolsLayout
      title="Vérificateur de Fuites de Mots de Passe"
      description="Vérifiez si votre mot de passe a été compromis dans des fuites de données"
      icon={<FiLock className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire des clés API */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiKey className="w-5 h-5" />
              Configuration des APIs
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
                Clé API LeakCheck
              </label>
              <input
                type="password"
                value={apiKeys.leakCheck}
                onChange={(e) => setApiKeys(prev => ({ ...prev, leakCheck: e.target.value }))}
                placeholder="Votre clé API LeakCheck"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clé API HaveIBeenPwned
              </label>
              <input
                type="password"
                value={apiKeys.haveIBeenPwned}
                onChange={(e) => setApiKeys(prev => ({ ...prev, haveIBeenPwned: e.target.value }))}
                placeholder="Votre clé API HaveIBeenPwned"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {hasStoredKeys && (
              <div className="text-green-400 text-sm flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                Clés API sauvegardées et chargées
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de vérification */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FiSearch className="w-5 h-5" />
            Vérification du mot de passe
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe à vérifier
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe à vérifier"
                  className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                <>
                  <FiSearch className="w-4 h-4" />
                  Vérifier le mot de passe
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

      {/* Résultats */}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Résultats de la vérification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map(renderResult)}
          </div>
        </div>
      )}

      {/* Conseils de sécurité */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300 mb-4">
          <FiShield className="w-5 h-5" />
          <span className="font-medium">Conseils de sécurité:</span>
        </div>
        <ul className="text-gray-400 space-y-2">
          <li>• Utilisez des mots de passe uniques pour chaque compte</li>
          <li>• Activez l'authentification à deux facteurs quand c'est possible</li>
          <li>• Changez immédiatement tout mot de passe compromis</li>
          <li>• Utilisez un gestionnaire de mots de passe</li>
          <li>• Évitez les mots de passe basés sur des informations personnelles</li>
        </ul>
      </div>

      {/* Note de confidentialité */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300">
          <FiLock className="w-5 h-5" />
          <span className="font-medium">Confidentialité:</span>
        </div>
        <p className="text-gray-400 mt-2">
          Vos clés API sont chiffrées et stockées de manière sécurisée. Les mots de passe ne sont jamais stockés en clair. 
          Toutes les vérifications sont effectuées en temps réel et les données sont supprimées après traitement.
        </p>
      </div>
    </ToolsLayout>
  )
} 