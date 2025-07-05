'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import * as FiIcons from 'react-icons/fi'
import * as AiIcons from 'react-icons/ai'
import * as BiIcons from 'react-icons/bi'
import * as BsIcons from 'react-icons/bs'
import * as FaIcons from 'react-icons/fa'
import * as HiIcons from 'react-icons/hi'
import * as IoIcons from 'react-icons/io5'
import * as MdIcons from 'react-icons/md'
import * as RiIcons from 'react-icons/ri'
import * as TbIcons from 'react-icons/tb'

interface IconSelectorProps {
  value: string
  onChange: (iconName: string) => void
  onClose: () => void
  isOpen: boolean
}

interface IconInfo {
  name: string
  component: React.ComponentType<{ className?: string }>
  category: string
}

export default function IconSelector({ value, onChange, onClose, isOpen }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [icons, setIcons] = useState<IconInfo[]>([])
  const [filteredIcons, setFilteredIcons] = useState<IconInfo[]>([])

  // Charger toutes les icônes au montage
  useEffect(() => {
    const allIcons: IconInfo[] = [
      // Feather Icons (recommandées)
      ...Object.entries(FiIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'feather'
      })),
      // Ant Design Icons
      ...Object.entries(AiIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'antd'
      })),
      // Bootstrap Icons
      ...Object.entries(BsIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'bootstrap'
      })),
      // Font Awesome
      ...Object.entries(FaIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'fontawesome'
      })),
      // Heroicons
      ...Object.entries(HiIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'heroicons'
      })),
      // Ionicons
      ...Object.entries(IoIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'ionicons'
      })),
      // Material Design
      ...Object.entries(MdIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'material'
      })),
      // Remix Icons
      ...Object.entries(RiIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'remix'
      })),
      // Tabler Icons
      ...Object.entries(TbIcons).map(([name, component]) => ({
        name,
        component: component as React.ComponentType<{ className?: string }>,
        category: 'tabler'
      }))
    ]

    // Filtrer les icônes valides
    const validIcons = allIcons.filter(icon => 
      typeof icon.component === 'function' && 
      icon.name !== 'IconContext'
    )

    setIcons(validIcons)
  }, [])

  // Filtrer les icônes selon la recherche et la catégorie
  useEffect(() => {
    let filtered = icons

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(icon => icon.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(icon =>
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Limiter à 100 icônes pour les performances
    setFilteredIcons(filtered.slice(0, 100))
  }, [icons, searchTerm, selectedCategory])

  const categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'feather', label: 'Feather (Recommandé)' },
    { value: 'material', label: 'Material Design' },
    { value: 'heroicons', label: 'Heroicons' },
    { value: 'bootstrap', label: 'Bootstrap' },
    { value: 'fontawesome', label: 'Font Awesome' },
    { value: 'ionicons', label: 'Ionicons' },
    { value: 'antd', label: 'Ant Design' },
    { value: 'remix', label: 'Remix' },
    { value: 'tabler', label: 'Tabler' }
  ]

  const handleIconSelect = (iconName: string) => {
    onChange(iconName)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-surface/95 backdrop-blur-md border border-secondary/30 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/30">
          <h2 className="text-xl font-semibold text-accent">Sélectionner une icône</h2>
          <button
            onClick={onClose}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-secondary/30">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Rechercher une icône..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-surface/30 border border-secondary/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icône sélectionnée */}
          {value && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground/70">Icône sélectionnée :</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const selectedIcon = icons.find(icon => icon.name === value)
                    if (selectedIcon) {
                      const IconComponent = selectedIcon.component
                      return <IconComponent className="w-5 h-5 text-accent" />
                    }
                    return null
                  })()}
                  <span className="text-sm font-mono text-accent">{value}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grille d'icônes */}
        <div className="p-6 overflow-y-auto max-h-96">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-8 text-foreground/50">
              Aucune icône trouvée pour "{searchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component
                const isSelected = value === icon.name
                
                return (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className={`
                      p-3 rounded-lg border transition-all hover:bg-surface/50 group
                      ${isSelected 
                        ? 'border-accent bg-accent/10 text-accent' 
                        : 'border-secondary/30 text-foreground/70 hover:border-secondary/50 hover:text-foreground'
                      }
                    `}
                    title={icon.name}
                  >
                    <IconComponent className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t border-secondary/30 bg-surface/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-foreground/60">
              {filteredIcons.length} icône{filteredIcons.length !== 1 ? 's' : ''} trouvée{filteredIcons.length !== 1 ? 's' : ''}
              {filteredIcons.length === 100 && ' (limitées à 100 pour les performances)'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-secondary/30 rounded-lg hover:bg-surface/20 transition-colors"
              >
                Annuler
              </button>
              {value && (
                <button
                  onClick={() => handleIconSelect(value)}
                  className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Confirmer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 