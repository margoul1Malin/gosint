'use client'

import { useState, useEffect } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiShield, 
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiCopy,
  FiClock,
  FiTarget,
  FiActivity,
  FiServer,
  FiLock,
  FiUnlock,
  FiEyeOff
} from 'react-icons/fi'

interface ToolInfo {
  name: string
  description: string
  icon: string
}

interface Port {
  port: number
  protocol: string
  state: string
  service: string
  version?: string
}

interface PortScanResult {
  success: boolean
  result: {
    target: string
    ports: Port[]
    totalPorts: number
    openPorts: number
    closedPorts: number
    filteredPorts: number
    scanTime: number
    timestamp: string
    scanType: string
    osInfo?: string
    extraInfo?: {
      mac?: string
      latency?: string
      networkDistance?: string
      deviceType?: string
      serviceInfo?: string
      scriptResults?: string
    }
  }
}

export default function PortScannerPage() {
  const [target, setTarget] = useState('')
  const [ports, setPorts] = useState('1-1000')
  const [scanType, setScanType] = useState('tcp')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PortScanResult | null>(null)
  const [error, setError] = useState('')
  const [toolInfo, setToolInfo] = useState<ToolInfo>({
    name: 'Port Scanner',
    description: 'Scanner de ports réseau utilisant Nmap',
    icon: 'FiShield'
  })

  useEffect(() => {
    const fetchToolInfo = async () => {
      try {
        const response = await fetch('/api/admin/tools?search=port-scanner&limit=1')
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
      setError('Veuillez entrer une cible (IP ou domaine)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/port-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          target: target.trim(),
          ports: ports.trim(),
          scanType: scanType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur lors du scan de ports')
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

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open': return 'text-green-400 bg-green-900/20 border-green-500/30'
      case 'closed': return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'filtered': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30'
    }
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'open': return <FiUnlock className="w-4 h-4" />
      case 'closed': return <FiLock className="w-4 h-4" />
      case 'filtered': return <FiEyeOff className="w-4 h-4" />
      default: return <FiActivity className="w-4 h-4" />
    }
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }

  const getCommonPorts = () => {
    return [
      { port: '80', desc: 'HTTP' },
      { port: '443', desc: 'HTTPS' },
      { port: '22', desc: 'SSH' },
      { port: '21', desc: 'FTP' },
      { port: '25', desc: 'SMTP' },
      { port: '53', desc: 'DNS' },
      { port: '3389', desc: 'RDP' },
      { port: '3306', desc: 'MySQL' }
    ]
  }

  return (
    <ToolsLayout
      title={toolInfo.name}
      description={toolInfo.description}
      icon={<DynamicIcon iconName={toolInfo.icon} size={48} className="text-red-400" />}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section d'information */}
        <div className="bg-gradient-to-r from-red-900/10 to-orange-900/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">À propos du Port Scanner</h2>
          </div>
          <div className="space-y-3 text-red-300">
            <p>
              Le scanner de ports utilise Nmap pour identifier les ports ouverts, fermés ou filtrés sur une cible. 
              Il peut détecter les services en cours d'exécution et leurs versions.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiTarget className="mr-2" />
                  Types de scan
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• <span className="text-blue-400">TCP Connect</span> : Scan standard</li>
                  <li>• <span className="text-purple-400">SYN Scan</span> : Scan furtif</li>
                  <li>• <span className="text-green-400">UDP Scan</span> : Protocole UDP</li>
                  <li>• <span className="text-red-400">Agressif</span> : OS + services + scripts</li>
                  <li>• <span className="text-yellow-400">Détection OS</span> : Identification système</li>
                  <li>• <span className="text-cyan-400">Services</span> : Versions des services</li>
                  <li>• <span className="text-orange-400">Furtif</span> : Scan discret</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiActivity className="mr-2" />
                  États des ports
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• <span className="text-green-400">Ouvert</span> : Service actif</li>
                  <li>• <span className="text-red-400">Fermé</span> : Port fermé</li>
                  <li>• <span className="text-yellow-400">Filtré</span> : Firewall/filtre</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <FiServer className="mr-2" />
                  Formats de ports
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Port unique : 80</li>
                  <li>• Plusieurs ports : 80,443</li>
                  <li>• Plage : 1-1000</li>
                  <li>• Mixte : 80,443,8080-8090</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de scan */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cible */}
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-red-300 mb-2">
                  Cible (IP ou domaine)
                </label>
                <div className="relative">
                  <input
                    id="target"
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="ex: scanme.nmap.org ou 192.168.1.1"
                    className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FiTarget className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </div>

              {/* Ports */}
              <div>
                <label htmlFor="ports" className="block text-sm font-medium text-red-300 mb-2">
                  Ports à scanner
                </label>
                <div className="relative">
                  <input
                    id="ports"
                    type="text"
                    value={ports}
                    onChange={(e) => setPorts(e.target.value)}
                    placeholder="ex: 1-1000 ou 80,443,8080-8090"
                    className="w-full px-4 py-3 bg-black/50 border border-red-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FiShield className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Type de scan */}
            <div>
              <label className="block text-sm font-medium text-red-300 mb-2">
                Type de scan
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { value: 'tcp', label: 'TCP Connect', desc: 'Scan TCP standard', icon: FiShield },
                  { value: 'syn', label: 'SYN Scan', desc: 'Scan furtif (root requis)', icon: FiEyeOff },
                  { value: 'udp', label: 'UDP Scan', desc: 'Scan UDP', icon: FiActivity },
                  { value: 'aggressive', label: 'Agressif', desc: 'OS + services + scripts', icon: FiTarget },
                  { value: 'os-detection', label: 'Détection OS', desc: 'Identification système', icon: FiServer },
                  { value: 'service-detection', label: 'Détection services', desc: 'Versions des services', icon: FiSearch },
                  { value: 'stealth', label: 'Furtif', desc: 'Scan discret + decoys', icon: FiLock }
                ].map((type) => (
                  <label key={type.value} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    scanType === type.value 
                      ? 'border-red-500 bg-red-900/20' 
                      : 'border-red-500/30 bg-black/30 hover:bg-red-900/10'
                  }`}>
                    <input
                      type="radio"
                      value={type.value}
                      checked={scanType === type.value}
                      onChange={(e) => setScanType(e.target.value)}
                      className="text-red-400 focus:ring-red-400"
                      disabled={loading}
                    />
                    <type.icon className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <span className="text-white font-medium block">{type.label}</span>
                      <p className="text-xs text-gray-400">{type.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Ports communs */}
            <div>
              <label className="block text-sm font-medium text-red-300 mb-2">
                Ports communs (cliquez pour utiliser)
              </label>
              <div className="flex flex-wrap gap-2">
                {getCommonPorts().map((port) => (
                  <button
                    key={port.port}
                    type="button"
                    onClick={() => setPorts(port.port)}
                    className="px-3 py-1 bg-red-900/20 border border-red-500/30 rounded text-red-300 hover:bg-red-900/40 transition-colors text-sm"
                    disabled={loading}
                  >
                    {port.port} ({port.desc})
                  </button>
                ))}
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
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Scan en cours...</span>
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5" />
                  <span>Lancer le scan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FiCheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Scan terminé</h3>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiTarget className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Cible</span>
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
                  <FiUnlock className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Ouverts</span>
                </div>
                <span className="text-white font-bold text-lg">{result.result.openPorts}</span>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiLock className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Fermés</span>
                </div>
                <span className="text-white font-bold text-lg">{result.result.closedPorts}</span>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiEyeOff className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-300">Filtrés</span>
                </div>
                <span className="text-white font-bold text-lg">{result.result.filteredPorts}</span>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiClock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Durée</span>
                </div>
                <span className="text-white font-bold text-lg">{formatTime(result.result.scanTime)}</span>
              </div>
            </div>

            {/* Informations supplémentaires */}
            {(result.result.osInfo || result.result.extraInfo) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiInfo className="w-5 h-5 mr-2 text-blue-400" />
                  Informations supplémentaires
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.result.osInfo && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiServer className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-300">Système d'exploitation</span>
                      </div>
                      <p className="text-white text-sm">{result.result.osInfo}</p>
                    </div>
                  )}
                  
                  {result.result.extraInfo?.mac && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiActivity className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-300">Adresse MAC</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <code className="text-white font-mono text-sm">{result.result.extraInfo.mac}</code>
                        <button
                          onClick={() => copyToClipboard(result.result.extraInfo!.mac!)}
                          className="text-orange-400 hover:text-orange-300 transition-colors"
                        >
                          <FiCopy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {result.result.extraInfo?.latency && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiClock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">Latence</span>
                      </div>
                      <p className="text-white text-sm">{result.result.extraInfo.latency}</p>
                    </div>
                  )}
                  
                  {result.result.extraInfo?.networkDistance && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiTarget className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-300">Distance réseau</span>
                      </div>
                      <p className="text-white text-sm">{result.result.extraInfo.networkDistance}</p>
                    </div>
                  )}
                  
                  {result.result.extraInfo?.deviceType && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiServer className="w-4 h-4 text-pink-400" />
                        <span className="text-sm text-pink-300">Type d'appareil</span>
                      </div>
                      <p className="text-white text-sm">{result.result.extraInfo.deviceType}</p>
                    </div>
                  )}
                  
                  {result.result.extraInfo?.serviceInfo && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiInfo className="w-4 h-4 text-teal-400" />
                        <span className="text-sm text-teal-300">Infos services</span>
                      </div>
                      <p className="text-white text-sm">{result.result.extraInfo.serviceInfo}</p>
                    </div>
                  )}
                  
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiShield className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-cyan-300">Type de scan</span>
                    </div>
                    <p className="text-white text-sm capitalize">{result.result.scanType}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats de scripts (pour scan agressif) */}
            {result.result.extraInfo?.scriptResults && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-yellow-400" />
                  Résultats des scripts
                </h4>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {result.result.extraInfo.scriptResults}
                  </pre>
                </div>
              </div>
            )}

            {/* Tableau des ports */}
            {result.result.ports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-red-500/30">
                      <th className="text-left py-3 px-4 text-red-300 font-medium">Port</th>
                      <th className="text-left py-3 px-4 text-red-300 font-medium">Protocole</th>
                      <th className="text-left py-3 px-4 text-red-300 font-medium">État</th>
                      <th className="text-left py-3 px-4 text-red-300 font-medium">Service</th>
                      <th className="text-left py-3 px-4 text-red-300 font-medium">Version</th>
                      <th className="text-left py-3 px-4 text-red-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.result.ports.map((port, index) => (
                      <tr key={index} className="border-b border-gray-700/50 hover:bg-red-900/5">
                        <td className="py-3 px-4 text-white font-mono font-bold">{port.port}</td>
                        <td className="py-3 px-4 text-cyan-300 uppercase">{port.protocol}</td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStateColor(port.state)}`}>
                            {getStateIcon(port.state)}
                            <span className="text-sm font-medium">{port.state}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-yellow-300">{port.service}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {port.version || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => copyToClipboard(`${port.port}/${port.protocol}`)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiShield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Aucun port trouvé
                </h3>
                <p className="text-gray-400">
                  Aucun port n'a été détecté dans la plage spécifiée.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 