import { getPageMetadata, generateJsonLd } from '@/lib/metadata'

export const metadata = getPageMetadata('about')

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = generateJsonLd('organization', {
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services OSINT',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Reconnaissance Réseau',
            description: 'Analyse IP, scan de ports, détection de services et cartographie réseau avancée'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Analyse Web',
            description: 'Investigation de domaines, analyse DNS, détection de technologies et vulnérabilités'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Investigation Sociale',
            description: 'Recherche sur les réseaux sociaux, analyse de profils et corrélation de données'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Bases de Données',
            description: 'Accès aux bases publiques, détection de fuites et analyse de breaches'
          }
        }
      ]
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
} 