import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'aOSINT - Advanced Open Source Intelligence Platform',
    short_name: 'aOSINT',
    description: 'Plateforme d\'intelligence open source avancée pour la recherche OSINT, l\'analyse de domaines, la reconnaissance IP, l\'investigation sociale et l\'analyse de métadonnées.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00ff88',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr-FR',
    dir: 'ltr',
    categories: ['productivity', 'security', 'utilities'],
    shortcuts: [
      {
        name: 'Recherche OSINT',
        short_name: 'OSINT',
        description: 'Recherche d\'intelligence open source',
        url: '/outils/osint-search',
        icons: [{ src: '/icons/osint-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Analyse de domaines',
        short_name: 'Domaines',
        description: 'Analyse et reconnaissance de domaines',
        url: '/outils/domain-analysis',
        icons: [{ src: '/icons/domain-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Reconnaissance IP',
        short_name: 'IP Recon',
        description: 'Reconnaissance et analyse d\'adresses IP',
        url: '/outils/ip-recon',
        icons: [{ src: '/icons/ip-192x192.png', sizes: '192x192' }]
      },
      {
        name: 'Investigation sociale',
        short_name: 'Social',
        description: 'Investigation sur les réseaux sociaux',
        url: '/outils/social-investigation',
        icons: [{ src: '/icons/social-192x192.png', sizes: '192x192' }]
      }
    ],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/desktop-1.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'Interface principale aOSINT'
      },
      {
        src: '/screenshots/mobile-1.png',
        sizes: '375x667',
        type: 'image/png',
        label: 'Interface mobile aOSINT'
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  }
} 