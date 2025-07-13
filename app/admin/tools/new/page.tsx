'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, Loader2, Settings, Tag, FileText, Eye, EyeOff } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import IconSelector from '@/app/components/IconSelector'
import IconDisplay from '@/app/components/IconDisplay'

interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  isActive: boolean
}

export default function NewToolPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showIconSelector, setShowIconSelector] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    categoryId: '',
    isActive: true
  })

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories?limit=100')
        const data = await response.json()
        
        if (response.ok) {
          setCategories(data.categories.filter((cat: Category) => cat.isActive))
        }
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Générer automatiquement le slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      
      // Générer le slug automatiquement quand le nom change
      if (name === 'name') {
        setFormData(prev => ({
          ...prev,
          slug: generateSlug(value)
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }

      setSuccess('Outil créé avec succès!')
      
      // Rediriger vers la liste des outils après 2 secondes
      setTimeout(() => {
        router.push('/admin/tools')
      }, 2000)

    } catch (err) {
      console.error('Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  // Vérifier l'authentification
  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-2">Accès refusé</h1>
            <p className="text-gray-400">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        {/* En-tête avec design amélioré */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:border-blue-500/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Créer un nouvel outil
            </h1>
            <p className="text-gray-400 text-lg">
              Ajoutez un nouvel outil à votre plateforme OSINT
            </p>
          </div>
        </div>

        {/* Messages d'alerte améliorés */}
        <div className="max-w-4xl mx-auto mb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-green-400">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulaire redesigné */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section Informations générales */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Informations générales</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="lg:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-3">
                    Nom de l'outil <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400"
                    placeholder="Ex: Vérificateur d'emails"
                  />
                </div>

                {/* Slug */}
                <div className="lg:col-span-1">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-3">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white placeholder-gray-400"
                    placeholder="Ex: verificateur-emails"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="text-blue-400">URL:</span> /tools/{formData.slug || 'votre-slug'}
                  </p>
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-3">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none text-white placeholder-gray-400"
                    placeholder="Description courte et claire de l'outil..."
                  />
                </div>
              </div>
            </div>

            {/* Section Configuration */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Configuration</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Catégorie */}
                <div className="lg:col-span-1">
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-3">
                    Catégorie <span className="text-red-400">*</span>
                  </label>
                  {loadingCategories ? (
                    <div className="flex items-center gap-2 text-gray-400 p-3 bg-gray-900/50 border border-gray-600 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Chargement des catégories...
                    </div>
                  ) : (
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-white"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Icône */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Icône <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.icon && (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-xl">{formData.icon}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowIconSelector(true)}
                      className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200 text-blue-400 hover:text-blue-300"
                    >
                      {formData.icon ? 'Changer l\'icône' : 'Choisir une icône'}
                    </button>
                  </div>
                </div>

                {/* Statut */}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 p-4 bg-gray-900/30 border border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500/50 focus:ring-2"
                      />
                      <label htmlFor="isActive" className="flex items-center gap-2 text-gray-300">
                        {formData.isActive ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                        <span>Outil actif et visible</span>
                      </label>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formData.isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {formData.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-all duration-200 text-gray-300 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Créer l'outil
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

      <Footer />
    </div>
  )
} 