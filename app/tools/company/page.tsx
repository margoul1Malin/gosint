'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
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
  FiUserCheck,
  FiTrendingUp,
  FiFileText,
  FiGlobe
} from 'react-icons/fi'
import { BsBuilding } from 'react-icons/bs'

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

export default function CompanyPage() {
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
      const response = await fetch('/api/tools/company')
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des outils')
      }
      
      const data = await response.json()
      setTools(data.tools)
      setCategory(data.category)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ToolsLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiLoader className="animate-spin text-4xl mb-4 mx-auto" />
            <p className="text-lg">Chargement des outils...</p>
          </div>
        </div>
      </ToolsLayout>
    )
  }

  if (error) {
    return (
      <ToolsLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiAlertCircle className="text-4xl mb-4 mx-auto text-red-400" />
            <p className="text-lg mb-4 text-red-400">❌ {error}</p>
            <button 
              onClick={loadTools}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </ToolsLayout>
    )
  }

  return (
    <ToolsLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-5xl">
              {category?.icon ? (
                <DynamicIcon iconName={category.icon} />
              ) : (
                <BsBuilding />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {category?.name || 'Investigation d\'Entreprises'}
              </h1>
              <p className="text-xl text-cyan-300">
                {category?.description || 'Outils d\'analyse et d\'investigation d\'entreprises'}
              </p>
            </div>
          </div>
        </div>

        {/* Section explicative */}
        <div className="bg-gradient-to-r from-cyan-900/10 to-blue-900/10 border border-cyan-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <BsBuilding className="mr-3" />
            Investigation d'Entreprises
          </h2>
          <div className="space-y-4 text-cyan-300">
            <p>
              L'investigation d'entreprises est un domaine crucial de l'OSINT qui permet d'analyser 
              les structures corporatives, leurs dirigeants, leurs activités et leurs connexions.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <FiFileText className="mr-2" />
                  Informations Publiques
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Registres commerciaux et juridiques</li>
                  <li>• Données financières et bilans</li>
                  <li>• Dirigeants et actionnaires</li>
                  <li>• Historique et modifications</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <FiGlobe className="mr-2" />
                  Analyse Technique
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Infrastructure web et domaines</li>
                  <li>• Présence numérique et réseaux sociaux</li>
                  <li>• Technologies utilisées</li>
                  <li>• Certifications et conformité</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <FiTrendingUp className="mr-2" />
                  Analyse Financière
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Performance financière</li>
                  <li>• Liens avec d'autres entreprises</li>
                  <li>• Subventions et aides publiques</li>
                  <li>• Risques et opportunités</li>
                </ul>
              </div>
            </div>
          </div>
        </div>



        {/* Outils */}
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group block h-full"
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-3xl text-cyan-400 group-hover:text-cyan-300 transition-colors flex-shrink-0">
                      <DynamicIcon iconName={tool.icon} />
                    </div>
                    <div className="flex-1 min-h-0">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-cyan-300 text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-cyan-400 group-hover:text-cyan-300 transition-colors pt-4 border-t border-cyan-500/20">
                    <span className="text-sm">Utiliser l'outil</span>
                    <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BsBuilding className="text-6xl text-cyan-600 mb-4 mx-auto" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Aucun outil disponible
            </h3>
            <p className="text-cyan-300">
              Les outils d'investigation d'entreprises seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </ToolsLayout>
  )
} 