'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  isActive: boolean
  order: number
}

export default function EditCategoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: 'from-green-400 to-blue-500',
    isActive: true,
    order: 0
  })

  // Couleurs prédéfinies
  const colorOptions = [
    { name: 'Vert-Bleu', value: 'from-green-400 to-blue-500' },
    { name: 'Bleu-Violet', value: 'from-blue-400 to-purple-500' },
    { name: 'Violet-Rose', value: 'from-purple-400 to-pink-500' },
    { name: 'Rose-Orange', value: 'from-pink-400 to-orange-500' },
    { name: 'Orange-Rouge', value: 'from-orange-400 to-red-500' },
    { name: 'Rouge-Rose', value: 'from-red-400 to-pink-500' },
    { name: 'Cyan-Bleu', value: 'from-cyan-400 to-blue-500' },
    { name: 'Vert-Cyan', value: 'from-green-400 to-cyan-500' },
    { name: 'Indigo-Violet', value: 'from-indigo-400 to-purple-500' },
    { name: 'Jaune-Orange', value: 'from-yellow-400 to-orange-500' }
  ]

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

  // Charger la catégorie
  useEffect(() => {
    if (categoryId) {
      loadCategory()
    }
  }, [categoryId])

  const loadCategory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/categories/${categoryId}`)
      
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description,
          icon: data.icon,
          color: data.color,
          isActive: data.isActive,
          order: data.order
        })
      } else {
        setError('Catégorie introuvable')
      }
    } catch (error) {
      setError('Erreur lors du chargement de la catégorie')
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
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
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Catégorie modifiée avec succès !')
        setTimeout(() => {
          router.push('/admin/tools/categories')
        }, 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la modification')
      }
    } catch (error) {
      setError('Erreur lors de la modification')
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

  if (!session || error === 'Catégorie introuvable') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Catégorie introuvable</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/tools/categories')}
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux catégories
          </button>
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">
              Modifier la Catégorie
            </h1>
            <p className="text-gray-400">
              Modifiez les informations de la catégorie
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Reconnaissance réseau"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: reconnaissance-reseau"
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisé dans l'URL. Généré automatiquement depuis le nom.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Description de la catégorie..."
              />
            </div>

            {/* Icône */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-2">
                Icône *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: FiSearch, AiOutlineUser, BsShield..."
                />
                {formData.icon && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg">
                    <span className="text-xs text-gray-400">Aperçu:</span>
                    <div className="w-5 h-5 text-green-400">
                      {/* Placeholder pour l'aperçu de l'icône */}
                      <div className="w-full h-full bg-green-400 rounded-sm opacity-50"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nom de l'icône React Icons (ex: FiSearch, AiOutlineUser, BsShield)
              </p>
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Couleur du thème
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorOptions.map((color) => (
                  <label key={color.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color.value}
                      checked={formData.color === color.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-green-500 bg-gray-800' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className={`h-6 w-full rounded bg-gradient-to-r ${color.value} mb-2`}></div>
                      <div className="text-xs text-gray-400">{color.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Ordre */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-300 mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Plus le nombre est bas, plus la catégorie apparaîtra en premier.
              </p>
            </div>

            {/* Statut */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 bg-gray-800 border-gray-700 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-300">
                  Catégorie active (visible sur le site)
                </span>
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Modifier la catégorie
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/tools/categories')}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 