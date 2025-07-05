'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'
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
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-24">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-2">Accès refusé</h1>
            <p className="text-foreground/70">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-24">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-accent">Créer un nouvel outil</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-6 space-y-6">
            
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-2">
                Nom de l'outil <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="Ex: Vérificateur d'emails"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-foreground/80 mb-2">
                Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="Ex: verificateur-emails"
              />
              <p className="text-xs text-foreground/50 mt-1">
                URL: /tools/{formData.slug}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground/80 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Description courte de l'outil..."
              />
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-foreground/80 mb-2">
                Catégorie <span className="text-red-400">*</span>
              </label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-foreground/50">
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
                  className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
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
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Icône <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {formData.icon && (
                    <div className="w-8 h-8 flex items-center justify-center bg-accent/10 rounded">
                      <span className="text-lg">{formData.icon}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowIconSelector(true)}
                    className="px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    {formData.icon ? 'Changer l\'icône' : 'Choisir une icône'}
                  </button>
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-accent bg-surface/30 border-secondary/30 rounded focus:ring-accent focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm text-foreground/80">
                Outil actif
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-surface/30 border border-secondary/30 rounded-lg hover:bg-surface/50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Créer l'outil
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
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