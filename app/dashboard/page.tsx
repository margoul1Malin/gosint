'use client'

import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Tableau de bord
        </h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations utilisateur</h2>
          <div className="space-y-2">
            <p><span className="text-gray-400">Nom:</span> {session?.user?.name}</p>
            <p><span className="text-gray-400">Email:</span> {session?.user?.email}</p>
            <p><span className="text-gray-400">Rôle:</span> {session?.user?.role}</p>
            <p><span className="text-gray-400">Statut:</span> {session?.user?.status}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Bienvenue sur aOSINT</h2>
          <p className="text-gray-300">
            Vous êtes maintenant connecté et avez accès à tous les outils OSINT de la plateforme.
          </p>
        </div>
      </div>
    </div>
  )
} 