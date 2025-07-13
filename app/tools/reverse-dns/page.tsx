'use client'

import { useState, useEffect } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiSearch, 
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiCopy,
  FiClock,
  FiGlobe,
  FiServer,
  FiDatabase,
  FiLink
} from 'react-icons/fi'

interface ToolInfo {
  name: string
  description: string
  icon: string
}

interface ReverseDNSResult {
  success: boolean
  result: {
    ip: string
    hostnames: string[]
    found: boolean
    timestamp: string
    responseTime: number
  }
}

export default function ReverseDNSPage() {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReverseDNSResult | null>(null)
  const [error, setError] = useState('')
  const [toolInfo, setToolInfo] = useState<ToolInfo>({
    name: 'Reverse DNS Lookup',
    description: 'Résolvez une adresse IP vers son nom d\'hôte',
    icon: 'FiSearch'
  })

  useEffect(() => {
    const fetchToolInfo = async () => {
      try {
        const response = await fetch('/api/admin/tools?search=reverse-dns&limit=1')
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
    
    if (!ip.trim()) {
      setError('Veuillez entrer une adresse IP')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/reverse-dns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip: ip.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur lors de la résolution DNS')
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

  const validateIP = (ipAddress: string) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    return ipv4Regex.test(ipAddress) || ipv6Regex.test(ipAddress)
  }

  const getIPType = (ipAddress: string) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Regex.test(ipAddress) ? 'IPv4' : 'IPv6'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIp(value)
    
    // Validation en temps réel
    if (value && validateIP(value.trim())) {
      setError('')
    }
  }

  return (
    <ToolsLayout
      title={toolInfo.name}
      description={toolInfo.description}
      icon={<DynamicIcon iconName={toolInfo.icon} size={48} className="text-green-400" />}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section d'information */}
        <div className="bg-gradient-to-r from-green-900/10 to-emerald-900/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">À propos du Reverse DNS</h2>
          </div>
          <div className="space-y-3 text-green-300">
            <p>
              Le Reverse DNS (rDNS) permet de résoudre une adresse IP vers son nom d'hôte associé. 
              Cette technique est utile pour identifier les serveurs, vérifier l'authenticité et analyser l'infrastructure réseau.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiGlobe className="mr-2" />
                  Formats supportés
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• IPv4 (192.168.1.1)</li>
                  <li>• IPv6 (2001:db8::1)</li>
                  <li>• Adresses publiques</li>
                  <li>• Adresses privées</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiServer className="mr-2" />
                  Informations obtenues
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Nom d'hôte principal</li>
                  <li>• Noms d'hôte alternatifs</li>
                  <li>• Temps de réponse DNS</li>
                  <li>• Statut de résolution</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiDatabase className="mr-2" />
                  Cas d'usage
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Investigation OSINT</li>
                  <li>• Vérification d'identité</li>
                  <li>• Audit de sécurité</li>
                  <li>• Analyse d'infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/30 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ip-address" className="block text-sm font-medium text-green-300 mb-2">
                Adresse IP (IPv4 ou IPv6)
              </label>
              <div className="relative">
                <input
                  id="ip-address"
                  type="text"
                  value={ip}
                  onChange={handleInputChange}
                  placeholder="ex: 8.8.8.8 ou 2001:4860:4860::8888"
                  className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiSearch className="w-5 h-5 text-green-400" />
                </div>
              </div>
              {ip && validateIP(ip.trim()) && (
                <p className="text-xs text-green-400 mt-1">
                  Format détecté : {getIPType(ip.trim())}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !ip.trim() || !validateIP(ip.trim())}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Résolution en cours...</span>
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5" />
                  <span>Résoudre l'adresse IP</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              {result.result.found ? (
                <FiCheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <FiAlertCircle className="w-6 h-6 text-yellow-400" />
              )}
              <h3 className="text-xl font-bold text-white">
                {result.result.found ? 'Résolution réussie' : 'Aucun nom d\'hôte trouvé'}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Informations IP */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-300 mb-2">Adresse IP analysée</h4>
                  <div className="flex items-center space-x-2 bg-black/30 rounded-lg p-3">
                    <code className="text-white font-mono">{result.result.ip}</code>
                    <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                      {getIPType(result.result.ip)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.result.ip)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-green-300 mb-2">Temps de réponse</h4>
                  <div className="flex items-center space-x-2 bg-black/30 rounded-lg p-3">
                    <FiClock className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">{result.result.responseTime}ms</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-green-300 mb-2">Timestamp</h4>
                  <div className="bg-black/30 rounded-lg p-3">
                    <span className="text-white text-sm">
                      {new Date(result.result.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Noms d'hôte */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-300 mb-2">
                    Noms d'hôte ({result.result.hostnames.length})
                  </h4>
                  {result.result.hostnames.length > 0 ? (
                    <div className="space-y-2">
                      {result.result.hostnames.map((hostname, index) => (
                        <div key={index} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <FiLink className="w-4 h-4 text-green-400" />
                            <code className="text-green-300 font-mono text-sm">{hostname}</code>
                            <button
                              onClick={() => copyToClipboard(hostname)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <FiAlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300">Aucun nom d'hôte trouvé</span>
                      </div>
                      <p className="text-yellow-200 text-sm mt-2">
                        Cette adresse IP n'a pas de résolution DNS inverse configurée.
                      </p>
                    </div>
                  )}
                </div>

                {!result.result.found && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">Suggestions</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• Vérifiez que l'adresse IP est correcte</li>
                      <li>• Certaines IP n'ont pas de rDNS configuré</li>
                      <li>• Les adresses privées n'ont généralement pas de rDNS</li>
                      <li>• Essayez avec une adresse IP publique</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 