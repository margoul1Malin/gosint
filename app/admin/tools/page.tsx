'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  ChevronLeft,
  ChevronRight,
  Settings,
  Tag,
  Layers
} from 'lucide-react'
import DynamicIcon from '@/app/components/DynamicIcon'

interface Tool {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  icon: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  isPremium: boolean
  isActive: boolean
  order: number
  tags: string[]
  features: string[]
  useCases: string[]
  categoryIds: string[]
  apiRequired: boolean
  createdAt: string
  updatedAt: string
  categories: {
    id: string
    name: string
    slug: string
    color: string
  }[]
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function AdminToolsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPremium, setSelectedPremium] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Vérifier les permissions
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }
    
    if (session.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Charger les catégories
  useEffect(() => {
    loadCategories()
  }, [])

  // Charger les outils
  useEffect(() => {
    loadTools()
  }, [currentPage, searchTerm, selectedCategory, selectedDifficulty, selectedStatus, selectedPremium])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories?limit=100')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const loadTools = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        isPremium: selectedPremium
      })

      // Ajouter isActive seulement si selectedStatus n'est pas 'all'
      if (selectedStatus !== 'all') {
        params.append('isActive', selectedStatus)
      }

      const response = await fetch(`/api/admin/tools?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTools(data.tools)
        setPagination(data.pagination)
      } else {
        setError('Erreur lors du chargement des outils')
      }
    } catch (error) {
      setError('Erreur lors du chargement des outils')
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (toolId: string, toolName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'outil "${toolName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadTools()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Erreur lors de la suppression')
      console.error('Erreur:', error)
    }
  }

  const toggleStatus = async (toolId: string, currentStatus: boolean) => {
    try {
      const tool = tools.find(t => t.id === toolId)
      if (!tool) return

      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...tool,
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        loadTools()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour')
      console.error('Erreur:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
      case 'ADVANCED': return 'bg-orange-100 text-orange-800'
      case 'EXPERT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'Débutant'
      case 'INTERMEDIATE': return 'Intermédiaire'
      case 'ADVANCED': return 'Avancé'
      case 'EXPERT': return 'Expert'
      default: return difficulty
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">
              Gestion des Outils OSINT
            </h1>
            <p className="text-gray-400">
              Gérez les outils et leurs catégories
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/tools/categories')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Layers className="w-4 h-4" />
              Catégories
            </button>
            <button
              onClick={() => router.push('/admin/tools/new')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvel Outil
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un outil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Difficulté */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Toutes les difficultés</option>
              <option value="BEGINNER">Débutant</option>
              <option value="INTERMEDIATE">Intermédiaire</option>
              <option value="ADVANCED">Avancé</option>
              <option value="EXPERT">Expert</option>
            </select>

            {/* Statut */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>

            {/* Premium */}
            <select
              value={selectedPremium}
              onChange={(e) => setSelectedPremium(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tous les types</option>
              <option value="true">Premium</option>
              <option value="false">Gratuit</option>
            </select>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des outils */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-green-400">Chargement des outils...</div>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Outil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Catégories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Difficulté
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {tools.map((tool) => (
                      <tr key={tool.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-3">
                              <DynamicIcon iconName={tool.icon} size={24} className="text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {tool.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {tool.description}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Slug: {tool.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {tool.categories.map((category) => (
                              <span
                                key={category.id}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${category.color} text-white`}
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
                            {getDifficultyLabel(tool.difficulty)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tool.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tool.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            {tool.isPremium && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleStatus(tool.id, tool.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                tool.isActive 
                                  ? 'text-green-400 hover:bg-green-400/10' 
                                  : 'text-gray-400 hover:bg-gray-700'
                              }`}
                              title={tool.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {tool.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => router.push(`/admin/tools/${tool.id}/edit`)}
                              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tool.id, tool.name)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-400">
                  Affichage de {((pagination.currentPage - 1) * 10) + 1} à {Math.min(pagination.currentPage * 10, pagination.totalCount)} sur {pagination.totalCount} outils
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {pagination.currentPage} sur {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 