'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiUser, 
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
  FiSearch,
  FiShield,
  FiEye,
  FiDatabase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUserCheck
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

export default function PhysicalPersonPage() {
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
      const response = await fetch('/api/tools/physical-person')
      
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
        title="Investigation de Personnes Physiques"
        description="Recherchez et analysez les informations publiques sur les personnes physiques"
        icon={<FiUser className="w-12 h-12 text-purple-400" />}
      >
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </ToolsLayout>
    )
  }

  if (error) {
    return (
      <ToolsLayout
        title="Investigation de Personnes Physiques"
        description="Recherchez et analysez les informations publiques sur les personnes physiques"
        icon={<FiUser className="w-12 h-12 text-purple-400" />}
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

  const themeColor = category?.color || 'purple-400'
  const iconName = category?.icon || 'FiUser'

  return (
    <ToolsLayout
      title={category?.name || "Investigation de Personnes Physiques"}
      description={category?.description || "Recherchez et analysez les informations publiques sur les personnes physiques"}
      icon={<DynamicIcon iconName={iconName} size={48} className={`text-${themeColor}`} />}
    >
      <div className="mb-8">
        <div className={`bg-surface/20 backdrop-blur-sm border border-${themeColor}/30 rounded-lg p-6`}>
          <h2 className={`text-xl font-bold text-${themeColor} mb-4 flex items-center gap-2`}>
            <FiUserCheck className="w-6 h-6" />
            À propos de l'investigation de personnes physiques
          </h2>
          <p className="text-foreground/70 mb-4">
            L'investigation de personnes physiques en OSINT consiste à rechercher et analyser les informations 
            publiquement disponibles sur des individus. Cette pratique doit toujours respecter la vie privée 
            et les lois en vigueur. Ces outils vous permettent de :
          </p>
          <ul className="text-foreground/70 space-y-2">
            <li className="flex items-start gap-2">
              <FiArrowRight className={`w-4 h-4 text-${themeColor} mt-0.5 flex-shrink-0`} />
              <span>Vérifier l'authenticité d'une identité en ligne</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className={`w-4 h-4 text-${themeColor} mt-0.5 flex-shrink-0`} />
              <span>Rechercher des informations publiques sur les réseaux sociaux</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className={`w-4 h-4 text-${themeColor} mt-0.5 flex-shrink-0`} />
              <span>Analyser les traces numériques laissées par une personne</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className={`w-4 h-4 text-${themeColor} mt-0.5 flex-shrink-0`} />
              <span>Corréler des informations provenant de sources multiples</span>
            </li>
          </ul>
          <div className={`mt-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <FiShield className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Avertissement Éthique</span>
            </div>
            <p className="text-foreground/70 text-sm">
              L'utilisation de ces outils doit respecter la vie privée des individus et se conformer aux lois 
              locales sur la protection des données personnelles. Utilisez ces informations de manière responsable 
              et éthique uniquement dans un cadre légal.
            </p>
          </div>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
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
              <div className={`bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 hover:border-${themeColor}/50 transition-all duration-300 cursor-pointer h-full flex flex-col`}>
                {/* Icône de l'outil */}
                <div className={`flex items-center justify-center w-12 h-12 bg-${themeColor}/10 rounded-lg mb-4 group-hover:bg-${themeColor}/20 transition-colors`}>
                  <DynamicIcon iconName={tool.icon} size={24} className={`text-${themeColor}`} />
                </div>
                
                {/* Nom de l'outil */}
                <h3 className={`text-xl font-bold text-${themeColor} mb-3 group-hover:text-${themeColor}/80 transition-colors`}>
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
                      <span className="text-xs bg-orange-400/20 text-orange-400 px-2 py-1 rounded-full">
                        En développement
                      </span>
                    )}
                  </div>
                  <FiArrowRight className={`w-5 h-5 text-${themeColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ToolsLayout>
  )
} 