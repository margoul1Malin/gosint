'use client'

import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

interface ToolsLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  icon?: ReactNode
  className?: string
}

export default function ToolsLayout({ 
  children, 
  title, 
  description, 
  icon, 
  className = '' 
}: ToolsLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Contenu principal avec espacement correct */}
      <main className={`pt-32 pb-16 ${className}`}>
        <div className="container mx-auto px-4">
          {/* En-tête de la page d'outil (optionnel) */}
          {(title || description || icon) && (
            <div className="text-center mb-12">
              {icon && (
                <div className="flex justify-center mb-4">
                  {icon}
                </div>
              )}
              
              {title && (
                <h1 className="text-4xl md:text-5xl font-bold text-accent mb-4 font-mono">
                  {title}
                </h1>
              )}
              
              {description && (
                <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                  {description}
                </p>
              )}
              
              {/* Ligne de séparation cyberpunk */}
              <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-8"></div>
            </div>
          )}
          
          {/* Contenu de l'outil */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 