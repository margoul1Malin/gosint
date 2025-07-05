'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ToolsLayout from '@/app/components/ToolsLayout'
import DynamicIcon from '@/app/components/DynamicIcon'
import { 
  FiGlobe, 
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
  FiSearch,
  FiShield,
  FiEye,
  FiCode,
  FiActivity,
  FiLayers,
  FiFolderPlus
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

export default function WebAnalysisPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories/web-analysis/tools')
      
      if (response.ok) {
        const data = await response.json()
        setTools(data.tools || [])
      } else {
        // Si l'API n'existe pas encore, utiliser des données mockées
        setTools(getMockTools())
      }
    } catch (error) {
      // En cas d'erreur, utiliser des données mockées
      setTools(getMockTools())
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMockTools = (): Tool[] => {
    return [
      {
        id: 'whois-lookup',
        name: 'Whois Lookup',
        description: 'Recherche d\'informations sur un domaine via les bases de données Whois.',
        slug: 'whois-lookup',
        icon: 'FiGlobe',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'dns-analyzer',
        name: 'DNS Analyzer',
        description: 'Analyse complète des enregistrements DNS d\'un domaine.',
        slug: 'dns-analyzer',
        icon: 'FiServer',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'ssl-checker',
        name: 'SSL Certificate Checker',
        description: 'Vérification et analyse des certificats SSL/TLS.',
        slug: 'ssl-checker',
        icon: 'FiShield',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'website-analyzer',
        name: 'Website Analyzer',
        description: 'Analyse complète d\'un site web : headers, technologies, sécurité.',
        slug: 'website-analyzer',
        icon: 'FiMonitor',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'subdomain-finder',
        name: 'Subdomain Finder',
        description: 'Découverte de sous-domaines via différentes techniques.',
        slug: 'subdomain-finder',
        icon: 'FiSearch',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'port-scanner',
        name: 'Port Scanner',
        description: 'Scan des ports ouverts et identification des services.',
        slug: 'port-scanner',
        icon: 'FiCode',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'web-technologies',
        name: 'Détection de Technologies Web',
        description: 'Détecte les technologies utilisées par un site web : CMS, frameworks, bibliothèques, analytics et plus encore.',
        slug: 'web-technologies',
        icon: 'FiLayers',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'folders-enumeration',
        name: 'Énumération de Dossiers',
        description: 'Crawler et générateur d\'arborescence pour découvrir la structure d\'un site web.',
        slug: 'folders-enumeration',
        icon: 'FiFolderPlus',
        isActive: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      }
    ]
  }

  if (loading) {
    return (
      <ToolsLayout
        title="Outils d'Analyse Web"
        description="Analysez et auditez les sites web, domaines et infrastructures avec nos outils spécialisés"
        icon={<FiGlobe className="w-12 h-12 text-accent" />}
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
        title="Outils d'Analyse Web"
        description="Analysez et auditez les sites web, domaines et infrastructures avec nos outils spécialisés"
        icon={<FiGlobe className="w-12 h-12 text-accent" />}
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
      title="Outils d'Analyse Web"
      description="Analysez et auditez les sites web, domaines et infrastructures avec nos outils spécialisés"
      icon={<FiGlobe className="w-12 h-12 text-accent" />}
    >
      <div className="mb-8">
        <div className="bg-surface/20 backdrop-blur-sm border border-accent/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
            <FiGlobe className="w-6 h-6" />
            À propos de l'analyse web
          </h2>
          <p className="text-foreground/70 mb-4">
            L'analyse web est un domaine crucial de l'OSINT qui permet d'examiner les sites web, domaines et infrastructures 
            pour collecter des informations techniques et de sécurité. Ces outils vous aident à :
          </p>
          <ul className="text-foreground/70 space-y-2">
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Identifier les technologies utilisées par un site web</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Analyser la configuration DNS et les certificats SSL</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Découvrir des sous-domaines et services cachés</span>
            </li>
            <li className="flex items-start gap-2">
              <FiArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Évaluer la surface d'attaque d'une infrastructure</span>
            </li>
          </ul>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12">
          <FiGlobe className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
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
              <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 hover:bg-surface/30 hover:border-accent/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                {/* Icône de l'outil */}
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4 group-hover:bg-accent/20 transition-colors">
                  <DynamicIcon iconName={tool.icon} size={24} className="text-accent" />
                </div>
                
                {/* Nom de l'outil */}
                <h3 className="text-xl font-bold text-accent mb-3 group-hover:text-accent/80 transition-colors">
                  {tool.name}
                </h3>
                
                {/* Description */}
                <p className="text-foreground/70 text-sm mb-4 line-clamp-3 flex-grow">
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