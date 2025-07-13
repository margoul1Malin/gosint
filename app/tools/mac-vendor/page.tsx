'use client'

import { useState, useEffect } from 'react'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiWifi, 
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiCopy,
  FiEye
} from 'react-icons/fi'

interface ToolInfo {
  name: string
  description: string
  icon: string
}

interface MacVendorResult {
  success: boolean
  result: {
    macAddress: string
    oui: string
    vendor: string
    found: boolean
    formattedMac?: string
  }
}

export default function MacVendorPage() {
  const [macAddress, setMacAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MacVendorResult | null>(null)
  const [error, setError] = useState('')
  const [toolInfo, setToolInfo] = useState<ToolInfo>({
    name: 'MAC Vendor Lookup',
    description: 'Identifiez le fabricant d\'un équipement réseau via son adresse MAC',
    icon: 'FiWifi'
  })

  useEffect(() => {
    const fetchToolInfo = async () => {
      try {
        const response = await fetch('/api/admin/tools?search=mac-vendor&limit=1')
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
    
    if (!macAddress.trim()) {
      setError('Veuillez entrer une adresse MAC')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/tools/mac-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ macAddress: macAddress.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur lors de la recherche')
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

  const formatMacAddress = (mac: string) => {
    const cleaned = mac.replace(/[^a-fA-F0-9]/g, '')
    return cleaned.match(/.{1,2}/g)?.join(':') || mac
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMacAddress(value)
    
    // Validation en temps réel
    if (value && value.replace(/[^a-fA-F0-9]/g, '').length >= 6) {
      setError('')
    }
  }

  return (
    <ToolsLayout
      title={toolInfo.name}
      description={toolInfo.description}
      icon={<DynamicIcon iconName={toolInfo.icon} size={48} className="text-cyan-400" />}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section d'information */}
        <div className="bg-gradient-to-r from-cyan-900/10 to-blue-900/10 border border-cyan-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">À propos des adresses MAC</h2>
          </div>
          <div className="space-y-3 text-cyan-300">
            <p>
              Une adresse MAC (Media Access Control) est un identifiant unique attribué à chaque interface réseau. 
              Les 6 premiers caractères (OUI - Organizationally Unique Identifier) identifient le fabricant.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Formats acceptés :</h3>
                <ul className="text-sm space-y-1">
                  <li>• 00:1A:2B (avec deux-points)</li>
                  <li>• 00-1A-2B (avec tirets)</li>
                  <li>• 001A2B (sans séparateur)</li>
                  <li>• 001a2b (minuscules acceptées)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Utilisation :</h3>
                <ul className="text-sm space-y-1">
                  <li>• Identification d'équipements réseau</li>
                  <li>• Investigation forensique</li>
                  <li>• Audit de sécurité réseau</li>
                  <li>• Gestion d'inventaire IT</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="mac-address" className="block text-sm font-medium text-cyan-300 mb-2">
                Adresse MAC (6 premiers caractères minimum)
              </label>
              <div className="relative">
                <input
                  id="mac-address"
                  type="text"
                  value={macAddress}
                  onChange={handleInputChange}
                  placeholder="ex: 00:1A:2B ou 001A2B"
                  maxLength={8}
                  className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FiWifi className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              {macAddress && (
                <p className="text-xs text-cyan-400 mt-1">
                  Formaté : {formatMacAddress(macAddress)}
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
              disabled={loading || !macAddress.trim()}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Recherche en cours...</span>
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5" />
                  <span>Rechercher le fabricant</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              {result.result.found ? (
                <FiCheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <FiAlertCircle className="w-6 h-6 text-yellow-400" />
              )}
              <h3 className="text-xl font-bold text-white">
                {result.result.found ? 'Fabricant trouvé' : 'Fabricant non trouvé'}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Informations MAC */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">Adresse MAC saisie</h4>
                  <div className="flex items-center space-x-2 bg-black/30 rounded-lg p-3">
                    <code className="text-white font-mono">{result.result.macAddress}</code>
                    <button
                      onClick={() => copyToClipboard(result.result.macAddress)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">OUI (6 premiers caractères)</h4>
                  <div className="flex items-center space-x-2 bg-black/30 rounded-lg p-3">
                    <code className="text-white font-mono">{result.result.oui}</code>
                    <button
                      onClick={() => copyToClipboard(result.result.oui)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {result.result.formattedMac && (
                  <div>
                    <h4 className="text-sm font-medium text-cyan-300 mb-2">Adresse MAC formatée</h4>
                    <div className="flex items-center space-x-2 bg-black/30 rounded-lg p-3">
                      <code className="text-white font-mono">{result.result.formattedMac}</code>
                      <button
                        onClick={() => copyToClipboard(result.result.formattedMac!)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations fabricant */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-cyan-300 mb-2">Fabricant</h4>
                  <div className={`rounded-lg p-4 ${
                    result.result.found 
                      ? 'bg-green-900/20 border border-green-500/30' 
                      : 'bg-yellow-900/20 border border-yellow-500/30'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <FiEye className={`w-5 h-5 ${
                        result.result.found ? 'text-green-400' : 'text-yellow-400'
                      }`} />
                      <span className={`font-medium ${
                        result.result.found ? 'text-green-300' : 'text-yellow-300'
                      }`}>
                        {result.result.vendor}
                      </span>
                    </div>
                    {result.result.found && (
                      <button
                        onClick={() => copyToClipboard(result.result.vendor)}
                        className="mt-2 text-xs text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1"
                      >
                        <FiCopy className="w-3 h-3" />
                        <span>Copier le nom du fabricant</span>
                      </button>
                    )}
                  </div>
                </div>

                {!result.result.found && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">Suggestions</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>• Vérifiez que l'adresse MAC est correcte</li>
                      <li>• Essayez avec une adresse MAC complète</li>
                      <li>• Le fabricant pourrait ne pas être dans la base</li>
                      <li>• Contactez-nous pour ajouter des fabricants</li>
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