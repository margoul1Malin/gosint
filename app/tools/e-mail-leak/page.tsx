'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiMail, FiKey, FiSearch, FiShield, FiAlertCircle, FiCheckCircle, FiLoader, FiSave, FiTrash2, FiExternalLink } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'

interface ApiKeys {
  leakCheck: string
  hunterIo: string
  holehe: boolean // Holehe ne nécessite pas de clé API
}

interface EmailResult {
  service: string
  found: boolean
  data?: any
  error?: string
}

interface HoleheResult {
  site: string
  found: boolean
  url?: string
  error?: string
}

export default function EmailLeakPage() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    leakCheck: '',
    hunterIo: '',
    holehe: false
  })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [savingKeys, setSavingKeys] = useState(false)
  const [loadingHolehe, setLoadingHolehe] = useState(false)
  const [results, setResults] = useState<EmailResult[]>([])
  const [holeheResults, setHoleheResults] = useState<HoleheResult[]>([])
  const [error, setError] = useState('')
  const [hasStoredKeys, setHasStoredKeys] = useState(false)
  const [holeheTaskId, setHoleheTaskId] = useState<string | null>(null)

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
          // Extraire uniquement les clés pour email-leak
          const emailLeakKeys = {
            leakCheck: decryptData.apiKeys.leakCheck || '',
            hunterIo: decryptData.apiKeys.hunterIo || '',
            holehe: false
          }
          setApiKeys(emailLeakKeys)
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
    if (!apiKeys.leakCheck && !apiKeys.hunterIo) {
      setError('Veuillez remplir au moins une clé API avant de sauvegarder')
      return
    }

    setSavingKeys(true)
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKeys: {
            ...apiKeys,
            // Ajouter les autres clés existantes si elles existent
            leakCheck: apiKeys.leakCheck,
            hunterIo: apiKeys.hunterIo
          }
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
          hunterIo: '',
          holehe: false
        })
        setError('Clés API supprimées avec succès')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Erreur lors de la suppression des clés API')
    }
  }

  // Fonction pour interroger le statut d'une tâche Holehe
  const pollHoleheStatus = async (taskId: string) => {
    console.log(`🚀 Début du polling pour la tâche: ${taskId}`)
    const maxAttempts = 60 // 2 minutes max (60 * 2 secondes)
    let attempts = 0

    const poll = async () => {
      try {
        console.log(`📡 Polling tentative ${attempts + 1}/${maxAttempts} pour la tâche: ${taskId}`)
        const response = await fetch(`/api/queue/status?taskId=${taskId}`)
        const data = await response.json()

        console.log(`📊 Réponse du serveur:`, { status: response.status, data })

        if (response.ok) {
          console.log('Statut Holehe:', data.status)
          
          if (data.status === 'completed') {
            // Tâche terminée avec succès
            console.log('✅ Tâche Holehe terminée avec succès:', data.result)
            setHoleheResults(data.result || [])
            setLoadingHolehe(false)
            setHoleheTaskId(null)
            return
          } else if (data.status === 'failed') {
            // Tâche échouée
            console.error('❌ Erreur Holehe:', data.error)
            setLoadingHolehe(false)
            setHoleheTaskId(null)
            return
          } else if (data.status === 'pending' || data.status === 'running') {
            // Tâche en cours, continuer le polling
            console.log(`⏳ Tâche en cours (${data.status}), tentative ${attempts + 1}/${maxAttempts}`)
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 2000) // Attendre 2 secondes avant le prochain poll
            } else {
              // Timeout
              console.error('⏰ Timeout lors de l\'exécution de Holehe')
              setLoadingHolehe(false)
              setHoleheTaskId(null)
            }
          }
        } else {
          console.error('❌ Erreur lors de la vérification du statut:', data.error)
          console.error('📋 Détails de la réponse:', { status: response.status, data })
          setLoadingHolehe(false)
          setHoleheTaskId(null)
        }
      } catch (error) {
        console.error('💥 Erreur lors du polling:', error)
        attempts++
        if (attempts < maxAttempts) {
          console.log(`🔄 Nouvelle tentative dans 2 secondes (${attempts}/${maxAttempts})`)
          setTimeout(poll, 2000)
        } else {
          console.error('⏰ Timeout final du polling')
          setLoadingHolehe(false)
          setHoleheTaskId(null)
        }
      }
    }

    poll()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Veuillez entrer une adresse email')
      return
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    // Vérifier qu'au moins une API est configurée
    if (!apiKeys.leakCheck && !apiKeys.hunterIo && !apiKeys.holehe) {
      setError('Veuillez configurer au moins une méthode de vérification')
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setHoleheResults([])
    setHoleheTaskId(null)

    try {
      // Exécuter les vérifications API et Holehe
      const promises = []
      
      // API de vérification (LeakCheck, Hunter.io)
      if (apiKeys.leakCheck || apiKeys.hunterIo) {
        promises.push(
          fetch('/api/tools/email-leak', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              apiKeys
            })
          })
        )
      }

      // Holehe - lancer la tâche
      if (apiKeys.holehe) {
        setLoadingHolehe(true)
        promises.push(
          fetch('/api/tools/email-leak/holehe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email
            })
          })
        )
      }

      const responses = await Promise.all(promises)
      
      // Traiter les résultats API
      if (apiKeys.leakCheck || apiKeys.hunterIo) {
        const apiResponse = responses[0]
        const apiData = await apiResponse.json()
        
        if (apiResponse.ok) {
          setResults(apiData.results || [])
        } else {
          setError(apiData.error || 'Erreur lors de la vérification API')
        }
      }

      // Traiter la réponse Holehe
      if (apiKeys.holehe) {
        const holeheResponse = responses[apiKeys.leakCheck || apiKeys.hunterIo ? 1 : 0]
        const holeheData = await holeheResponse.json()
        
        if (holeheResponse.ok) {
          // Holehe retourne un taskId, commencer le polling
          const taskId = holeheData.taskId
          setHoleheTaskId(taskId)
          console.log('Tâche Holehe lancée avec ID:', taskId)
          
          // Commencer le polling pour récupérer les résultats
          pollHoleheStatus(taskId)
        } else {
          console.error('Erreur lors du lancement de Holehe:', holeheData.error)
          setLoadingHolehe(false)
          // Ne pas afficher l'erreur Holehe comme erreur principale
        }
      }

    } catch (err) {
      setError('Erreur de connexion')
      setLoadingHolehe(false)
    } finally {
      setLoading(false)
    }
  }

  const renderResult = (result: EmailResult) => {
    const getServiceIcon = (service: string) => {
      switch (service) {
        case 'leakcheck': return <FiShield className="w-5 h-5" />
        case 'hunter': return <FiSearch className="w-5 h-5" />
        default: return <FiAlertCircle className="w-5 h-5" />
      }
    }

    const getServiceName = (service: string) => {
      switch (service) {
        case 'leakcheck': return 'LeakCheck'
        case 'hunter': return 'Hunter.io'
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
          
          {data.fields && data.fields.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-400">Champs exposés:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.fields.map((field: string, index: number) => (
                  <span key={index} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
          
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

    const renderHunterData = (data: any) => {
      if (!data) return null
      
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-400">Email:</span>
              <span className="ml-2 text-white">{data.email}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Statut:</span>
              <span className={`ml-2 ${data.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                {data.status}
              </span>
            </div>
          </div>
          
          {data.result && (
            <div>
              <span className="text-sm font-medium text-gray-400">Résultat:</span>
              <span className="ml-2 text-white capitalize">{data.result}</span>
            </div>
          )}
          
          {data.score && (
            <div>
              <span className="text-sm font-medium text-gray-400">Score:</span>
              <span className="ml-2 text-white">{data.score}/100</span>
            </div>
          )}
          
          {data.regexp && (
            <div>
              <span className="text-sm font-medium text-gray-400">Format valide:</span>
              <span className={`ml-2 ${data.regexp ? 'text-green-400' : 'text-red-400'}`}>
                {data.regexp ? 'Oui' : 'Non'}
              </span>
            </div>
          )}
          
          {data.gibberish && (
            <div>
              <span className="text-sm font-medium text-gray-400">Gibberish:</span>
              <span className={`ml-2 ${data.gibberish ? 'text-red-400' : 'text-green-400'}`}>
                {data.gibberish ? 'Oui' : 'Non'}
              </span>
            </div>
          )}
          
          {data.disposable && (
            <div>
              <span className="text-sm font-medium text-gray-400">Email jetable:</span>
              <span className={`ml-2 ${data.disposable ? 'text-red-400' : 'text-green-400'}`}>
                {data.disposable ? 'Oui' : 'Non'}
              </span>
            </div>
          )}
          
          {data.webmail && (
            <div>
              <span className="text-sm font-medium text-gray-400">Webmail:</span>
              <span className={`ml-2 ${data.webmail ? 'text-blue-400' : 'text-gray-400'}`}>
                {data.webmail ? 'Oui' : 'Non'}
              </span>
            </div>
          )}
          
          {data.mx_records && (
            <div>
              <span className="text-sm font-medium text-gray-400">MX Records:</span>
              <span className={`ml-2 ${data.mx_records ? 'text-green-400' : 'text-red-400'}`}>
                {data.mx_records ? 'Valides' : 'Invalides'}
              </span>
            </div>
          )}
          
          {data.smtp_server && (
            <div>
              <span className="text-sm font-medium text-gray-400">Serveur SMTP:</span>
              <span className={`ml-2 ${data.smtp_server ? 'text-green-400' : 'text-red-400'}`}>
                {data.smtp_server ? 'Accessible' : 'Inaccessible'}
              </span>
            </div>
          )}
          
          {data.smtp_check && (
            <div>
              <span className="text-sm font-medium text-gray-400">Vérification SMTP:</span>
              <span className={`ml-2 ${data.smtp_check ? 'text-green-400' : 'text-red-400'}`}>
                {data.smtp_check ? 'Succès' : 'Échec'}
              </span>
            </div>
          )}
          
          {data.accept_all && (
            <div>
              <span className="text-sm font-medium text-gray-400">Accept All:</span>
              <span className={`ml-2 ${data.accept_all ? 'text-yellow-400' : 'text-gray-400'}`}>
                {data.accept_all ? 'Oui' : 'Non'}
              </span>
            </div>
          )}
          
          {data.block && (
            <div>
              <span className="text-sm font-medium text-gray-400">Bloqué:</span>
              <span className={`ml-2 ${data.block ? 'text-red-400' : 'text-green-400'}`}>
                {data.block ? 'Oui' : 'Non'}
              </span>
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
        case 'hunter':
          return renderHunterData(result.data)
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
              Fuites détectées
            </span>
          )}
          {!result.found && !result.error && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
              Aucune fuite détectée
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

  const renderHoleheResults = () => {
    if (loadingHolehe) {
      return (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <FiSearch className="w-6 h-6" />
            Holehe - Recherche en cours...
          </h2>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <FiLoader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-300 mb-2">Vérification des comptes associés en cours...</p>
            <p className="text-gray-400 text-sm mb-2">
              Holehe vérifie de nombreux sites, cela peut prendre jusqu'à 2 minutes.
            </p>
            {holeheTaskId && (
              <p className="text-gray-500 text-xs font-mono">
                ID de tâche: {holeheTaskId}
              </p>
            )}
          </div>
        </div>
      )
    }

    if (holeheResults.length === 0) return null

    const foundResults = holeheResults.filter(r => r.found)
    const notFoundResults = holeheResults.filter(r => !r.found && !r.error)
    const errorResults = holeheResults.filter(r => r.error)

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <FiSearch className="w-6 h-6" />
          Résultats Holehe - Comptes associés
        </h2>
        
        {foundResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              Comptes trouvés ({foundResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foundResults.map((result, index) => (
                <div key={index} className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{result.site}</h4>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <p className="text-green-300 text-sm mb-2">Compte trouvé</p>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <FiExternalLink className="w-3 h-3" />
                      Voir le site
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {notFoundResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">
              Comptes non trouvés ({notFoundResults.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {notFoundResults.map((result, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-gray-300 text-sm">{result.site}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {errorResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">
              Erreurs / Rate limits ({errorResults.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {errorResults.map((result, index) => (
                <div key={index} className="bg-yellow-900/20 border border-yellow-700 rounded p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-gray-300 text-sm">{result.site}</span>
                  </div>
                  <p className="text-yellow-400 text-xs mt-1">{result.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Résumé Holehe */}
        <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Résumé Holehe</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {holeheResults.length}
              </div>
              <div className="text-sm text-gray-400">Sites vérifiés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {foundResults.length}
              </div>
              <div className="text-sm text-gray-400">Comptes trouvés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {notFoundResults.length}
              </div>
              <div className="text-sm text-gray-400">Comptes non trouvés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {errorResults.length}
              </div>
              <div className="text-sm text-gray-400">Erreurs / Rate limits</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToolsLayout
      title="Vérificateur de Fuites d'Email"
      description="Vérifiez si votre adresse email a été compromise dans des fuites de données et trouvez les comptes associés"
      icon={<FiMail className="w-8 h-8" />}
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
                Clé API Hunter.io
              </label>
              <input
                type="password"
                value={apiKeys.hunterIo}
                onChange={(e) => setApiKeys(prev => ({ ...prev, hunterIo: e.target.value }))}
                placeholder="Votre clé API Hunter.io"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="holehe"
                checked={apiKeys.holehe}
                onChange={(e) => setApiKeys(prev => ({ ...prev, holehe: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="holehe" className="text-sm font-medium text-gray-300">
                Utiliser Holehe (recherche de comptes associés)
              </label>
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
            Vérification de l'email
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: exemple@domaine.com"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
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
                  Vérifier l'email
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

      {renderHoleheResults()}

      {/* Note de confidentialité */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300">
          <FiShield className="w-5 h-5" />
          <span className="font-medium">Confidentialité:</span>
        </div>
        <p className="text-gray-400 mt-2">
          Vos clés API sont chiffrées et stockées de manière sécurisée. Les adresses email ne sont jamais stockées. 
          Toutes les vérifications sont effectuées en temps réel et les données sont supprimées après traitement.
        </p>
      </div>
    </ToolsLayout>
  )
} 