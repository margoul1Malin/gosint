'use client'

import { useState, useEffect } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiNavigation, 
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiCopy,
  FiClock,
  FiTarget,
  FiActivity,
  FiServer
} from 'react-icons/fi'

interface ToolInfo {
  name: string
  description: string
  icon: string
}

interface TracerouteHop {
  hop: number
  ip: string
  hostname?: string
  rtt1?: number
  rtt2?: number
  rtt3?: number
  timeout?: boolean
}

interface TracerouteResult {
  success: boolean
  result: {
    target: string
    hops: TracerouteHop[]
    totalHops: number
    totalTime: number
    timestamp: string
    exitCode: number
  }
}

export default function TracerouteToolPage() {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TracerouteResult | null>(null)
  const [error, setError] = useState('')
  const [toolInfo, setToolInfo] = useState<ToolInfo>({
    name: 'Traceroute Tool',
    description: 'Tracez le chemin réseau vers une destination',
    icon: 'FiNavigation'
  })

  useEffect(() => {
    const fetchToolInfo = async () => {
      try {
        const response = await fetch('/api/admin/tools?search=traceroute-tool&limit=1')
        if (response.ok) {
          const data = await response.json()
          if (data.tools && data.tools.length > 0) {
            const tool = data.tools[0]
            setToolInfo({
              name: tool.name,
              description: tool.description,
              icon: tool.icon
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l\'outil:', error)
      }
    }

    fetchToolInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!target.trim()) {
      setError('Veuillez entrer une adresse IP ou un nom de domaine')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/traceroute-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: target.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur lors du traceroute')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getAverageRTT = (hop: TracerouteHop) => {
    const rtts = [hop.rtt1, hop.rtt2, hop.rtt3].filter(rtt => rtt !== undefined) as number[]
    if (rtts.length === 0) return null
    return rtts.reduce((sum, rtt) => sum + rtt, 0) / rtts.length
  }

  const getRTTColor = (rtt: number | undefined) => {
    if (!rtt) return 'text-gray-400'
    if (rtt < 50) return 'text-green-400'
    if (rtt < 100) return 'text-yellow-400'
    if (rtt < 200) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <ToolsLayout
      title={toolInfo.name}
      description={toolInfo.description}
      icon={<DynamicIcon iconName={toolInfo.icon} size={48} className="text-blue-400" />}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section d'information */}
        <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">À propos du Traceroute</h2>
          </div>
          <div className="space-y-3 text-blue-300">
            <p>
              Le traceroute trace le chemin que prennent les paquets réseau pour atteindre une destination. 
              Il affiche chaque routeur (hop) traversé avec les temps de réponse correspondants.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiTarget className="mr-2" />
                  Cibles acceptées
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Adresses IP (192.168.1.1)</li>
                  <li>• Noms de domaine (google.com)</li>
                  <li>• Sous-domaines (www.example.com)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiActivity className="mr-2" />
                  Informations affichées
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Numéro de hop</li>
                  <li>• Adresse IP du routeur</li>
                  <li>• Nom d'hôte (si disponible)</li>
                  <li>• Temps de réponse (RTT)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiServer className="mr-2" />
                  Utilisation
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Diagnostic réseau</li>
                  <li>• Détection de problèmes</li>
                  <li>• Analyse de performance</li>
                  <li>• Investigation OSINT</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/30 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-blue-300 mb-2">
                Destination (IP ou nom de domaine)
              </label>
              <div className="relative">
                <input
                  id="target"
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="ex: google.com ou 8.8.8.8"
                  className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiNavigation className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !target.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Traceroute en cours...</span>
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5" />
                  <span>Lancer le traceroute</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FiCheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Traceroute terminé</h3>
            </div>

            {/* Informations générales */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiTarget className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Destination</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="text-white font-mono text-sm">{result.result.target}</code>
                  <button
                    onClick={() => copyToClipboard(result.result.target)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiActivity className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Hops totaux</span>
                </div>
                <span className="text-white font-bold text-lg">{result.result.totalHops}</span>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiClock className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300">Temps total</span>
                </div>
                <span className="text-white font-bold text-lg">{formatTime(result.result.totalTime)}</span>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Code de sortie</span>
                </div>
                <span className="text-white font-bold text-lg">{result.result.exitCode}</span>
              </div>
            </div>

            {/* Tableau des hops */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-blue-500/30">
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Hop</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">IP</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Hostname</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">RTT 1</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">RTT 2</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">RTT 3</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {result.result.hops.map((hop, index) => (
                    <tr key={index} className="border-b border-gray-700/50 hover:bg-blue-900/10">
                      <td className="py-3 px-4 text-white font-mono">{hop.hop}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <code className="text-white font-mono text-sm">
                            {hop.timeout ? '*' : hop.ip}
                          </code>
                          {!hop.timeout && hop.ip !== '*' && (
                            <button
                              onClick={() => copyToClipboard(hop.ip)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {hop.hostname ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-cyan-300 text-sm">{hop.hostname}</span>
                            <button
                              onClick={() => copyToClipboard(hop.hostname!)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className={`py-3 px-4 font-mono text-sm ${getRTTColor(hop.rtt1)}`}>
                        {hop.rtt1 ? `${hop.rtt1}ms` : '*'}
                      </td>
                      <td className={`py-3 px-4 font-mono text-sm ${getRTTColor(hop.rtt2)}`}>
                        {hop.rtt2 ? `${hop.rtt2}ms` : '*'}
                      </td>
                      <td className={`py-3 px-4 font-mono text-sm ${getRTTColor(hop.rtt3)}`}>
                        {hop.rtt3 ? `${hop.rtt3}ms` : '*'}
                      </td>
                      <td className={`py-3 px-4 font-mono text-sm font-bold ${getRTTColor(getAverageRTT(hop) || undefined)}`}>
                        {getAverageRTT(hop) ? `${getAverageRTT(hop)!.toFixed(1)}ms` : '*'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Légende des couleurs RTT</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">&lt; 50ms (Excellent)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400">50-100ms (Bon)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-400">100-200ms (Moyen)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-red-400">&gt; 200ms (Lent)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 