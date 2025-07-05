'use client'

import { useState, useEffect } from 'react'
import { FiShield, FiUsers, FiAlertTriangle, FiCheck, FiX, FiEye, FiLock } from 'react-icons/fi'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function TermsPage() {
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
              Conditions d'utilisation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Droits et obligations régissant l'utilisation de la plateforme aOSINT
            </p>
            <div className="mt-8 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <p className="text-sm text-gray-400 mt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </section>

      {/* Acceptation Section */}
      <section className="py-16 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-8 mb-12">
            <div className="flex items-center mb-6">
              <FiCheck className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold text-primary">Acceptation des conditions</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              En accédant et en utilisant la plateforme aOSINT, vous acceptez d'être lié par les présentes 
              conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser 
              nos services.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Description des services</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FiShield className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-xl font-semibold">Services OSINT</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Outils de reconnaissance réseau et d'analyse IP
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Investigation de domaines et analyse DNS
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Recherche dans les bases de données publiques
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Analyse de réseaux sociaux et de profils publics
                </li>
              </ul>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FiUsers className="w-6 h-6 text-primary mr-3" />
                <h3 className="text-xl font-semibold">Utilisateurs autorisés</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Professionnels de la cybersécurité
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Enquêteurs et analystes légaux
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Chercheurs en sécurité informatique
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Organisations autorisées par la loi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Obligations Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">Obligations de l'utilisateur</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-6 flex items-center">
                <FiCheck className="w-6 h-6 mr-3" />
                Usages autorisés
              </h3>
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✓ Investigations légales</h4>
                  <p className="text-gray-300 text-sm">
                    Utilisation dans le cadre d'enquêtes officielles ou autorisées par la loi
                  </p>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✓ Recherche en sécurité</h4>
                  <p className="text-gray-300 text-sm">
                    Analyse de vulnérabilités et recherche en cybersécurité
                  </p>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✓ Protection défensive</h4>
                  <p className="text-gray-300 text-sm">
                    Évaluation des risques et protection des systèmes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-red-400 mb-6 flex items-center">
                <FiX className="w-6 h-6 mr-3" />
                Usages interdits
              </h3>
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">✗ Activités illégales</h4>
                  <p className="text-gray-300 text-sm">
                    Toute utilisation contraire aux lois en vigueur
                  </p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">✗ Harcèlement</h4>
                  <p className="text-gray-300 text-sm">
                    Surveillance non autorisée ou harcèlement de personnes
                  </p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">✗ Atteinte à la vie privée</h4>
                  <p className="text-gray-300 text-sm">
                    Collecte non autorisée de données personnelles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsabilités Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Responsabilités et limitations</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6">
              <FiShield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Responsabilité utilisateur</h3>
              <p className="text-gray-300">
                L'utilisateur est seul responsable de l'utilisation qu'il fait des outils et 
                des données obtenues via la plateforme.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6">
              <FiEye className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Limitation de responsabilité</h3>
              <p className="text-gray-300">
                aOSINT ne peut être tenu responsable des dommages résultant de l'utilisation 
                inappropriée de ses services.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-primary/20 rounded-lg p-6">
              <FiLock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Confidentialité</h3>
              <p className="text-gray-300">
                Les utilisateurs s'engagent à respecter la confidentialité des données 
                obtenues et à ne pas les divulguer sans autorisation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sanctions Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-8">
            <div className="flex items-center mb-6">
              <FiAlertTriangle className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">Sanctions et suspension</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Violations graves</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Utilisation à des fins illégales</li>
                  <li>• Atteinte aux droits de tiers</li>
                  <li>• Tentative de contournement des sécurités</li>
                  <li>• Partage non autorisé de données</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Mesures applicables</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Avertissement et mise en demeure</li>
                  <li>• Suspension temporaire du compte</li>
                  <li>• Résiliation définitive des services</li>
                  <li>• Poursuites judiciaires si nécessaire</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modification Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-6">Modifications des conditions</h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
              aOSINT se réserve le droit de modifier les présentes conditions d'utilisation 
              à tout moment. Les utilisateurs seront informés des modifications importantes 
              par email ou via la plateforme.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-primary font-semibold">
                L'utilisation continue des services après modification constitue une acceptation 
                des nouvelles conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Questions sur les conditions ?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Pour toute question concernant ces conditions d'utilisation, 
            n'hésitez pas à nous contacter.
          </p>
          <button className="cyber-button-primary px-8 py-3 rounded-lg font-medium text-lg transition-all">
            Nous contacter
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
} 