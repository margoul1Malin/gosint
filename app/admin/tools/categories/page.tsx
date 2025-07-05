'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Layers,
  Hash
} from 'lucide-react'
import IconDisplay from '@/app/components/IconDisplay'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  toolCount: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
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
  const [selectedStatus, setSelectedStatus] = useState('all')
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
  }, [currentPage, searchTerm, selectedStatus])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      })

      // Ajouter isActive seulement si ce n'est pas "all"
      if (selectedStatus !== 'all') {
        params.append('isActive', selectedStatus)
      }

      console.log('Chargement des catégories avec params:', params.toString())
      
      const response = await fetch(`/api/admin/categories?${params}`)
      console.log('Réponse API:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Données reçues:', data)
        setCategories(data.categories)
        setPagination(data.pagination)
      } else {
        const errorData = await response.json()
        console.error('Erreur API:', errorData)
        setError('Erreur lors du chargement des catégories')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      setError('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCategories()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Erreur lors de la suppression')
      console.error('Erreur:', error)
    }
  }

  const toggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const category = categories.find(c => c.id === categoryId)
      if (!category) return

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...category,
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        loadCategories()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour')
      console.error('Erreur:', error)
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/tools')}
              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux outils
            </button>
            <div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">
                Gestion des Catégories
              </h1>
              <p className="text-gray-400">
                Gérez les catégories d'outils OSINT
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/tools/categories/new')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Catégorie
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

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

            <div className="flex items-center text-sm text-gray-400">
              <Layers className="w-4 h-4 mr-2" />
              {pagination.totalCount} catégorie{pagination.totalCount > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des catégories */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-green-400">Chargement des catégories...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                >
                  {/* Header de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        <IconDisplay iconName={category.icon} className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Hash className="w-3 h-3" />
                          {category.slug}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {category.description}
                  </p>

                  {/* Badge de couleur */}
                  <div className="mb-4">
                    <div className={`h-3 w-full rounded-full bg-gradient-to-r ${category.color}`}></div>
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>
                      {category.toolCount} outil{category.toolCount > 1 ? 's' : ''}
                    </span>
                    <span>
                      Ordre: {category.order}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500">
                      Créé le {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(category.id, category.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          category.isActive 
                            ? 'text-green-400 hover:bg-green-400/10' 
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        title={category.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/tools/categories/${category.id}/edit`)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message si aucune catégorie */}
            {categories.length === 0 && (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  Aucune catégorie trouvée
                </h3>
                <p className="text-gray-500 mb-4">
                  Créez votre première catégorie pour organiser vos outils OSINT
                </p>
                <button
                  onClick={() => router.push('/admin/tools/categories/new')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Créer une catégorie
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-400">
                  Affichage de {((pagination.currentPage - 1) * 10) + 1} à {Math.min(pagination.currentPage * 10, pagination.totalCount)} sur {pagination.totalCount} catégories
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