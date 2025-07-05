'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { FiPhone, FiKey, FiSearch, FiShield, FiAlertCircle, FiCheckCircle, FiLoader, FiSave, FiTrash2, FiExternalLink } from 'react-icons/fi'
import ToolsLayout from '@/app/components/ToolsLayout'

interface ApiKeys {
  leakCheck: string
  numVerify: string
  twilioSid: string
  twilioToken: string
  ignorant: string
}

interface GoogleDorksResult {
  category: string
  site: string
  found: boolean
  url: string
}

interface PhoneResult {
  service: string
  found: boolean
  data?: any
  error?: string
}

interface GoogleDorksResponse {
  results: GoogleDorksResult[]
  summary: {
    totalChecks: number
    foundResults: number
  }
}

interface IgnorantResult {
  site: string
  found: boolean
  url?: string
  error?: string
}

export default function PhoneLeakPage() {
  const { data: session } = useSession()
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    leakCheck: '',
    numVerify: '',
    twilioSid: '',
    twilioToken: '',
    ignorant: ''
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [savingKeys, setSavingKeys] = useState(false)
  const [results, setResults] = useState<PhoneResult[]>([])
  const [googleDorksResults, setGoogleDorksResults] = useState<GoogleDorksResult[]>([])
  const [ignorantResults, setIgnorantResults] = useState<IgnorantResult[]>([])
  const [loadingIgnorant, setLoadingIgnorant] = useState(false)
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
          // Extraire uniquement les clés pour phone-leak
          const phoneLeakKeys = {
            leakCheck: decryptData.apiKeys.leakCheck || '',
            numVerify: decryptData.apiKeys.numVerify || '',
            twilioSid: decryptData.apiKeys.twilioSid || '',
            twilioToken: decryptData.apiKeys.twilioToken || '',
            ignorant: decryptData.apiKeys.ignorant || ''
          }
          setApiKeys(phoneLeakKeys)
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
    if (!apiKeys.leakCheck && !apiKeys.numVerify && (!apiKeys.twilioSid || !apiKeys.twilioToken)) {
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
          numVerify: '',
          twilioSid: '',
          twilioToken: '',
          ignorant: ''
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
    
    if (!phoneNumber.trim()) {
      setError('Veuillez entrer un numéro de téléphone')
      return
    }

    // Vérifier qu'au moins une API est configurée
    if (!apiKeys.leakCheck && !apiKeys.numVerify && (!apiKeys.twilioSid || !apiKeys.twilioToken)) {
      setError('Veuillez configurer au moins une clé API')
      return
    }

    setLoading(true)
    setError('')
    setResults([])
    setGoogleDorksResults([])
    setIgnorantResults([])

    try {
      // Exécuter les vérifications en parallèle
      const promises = []
      
      // API de vérification (LeakCheck, NumVerify, Twilio)
      if (apiKeys.leakCheck || apiKeys.numVerify || apiKeys.twilioSid) {
        promises.push(
          fetch('/api/tools/phone-leak', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber,
              apiKeys
            })
          })
        )
      }

      // Google Dorks
      promises.push(
        fetch('/api/tools/phone-leak/google-dorks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber
          })
        })
      )

      // Ignorant
      if (apiKeys.ignorant) {
        setLoadingIgnorant(true)
        
        try {
          const ignorantResponse = await fetch('/api/tools/phone-leak/ignorant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber
            })
          })
          
          const ignorantData = await ignorantResponse.json()
          
          if (ignorantResponse.ok && ignorantData.taskId) {
            // Interroger le statut de la tâche
            const pollTaskStatus = async (taskId: string) => {
              const maxAttempts = 30 // 30 tentatives max (2 minutes)
              let attempts = 0
              
              const poll = async (): Promise<void> => {
                if (attempts >= maxAttempts) {
                  console.error('Timeout: Ignorant a pris trop de temps')
                  setLoadingIgnorant(false)
                  return
                }
                
                try {
                  const statusResponse = await fetch(`/api/queue/status?taskId=${taskId}`)
                  const statusData = await statusResponse.json()
                  
                  if (statusResponse.ok) {
                    console.log(`📊 Statut de la tâche ${taskId}:`, statusData.status)
                    
                    if (statusData.status === 'completed') {
                      console.log('✅ Tâche terminée, résultats:', statusData.result)
                      setIgnorantResults(statusData.result || [])
                      setLoadingIgnorant(false)
                      return
                    } else if (statusData.status === 'failed') {
                      console.error('❌ Tâche échouée:', statusData.error)
                      setLoadingIgnorant(false)
                      return
                    } else if (statusData.status === 'running' || statusData.status === 'pending') {
                      console.log(`⏳ Tâche en cours (${statusData.status}), nouvelle tentative dans 4s...`)
                      // Ne pas incrémenter attempts pour les tâches en cours
                      setTimeout(poll, 4000)
                      return
                    }
                  } else {
                    console.error('Erreur lors de la vérification du statut:', statusData.error)
                    attempts++
                    setTimeout(poll, 4000)
                  }
                } catch (error) {
                  console.error('Erreur lors de la vérification du statut:', error)
                  attempts++
                  setTimeout(poll, 4000)
                }
              }
              
              poll()
            }
            
            pollTaskStatus(ignorantData.taskId)
          } else {
            console.error('Erreur Ignorant:', ignorantData.error)
            setLoadingIgnorant(false)
          }
        } catch (error) {
          console.error('Erreur lors de l\'appel à Ignorant:', error)
          setLoadingIgnorant(false)
        }
      }

      const responses = await Promise.all(promises)
      
      // Traiter les résultats API
      if (apiKeys.leakCheck || apiKeys.numVerify || apiKeys.twilioSid) {
        const apiResponse = responses[0]
        const apiData = await apiResponse.json()
        
        if (apiResponse.ok) {
          setResults(apiData.results || [])
        } else {
          setError(apiData.error || 'Erreur lors de la vérification')
        }
      }

      // Traiter les résultats Google Dorks
      const googleDorksResponse = responses[apiKeys.leakCheck || apiKeys.numVerify || apiKeys.twilioSid ? 1 : 0]
      const googleDorksData = await googleDorksResponse.json()
      
      if (googleDorksResponse.ok) {
        setGoogleDorksResults(googleDorksData.results || [])
      }

    } catch (err) {
      setError('Erreur de connexion')
      setLoadingIgnorant(false)
    } finally {
      setLoading(false)
    }
  }

  const renderResult = (result: PhoneResult) => {
    const getServiceIcon = (service: string) => {
      switch (service) {
        case 'leakcheck': return <FiShield className="w-5 h-5" />
        case 'numverify': return <FiCheckCircle className="w-5 h-5" />
        case 'twilio': return <FiPhone className="w-5 h-5" />
        default: return <FiAlertCircle className="w-5 h-5" />
      }
    }

    const getServiceName = (service: string) => {
      switch (service) {
        case 'leakcheck': return 'LeakCheck'
        case 'numverify': return 'NumVerify'
        case 'twilio': return 'Twilio Lookup'
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

    const renderNumVerifyData = (data: any) => {
      if (!data) return null
      
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-400">Valide:</span>
              <span className={`ml-2 ${data.valid ? 'text-green-400' : 'text-red-400'}`}>
                {data.valid ? 'Oui' : 'Non'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Type:</span>
              <span className="ml-2 text-white capitalize">{data.line_type}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="text-sm font-medium text-gray-400">Numéro:</span>
              <span className="ml-2 text-white">{data.international_format}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Format local:</span>
              <span className="ml-2 text-white">{data.local_format}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Pays:</span>
              <span className="ml-2 text-white">{data.country_name} ({data.country_code})</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Opérateur:</span>
              <span className="ml-2 text-white">{data.carrier}</span>
            </div>
            {data.location && (
              <div>
                <span className="text-sm font-medium text-gray-400">Localisation:</span>
                <span className="ml-2 text-white">{data.location}</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    const renderTwilioData = (data: any) => {
      if (!data) return null
      
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-400">Valide:</span>
              <span className={`ml-2 ${data.valid ? 'text-green-400' : 'text-red-400'}`}>
                {data.valid ? 'Oui' : 'Non'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Pays:</span>
              <span className="ml-2 text-white">{data.country_code}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="text-sm font-medium text-gray-400">Numéro:</span>
              <span className="ml-2 text-white">{data.phone_number}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-400">Format national:</span>
              <span className="ml-2 text-white">{data.national_format}</span>
            </div>
          </div>
          
          {data.line_type_intelligence && (
            <div className="border-t border-gray-700 pt-3">
              <h5 className="text-sm font-semibold text-gray-300 mb-2">Informations de ligne:</h5>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-400">Type:</span>
                  <span className="ml-2 text-white capitalize">{data.line_type_intelligence.type}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-400">Opérateur:</span>
                  <span className="ml-2 text-white">{data.line_type_intelligence.carrier_name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-400">MCC:</span>
                  <span className="ml-2 text-white">{data.line_type_intelligence.mobile_country_code}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-400">MNC:</span>
                  <span className="ml-2 text-white">{data.line_type_intelligence.mobile_network_code}</span>
                </div>
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
        case 'numverify':
          return renderNumVerifyData(result.data)
        case 'twilio':
          return renderTwilioData(result.data)
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

  const renderGoogleDorksResults = () => {
    if (googleDorksResults.length === 0) return null

    // Grouper les résultats par catégorie
    const groupedResults = googleDorksResults.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    }, {} as Record<string, GoogleDorksResult[]>)

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'Social Media': return '📱'
        case 'Disposable Providers': return '🗑️'
        case 'Reputation': return '⭐'
        case 'Individuals': return '👤'
        case 'French Sites': return '🇫🇷'
        case 'General': return '🔍'
        default: return '🔍'
      }
    }

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'Social Media': return 'text-blue-400'
        case 'Disposable Providers': return 'text-red-400'
        case 'Reputation': return 'text-yellow-400'
        case 'Individuals': return 'text-green-400'
        case 'French Sites': return 'text-orange-400'
        case 'General': return 'text-purple-400'
        default: return 'text-gray-400'
      }
    }

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <FiSearch className="w-6 h-6" />
          Résultats Google Dorks
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedResults).map(([category, results]) => (
            <div key={category} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <h3 className={`text-lg font-semibold ${getCategoryColor(category)}`}>
                  {category}
                </h3>
                <span className="text-sm text-gray-400">
                  ({results.filter(r => r.found).length}/{results.length})
                </span>
              </div>
              
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${result.found ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm text-gray-300">{result.site}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${result.found ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {result.found ? 'Trouvé' : 'Non trouvé'}
                      </span>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs"
                        title="Voir sur Google"
                      >
                        🔗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Résumé des Google Dorks */}
        <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Résumé Google Dorks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {googleDorksResults.length}
              </div>
              <div className="text-sm text-gray-400">Vérifications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {googleDorksResults.filter(r => r.found).length}
              </div>
              <div className="text-sm text-gray-400">Résultats trouvés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {googleDorksResults.filter(r => !r.found).length}
              </div>
              <div className="text-sm text-gray-400">Aucun résultat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(groupedResults).length}
              </div>
              <div className="text-sm text-gray-400">Catégories</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderIgnorantResults = () => {
    if (loadingIgnorant) {
      return (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <FiSearch className="w-6 h-6" />
            Ignorant - Recherche en cours...
          </h2>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <FiLoader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-300 mb-2">Vérification des comptes sur les réseaux sociaux...</p>
            <p className="text-gray-400 text-sm">
              Ignorant vérifie de nombreux sites, cela peut prendre jusqu'à 60 secondes.
            </p>
          </div>
        </div>
      )
    }

    if (ignorantResults.length === 0) return null

    const foundResults = ignorantResults.filter(r => r.found)
    const notFoundResults = ignorantResults.filter(r => !r.found)

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <FiSearch className="w-6 h-6" />
          Résultats Ignorant - Réseaux Sociaux
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
                  <p className="text-green-300 text-sm mb-2">Numéro trouvé</p>
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
          <div>
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
        
        {/* Résumé Ignorant */}
        <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Résumé Ignorant</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {ignorantResults.length}
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToolsLayout
      title="Vérificateur de Fuites de Téléphone"
      description="Vérifiez si votre numéro de téléphone a été compromis dans des fuites de données"
      icon={<FiPhone className="w-8 h-8" />}
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
                Clé API NumVerify
              </label>
              <input
                type="password"
                value={apiKeys.numVerify}
                onChange={(e) => setApiKeys(prev => ({ ...prev, numVerify: e.target.value }))}
                placeholder="Votre clé API NumVerify"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="twilio"
                checked={apiKeys.twilioSid !== ''}
                onChange={(e) => {
                  if (e.target.checked) {
                    setApiKeys(prev => ({ ...prev, twilioSid: 'demo', twilioToken: 'demo' }))
                  } else {
                    setApiKeys(prev => ({ ...prev, twilioSid: '', twilioToken: '' }))
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="twilio" className="text-sm font-medium text-gray-300">
                Twilio (Lookup API)
              </label>
            </div>

            {apiKeys.twilioSid && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twilio Account SID
                  </label>
                  <input
                    type="password"
                    value={apiKeys.twilioSid}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, twilioSid: e.target.value }))}
                    placeholder="Votre SID Twilio"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twilio Auth Token
                  </label>
                  <input
                    type="password"
                    value={apiKeys.twilioToken}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, twilioToken: e.target.value }))}
                    placeholder="Votre Token Twilio"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ignorant"
                checked={apiKeys.ignorant !== ''}
                onChange={(e) => {
                  if (e.target.checked) {
                    setApiKeys(prev => ({ ...prev, ignorant: 'enabled' }))
                  } else {
                    setApiKeys(prev => ({ ...prev, ignorant: '' }))
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="ignorant" className="text-sm font-medium text-gray-300">
                Ignorant (Recherche sur les réseaux sociaux)
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
            Vérification du numéro
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 0643323412 ou +33643323412"
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
                  Vérifier le numéro
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(renderResult)}
          </div>
        </div>
      )}

      {renderGoogleDorksResults()}

      {renderIgnorantResults()}

      {/* Autres Ressources */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300 mb-4">
          <FiAlertCircle className="w-5 h-5" />
          <span className="font-medium">Autres Ressources:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a 
            href="https://www.truecaller.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FiPhone className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-white font-medium">Truecaller</h3>
              <p className="text-gray-400 text-sm">Identification d'appelant et blocage de spam</p>
            </div>
          </a>
          <a 
            href="https://sync.me/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FiSearch className="w-5 h-5 text-green-400" />
            <div>
              <h3 className="text-white font-medium">Sync.me</h3>
              <p className="text-gray-400 text-sm">Recherche d'identité et caller ID</p>
            </div>
          </a>
        </div>
      </div>

      {/* Note de confidentialité */}
      <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-gray-300">
          <FiShield className="w-5 h-5" />
          <span className="font-medium">Confidentialité:</span>
        </div>
        <p className="text-gray-400 mt-2">
          Vos clés API sont chiffrées et stockées de manière sécurisée. Les numéros de téléphone ne sont jamais stockés. 
          Toutes les vérifications sont effectuées en temps réel et les données sont supprimées après traitement.
        </p>
      </div>
    </ToolsLayout>
  )
} 