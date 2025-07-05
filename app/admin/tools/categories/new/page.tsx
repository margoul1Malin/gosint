'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import IconSelector from '@/app/components/IconSelector'
import IconDisplay from '@/app/components/IconDisplay'

export default function NewCategoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showIconSelector, setShowIconSelector] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: 'from-blue-500 to-purple-600',
    isActive: true,
    order: 0
  })

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
      const response = await fetch('/api/admin/categories', {
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

      setSuccess('Catégorie créée avec succès !')
      
      // Rediriger vers la liste des catégories après 2 secondes
      setTimeout(() => {
        router.push('/admin/tools/categories')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // Vérifier les permissions
  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-accent mb-4">Accès refusé</h1>
            <p className="text-foreground/70">Vous n'avez pas les permissions nécessaires.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const colorOptions = [
    { value: 'from-blue-500 to-purple-600', label: 'Bleu → Violet', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { value: 'from-green-500 to-teal-600', label: 'Vert → Sarcelle', preview: 'bg-gradient-to-r from-green-500 to-teal-600' },
    { value: 'from-red-500 to-pink-600', label: 'Rouge → Rose', preview: 'bg-gradient-to-r from-red-500 to-pink-600' },
    { value: 'from-yellow-500 to-orange-600', label: 'Jaune → Orange', preview: 'bg-gradient-to-r from-yellow-500 to-orange-600' },
    { value: 'from-purple-500 to-indigo-600', label: 'Violet → Indigo', preview: 'bg-gradient-to-r from-purple-500 to-indigo-600' },
    { value: 'from-cyan-500 to-blue-600', label: 'Cyan → Bleu', preview: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
    { value: 'from-emerald-500 to-green-600', label: 'Émeraude → Vert', preview: 'bg-gradient-to-r from-emerald-500 to-green-600' },
    { value: 'from-rose-500 to-red-600', label: 'Rose → Rouge', preview: 'bg-gradient-to-r from-rose-500 to-red-600' }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-accent mb-2">
            Nouvelle Catégorie OSINT
          </h1>
          <p className="text-foreground/70">
            Créer une nouvelle catégorie pour organiser les outils OSINT
          </p>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-500">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-green-500">{success}</span>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-surface/20 backdrop-blur-sm border border-secondary/30 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="Ex: Analyse Web"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="Ex: analyse-web"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Généré automatiquement à partir du nom. Utilisé dans l'URL.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Description de la catégorie et de ses outils..."
              />
            </div>

            {/* Icône */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-2">
                Icône *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                    placeholder="Ex: FiGlobe, FiSearch, FiShield..."
                  />
                  {formData.icon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <IconDisplay iconName={formData.icon} className="w-5 h-5 text-accent" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconSelector(true)}
                  className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Choisir
                </button>
              </div>
              <p className="text-xs text-foreground/60 mt-1">
                Nom d'icône React Icons (ex: FiGlobe, FiSearch, FiShield) ou cliquez sur "Choisir" pour sélectionner
              </p>
            </div>

            {/* Couleur */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-foreground mb-2">
                Couleur de gradient *
              </label>
              <select
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {/* Aperçu de la couleur */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-foreground/60">Aperçu:</span>
                <div className={`w-16 h-4 rounded ${colorOptions.find(opt => opt.value === formData.color)?.preview}`}></div>
              </div>
            </div>

            {/* Ordre */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-foreground mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="0"
              />
              <p className="text-xs text-foreground/60 mt-1">
                Plus le nombre est petit, plus la catégorie apparaît en premier
              </p>
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
              <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                Catégorie active
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-secondary/30 rounded-lg hover:bg-surface/20 transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Créer la catégorie
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      
      {/* Sélecteur d'icônes */}
      <IconSelector
        value={formData.icon}
        onChange={(iconName) => setFormData(prev => ({ ...prev, icon: iconName }))}
        onClose={() => setShowIconSelector(false)}
        isOpen={showIconSelector}
      />
    </div>
  )
} 