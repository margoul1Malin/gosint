'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiDatabase, 
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

export default function LeaksPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories/leaks/tools')
      
      if (response.ok) {
        const data = await response.json()
        setTools(data.tools || [])
      } else {
        setError('Erreur lors du chargement des outils')
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
        title="Outils de Vérification de Fuites"
        description="Découvrez nos outils pour vérifier si vos données ont été compromises"
        icon={<FiDatabase className="w-12 h-12 text-accent" />}
      >
        <div className="flex items-center justify-center py-12">
          <FiLoader className="w-8 h-8 text-accent animate-spin" />
        </div>
      </ToolsLayout>
    )
  }

  if (error) {
    return (
      <ToolsLayout
        title="Outils de Vérification de Fuites"
        description="Découvrez nos outils pour vérifier si vos données ont été compromises"
        icon={<FiDatabase className="w-12 h-12 text-accent" />}
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
      title="Outils de Vérification de Fuites"
      description="Découvrez nos outils pour vérifier si vos données ont été compromises"
      icon={<FiDatabase className="w-12 h-12 text-accent" />}
    >
      {tools.length === 0 ? (
        <div className="text-center py-12">
          <FiDatabase className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
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
              href={`/tools/${tool.slug}`}
              className="group"
            >
              <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 hover:border-accent/50 transition-all duration-300 cursor-pointer h-full">
                {/* Icône de l'outil */}
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4 group-hover:bg-accent/20 transition-colors">
                  <DynamicIcon iconName={tool.icon} size={24} className="text-accent" />
                </div>
                
                {/* Nom de l'outil */}
                <h3 className="text-xl font-bold text-accent mb-3 group-hover:text-accent/80 transition-colors">
                  {tool.name}
                </h3>
                
                {/* Description */}
                <p className="text-foreground/70 text-sm mb-4 line-clamp-3">
                  {tool.description}
                </p>
                
                {/* Flèche d'action */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-foreground/50 font-mono">
                    /{tool.slug}
                  </span>
                  <FiArrowRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ToolsLayout>
  )
} 