'use client'

import { useState, useEffect } from 'react'
import { Shield, Eye, Database, Cookie, UserCheck, Lock, Trash2, Mail, FileText } from 'lucide-react'

export default function ConfidentialityPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-cyan-400 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Politique de confidentialité
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Protection de vos données personnelles et respect du RGPD
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Introduction */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Introduction</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <p className="text-gray-300 leading-relaxed">
              La présente politique de confidentialité décrit la façon dont aOSINT collecte, utilise et protège 
              les informations que vous nous fournissez lorsque vous utilisez notre plateforme. Nous nous engageons 
              à protéger votre vie privée et à respecter le Règlement Général sur la Protection des Données (RGPD).
            </p>
          </div>
        </section>

        {/* Données collectées */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Database className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Données collectées</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">Données d'identification</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Adresse e-mail</li>
                  <li>• Numéro de téléphone (optionnel)</li>
                  <li>• Informations de connexion</li>
                  <li>• Résultat chiffré du mot de passe (Nous ne voyons pas votre mot de passe en clair dans la db)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">Données d'utilisation</h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• Adresse IP</li>
                  <li>• Données de navigation (pages visitées, durée de session)</li>
                  <li>• Informations sur l'appareil (navigateur, système d'exploitation)</li>
                  <li>• Journaux d'activité des outils OSINT utilisés</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Finalités du traitement */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Eye className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Finalités du traitement</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">Utilisation des données</h3>
                <ul className="space-y-2">
                  <li>• Gestion des comptes utilisateurs et authentification</li>
                  <li>• Fourniture des services OSINT</li>
                  <li>• Amélioration de la plateforme et des outils</li>
                  <li>• Communication avec les utilisateurs</li>
                  <li>• Respect des obligations légales</li>
                  <li>• Sécurité et prévention des fraudes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Méthode de ByPass */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Eye className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Si vous voulez être "anonyme"</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">Utilisation des données</h3>
                <p className="text-gray-300">Si notre collecte de données vous pose problème, vous pouvez vous connecter à un VPN et utiliser une Machine Vitruelle pour vous y connecter ainsi nous ne pourrons collecter que vos données de comtpe (Username, Email, Session).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Base légale */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <UserCheck className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Base légale du traitement</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Le traitement de vos données personnelles est fondé sur :
              </p>
              <ul className="space-y-2">
                <li>• <strong className="text-cyan-300">Consentement :</strong> pour l'utilisation de cookies non essentiels</li>
                <li>• <strong className="text-cyan-300">Exécution du contrat :</strong> pour la fourniture des services</li>
                <li>• <strong className="text-cyan-300">Intérêt légitime :</strong> pour l'amélioration de la plateforme</li>
                <li>• <strong className="text-cyan-300">Obligation légale :</strong> pour le respect des réglementations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Cookie className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Cookies et technologies similaires</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">Types de cookies utilisés</h3>
                <ul className="space-y-2">
                  <li>• <strong className="text-cyan-300">Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                  <li>• <strong className="text-cyan-300">Cookies de session :</strong> pour maintenir votre connexion</li>
                  <li>• <strong className="text-cyan-300">Cookies d'analyse :</strong> pour améliorer nos services (avec votre consentement)</li>
                </ul>
              </div>
              <p className="leading-relaxed">
                Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur 
                ou notre bandeau de consentement.
              </p>
            </div>
          </div>
        </section>

        {/* Sécurité */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Lock className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Sécurité des données</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
                vos données personnelles :
              </p>
              <ul className="space-y-2">
                <li>• Chiffrement des données en transit et au repos</li>
                <li>• Accès restreint aux données personnelles</li>
                <li>• Surveillance continue des systèmes</li>
                <li>• Sauvegardes régulières et sécurisées</li>
                <li>• Formation du personnel à la protection des données</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vos droits */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Vos droits</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="space-y-2">
                <li>• <strong className="text-cyan-300">Droit d'accès :</strong> consulter vos données personnelles</li>
                <li>• <strong className="text-cyan-300">Droit de rectification :</strong> corriger vos données</li>
                <li>• <strong className="text-cyan-300">Droit d'effacement :</strong> demander la suppression de vos données</li>
                <li>• <strong className="text-cyan-300">Droit à la portabilité :</strong> récupérer vos données</li>
                <li>• <strong className="text-cyan-300">Droit d'opposition :</strong> vous opposer au traitement</li>
                <li>• <strong className="text-cyan-300">Droit à la limitation :</strong> limiter le traitement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Conservation des données */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Trash2 className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Conservation des données</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités 
                pour lesquelles elles ont été collectées :
              </p>
              <ul className="space-y-2">
                <li>• <strong className="text-cyan-300">Données de compte :</strong> pendant la durée de votre inscription</li>
                <li>• <strong className="text-cyan-300">Données d'utilisation :</strong> 13 mois maximum</li>
                <li>• <strong className="text-cyan-300">Journaux de connexion :</strong> 1 an maximum</li>
                <li>• <strong className="text-cyan-300">Données de facturation :</strong> 10 ans (obligation légale)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Mail className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Contact et réclamations</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Pour exercer vos droits ou pour toute question concernant cette politique de confidentialité, 
                vous pouvez nous contacter :
              </p>
              <ul className="space-y-2">
                <li>• <strong className="text-cyan-300">Email :</strong> privacy@aosint.fr</li>
                <li>• <strong className="text-cyan-300">Courrier :</strong> aOSINT - Service Protection des Données, 
                123 Avenue de la Cybersécurité, 75001 Paris</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Vous avez également le droit de déposer une réclamation auprès de la Commission Nationale 
                de l'Informatique et des Libertés (CNIL) si vous estimez que le traitement de vos données 
                personnelles constitue une violation de la réglementation applicable.
              </p>
            </div>
          </div>
        </section>

        {/* Modifications */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold text-cyan-400">Modifications</h2>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
            <p className="text-gray-300 leading-relaxed">
              Cette politique de confidentialité peut être modifiée à tout moment. Toute modification sera 
              communiquée via notre site web et/ou par e-mail. La version en vigueur est celle publiée sur 
              notre site web.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              <strong className="text-cyan-300">Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
} 