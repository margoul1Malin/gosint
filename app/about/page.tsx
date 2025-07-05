'use client'

import { useState, useEffect } from 'react'
import { FiShield, FiTarget, FiUsers, FiGlobe, FiDatabase, FiSearch, FiCode, FiLock } from 'react-icons/fi'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        
        {/* Lignes de scan */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold font-mono text-primary cyber-glow mb-6">
              À propos d'aOSINT
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Plateforme d'intelligence open source de nouvelle génération, conçue pour les professionnels 
              de la cybersécurité, les enquêteurs et les analystes de données.
            </p>
            <div className="mt-8 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">Notre Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                aOSINT révolutionne l'intelligence open source en fournissant des outils avancés 
                et une interface intuitive pour l'analyse de données, la reconnaissance réseau, 
                et l'investigation numérique.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Notre objectif est de démocratiser l'accès aux techniques d'OSINT tout en 
                maintenant les plus hauts standards de sécurité et d'éthique.
              </p>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-md border border-primary/20 rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <FiUsers className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">10K+</h3>
                  <p className="text-gray-400">Utilisateurs actifs</p>
                </div>
                <div className="text-center">
                  <FiSearch className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">50+</h3>
                  <p className="text-gray-400">Outils OSINT</p>
                </div>
                <div className="text-center">
                  <FiDatabase className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">1M+</h3>
                  <p className="text-gray-400">Analyses effectuées</p>
                </div>
                <div className="text-center">
                  <FiGlobe className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">24/7</h3>
                  <p className="text-gray-400">Disponibilité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Nos Capacités</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Une suite complète d'outils pour tous vos besoins en intelligence open source
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all">
              <FiTarget className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Reconnaissance Réseau</h3>
              <p className="text-gray-400">
                Analyse IP, scan de ports, détection de services et cartographie réseau avancée.
              </p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all">
              <FiGlobe className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Analyse Web</h3>
              <p className="text-gray-400">
                Investigation de domaines, analyse DNS, détection de technologies et vulnérabilités.
              </p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all">
              <FiUsers className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Investigation Sociale</h3>
              <p className="text-gray-400">
                Recherche sur les réseaux sociaux, analyse de profils et corrélation de données.
              </p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all">
              <FiDatabase className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Bases de Données</h3>
              <p className="text-gray-400">
                Accès aux bases publiques, détection de fuites et analyse de breaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-900/50 backdrop-blur-md border border-primary/20 rounded-lg p-8">
              <div className="flex items-center mb-6">
                <FiShield className="w-8 h-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold">Sécurité & Confidentialité</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FiLock className="w-5 h-5 text-primary mr-3 mt-1" />
                  <span className="text-gray-300">Chiffrement end-to-end de toutes les données</span>
                </li>
                <li className="flex items-start">
                  <FiCode className="w-5 h-5 text-primary mr-3 mt-1" />
                  <span className="text-gray-300">Code source audité et certifié</span>
                </li>
                <li className="flex items-start">
                  <FiDatabase className="w-5 h-5 text-primary mr-3 mt-1" />
                  <span className="text-gray-300">Aucune conservation des données sensibles</span>
                </li>
                <li className="flex items-start">
                  <FiShield className="w-5 h-5 text-primary mr-3 mt-1" />
                  <span className="text-gray-300">Conformité RGPD et standards internationaux</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6">Engagement Éthique</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Nous nous engageons à fournir des outils OSINT dans le respect des lois 
                et de l'éthique. Notre plateforme est conçue pour les professionnels 
                autorisés et les enquêtes légitimes.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Toutes nos fonctionnalités respectent les principes de légalité, 
                de proportionnalité et de nécessité dans l'investigation numérique.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-primary font-semibold">
                  "L'intelligence open source au service de la justice et de la sécurité"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Notre Équipe</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
             Y'a juste un type derrière tout ça et c'est moi :)
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCode className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Équipe Développement</h3>
              <p className="text-gray-400">
                Développeurs spécialisés en sécurité et intelligence artificielle
              </p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Experts Sécurité</h3>
              <p className="text-gray-400">
                Analystes en cybersécurité et spécialistes en investigation numérique
              </p>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Utilisateurs</h3>
              <p className="text-gray-400">
                Équipe dédiée à l'accompagnement et à la formation des utilisateurs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Prêt à commencer votre investigation ?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui font confiance à aOSINT 
            pour leurs besoins en intelligence open source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="cyber-button-primary px-8 py-3 rounded-lg font-medium text-lg transition-all">
              Commencer maintenant
            </button>
            <button className="cyber-button px-8 py-3 rounded-lg font-medium text-lg transition-all">
              Voir les outils
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 