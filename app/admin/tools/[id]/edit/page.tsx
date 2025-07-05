'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import IconSelector from '@/app/components/IconSelector'
import DynamicIcon from '@/app/components/DynamicIcon'

interface Tool {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  categoryIds: string[]
  isActive: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

export default function EditToolPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const toolId = params.id as string

  const [tool, setTool] = useState<Tool | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showIconSelector, setShowIconSelector] = useState(false)

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    categoryId: '',
    isActive: true
  })

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

  // Charger les données
  useEffect(() => {
    if (toolId) {
      loadTool()
      loadCategories()
    }
  }, [toolId])

  const loadTool = async () => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`)
      if (response.ok) {
        const data = await response.json()
        setTool(data.tool)
        setFormData({
          name: data.tool.name,
          slug: data.tool.slug,
          description: data.tool.description,
          icon: data.tool.icon,
          categoryId: data.tool.categoryIds[0] || '',
          isActive: data.tool.isActive
        })
      } else {
        setError('Outil non trouvé')
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'outil')
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.slug || !formData.description || !formData.categoryId) {
      setError('Tous les champs sont requis')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/tools')
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour')
      console.error('Erreur:', error)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400">Chargement...</div>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Outil non trouvé</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/tools')}
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux outils
          </button>
          <div>
            <h1 className="text-3xl font-bold text-green-400">
              Modifier l'outil
            </h1>
            <p className="text-gray-400">
              Modifiez les informations de l'outil
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'outil *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nom de l'outil"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="slug-de-l-outil"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'URL sera : /tools/{formData.slug}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Description de l'outil"
                  required
                />
              </div>

              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icône *
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {formData.icon && (
                      <div className="w-8 h-8 flex items-center justify-center bg-green-500/10 rounded">
                        <DynamicIcon iconName={formData.icon} size={20} className="text-green-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowIconSelector(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      {formData.icon ? 'Changer l\'icône' : 'Choisir une icône'}
                    </button>
                  </div>
                </div>
                {formData.icon && (
                  <p className="text-xs text-gray-500 mt-1">
                    Icône sélectionnée : {formData.icon}
                  </p>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: true }))}
                      className="text-green-500 focus:ring-green-500"
                    />
                    <span className="text-white">Actif</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isActive"
                      checked={!formData.isActive}
                      onChange={() => setFormData(prev => ({ ...prev, isActive: false }))}
                      className="text-green-500 focus:ring-green-500"
                    />
                    <span className="text-white">Inactif</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={() => router.push('/admin/tools')}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sélecteur d'icône */}
      {showIconSelector && (
        <IconSelector
          value={formData.icon}
          onChange={(iconName: string) => {
            setFormData(prev => ({ ...prev, icon: iconName }))
            setShowIconSelector(false)
          }}
          onClose={() => setShowIconSelector(false)}
          isOpen={showIconSelector}
        />
      )}
    </div>
  )
} 