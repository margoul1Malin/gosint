'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiWifi, 
  FiArrowRight,
  FiLoader,
  FiAlertCircle
} from 'react-icons/fi'

interface Tool {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
}

export default function NetworkToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tools/reseau')
      
      if (response.ok) {
        const data = await response.json()
        setTools(data.tools || [])
        setCategory(data.category || null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du chargement des outils')
      }
    } catch (error) {
      setError('Erreur de connexion')
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ToolsLayout
        title="Outils Réseau"
        description="Analysez et diagnostiquez les infrastructures réseau avec nos outils spécialisés"
        icon={<FiWifi className="w-12 h-12 text-blue-400" />}
      >
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </ToolsLayout>
    )
  }

  if (error) {
    return (
      <ToolsLayout
        title="Outils Réseau"
        description="Analysez et diagnostiquez les infrastructures réseau avec nos outils spécialisés"
        icon={<FiWifi className="w-12 h-12 text-blue-400" />}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </ToolsLayout>
    )
  }

  return (
    <ToolsLayout
      title={category?.name || "Outils Réseau"}
      description={category?.description || "Analysez et diagnostiquez les infrastructures réseau avec nos outils spécialisés"}
      icon={<FiWifi className="w-12 h-12 text-blue-400" />}
    >
      <div className="mb-8">
        <div className="bg-surface/20 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <FiWifi className="w-6 h-6" />
            À propos de l'analyse réseau
          </h2>
          <p className="text-foreground/70 mb-4">
            L'analyse réseau est un domaine essentiel de l'OSINT qui permet d'examiner les infrastructures, 
            services et communications réseau pour collecter des informations techniques et de sécurité. Ces outils vous aident à :
          </p>
          <ul className="text-foreground/70 space-y-2">
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Identifier les services et ports ouverts sur une cible</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Cartographier la topologie et l'infrastructure réseau</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Analyser le trafic et détecter les anomalies</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Évaluer la sécurité et identifier les vulnérabilités</span>
            </li>
          </ul>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12">
          <FiWifi className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground/70 mb-2">
            Aucun outil disponible
          </h3>
          <p className="text-foreground/50">
            Les outils de cette catégorie seront bientôt disponibles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.isActive ? `/tools/${tool.slug}` : '#'}
              className={`group ${!tool.isActive ? 'cursor-not-allowed' : ''}`}
            >
              <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                {/* Icône de l'outil */}
                <div className="flex items-center justify-center w-12 h-12 bg-blue-400/10 rounded-lg mb-4 group-hover:bg-blue-400/20 transition-colors">
                  <DynamicIcon iconName={tool.icon} size={24} className="text-blue-400" />
                </div>
                
                {/* Nom de l'outil */}
                <h3 className="text-xl font-bold text-blue-400 mb-3 group-hover:text-blue-400/80 transition-colors">
                  {tool.name}
                </h3>
                
                {/* Description */}
                <p className="text-foreground/70 text-sm mb-4 line-clamp-3 flex-grow">
                  {tool.description}
                </p>
                
                {/* Badge "En développement" et flèche */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/50 font-mono">
                      /{tool.slug}
                    </span>
                    {!tool.isActive && (
                      <span className="px-2 py-1 bg-blue-400/10 text-blue-400 text-xs rounded-full border border-blue-400/30">
                        En développement
                      </span>
                    )}
                  </div>
                  <FiArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ToolsLayout>
  )
} 