import { Metadata } from 'next'

export interface MetadataConfig {
  title: string
  description: string
  keywords?: string[]
  path: string
  ogImage?: string
  twitterImage?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

const defaultConfig = {
  siteName: 'aOSINT',
  siteUrl: 'https://aosint.com',
  defaultOgImage: '/og-default.jpg',
  defaultTwitterImage: '/twitter-default.jpg',
  locale: 'fr_FR',
  twitterHandle: '@aOSINT',
  author: 'aOSINT Team',
  keywords: [
    'OSINT',
    'intelligence open source',
    'cybersécurité',
    'investigation numérique',
    'reconnaissance réseau',
    'analyse de données',
    'enquête digitale',
    'sécurité informatique'
  ]
}

export function generateMetadata(config: MetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    path,
    ogImage,
    twitterImage,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = config

  const fullTitle = `${title} | ${defaultConfig.siteName}`
  const canonicalUrl = `${defaultConfig.siteUrl}${path}`
  const ogImageUrl = ogImage || defaultConfig.defaultOgImage
  const twitterImageUrl = twitterImage || defaultConfig.defaultTwitterImage
  
  const allKeywords = [...defaultConfig.keywords, ...keywords, ...tags]

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: author || defaultConfig.author }],
    creator: defaultConfig.siteName,
    publisher: defaultConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(defaultConfig.siteUrl),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: defaultConfig.locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [twitterImageUrl],
      creator: defaultConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }

  // Ajouter les métadonnées spécifiques aux articles
  if (type === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [author || defaultConfig.author],
      section,
      tags,
    }
  }

  return metadata
}

// Configuration des métadonnées pour chaque page
export const pagesMetadata = {
  home: {
    title: 'Plateforme d\'Intelligence Open Source',
    description: 'aOSINT - Plateforme de nouvelle génération pour l\'intelligence open source. Outils avancés pour professionnels de la cybersécurité, enquêteurs et analystes.',
    keywords: ['plateforme OSINT', 'outils cybersécurité', 'investigation en ligne'],
    path: '/',
    ogImage: '/og-home.jpg',
    twitterImage: '/twitter-home.jpg'
  },
  about: {
    title: 'À propos d\'aOSINT',
    description: 'Découvrez aOSINT, la plateforme de nouvelle génération pour l\'intelligence open source. Outils avancés pour professionnels de la cybersécurité.',
    keywords: ['à propos', 'équipe', 'mission', 'vision', 'cybersécurité'],
    path: '/about',
    ogImage: '/og-about.jpg',
    twitterImage: '/twitter-about.jpg'
  },
  tools: {
    title: 'Outils OSINT',
    description: 'Découvrez notre suite complète d\'outils OSINT : reconnaissance réseau, analyse web, investigation sociale et bases de données.',
    keywords: ['outils OSINT', 'reconnaissance réseau', 'analyse web', 'investigation sociale'],
    path: '/tools',
    ogImage: '/og-tools.jpg',
    twitterImage: '/twitter-tools.jpg'
  },
  contact: {
    title: 'Contact',
    description: 'Contactez l\'équipe aOSINT pour toute question, demande de support ou partenariat. Nous sommes là pour vous accompagner.',
    keywords: ['contact', 'support', 'aide', 'partenariat'],
    path: '/contact',
    ogImage: '/og-contact.jpg',
    twitterImage: '/twitter-contact.jpg'
  },
  dashboard: {
    title: 'Tableau de bord',
    description: 'Accédez à votre tableau de bord aOSINT pour gérer vos investigations, consulter vos analyses et configurer vos outils.',
    keywords: ['tableau de bord', 'dashboard', 'analyses', 'investigations'],
    path: '/dashboard',
    ogImage: '/og-dashboard.jpg',
    twitterImage: '/twitter-dashboard.jpg'
  },
  signin: {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte aOSINT pour accéder à tous vos outils d\'intelligence open source et vos investigations.',
    keywords: ['connexion', 'login', 'authentification', 'compte'],
    path: '/auth/signin',
    ogImage: '/og-signin.jpg',
    twitterImage: '/twitter-signin.jpg'
  },
  signup: {
    title: 'Inscription',
    description: 'Créez votre compte aOSINT et rejoignez des milliers de professionnels qui utilisent nos outils d\'intelligence open source.',
    keywords: ['inscription', 'créer compte', 'rejoindre', 'registration'],
    path: '/auth/signup',
    ogImage: '/og-signup.jpg',
    twitterImage: '/twitter-signup.jpg'
  },
  terms: {
    title: 'Conditions d\'utilisation',
    description: 'Consultez les conditions d\'utilisation de la plateforme aOSINT. Droits et obligations des utilisateurs pour l\'utilisation des outils OSINT.',
    keywords: ['conditions utilisation', 'CGU', 'droits utilisateurs', 'obligations'],
    path: '/terms',
    ogImage: '/og-terms.jpg',
    twitterImage: '/twitter-terms.jpg'
  },
  legal: {
    title: 'Mentions légales',
    description: 'Mentions légales de aOSINT. Informations sur l\'éditeur, hébergeur et responsabilités légales de la plateforme OSINT.',
    keywords: ['mentions légales', 'éditeur', 'hébergeur', 'responsabilités'],
    path: '/legal',
    ogImage: '/og-legal.jpg',
    twitterImage: '/twitter-legal.jpg'
  },
  confidentiality: {
    title: 'Politique de confidentialité',
    description: 'Politique de confidentialité aOSINT. Protection des données personnelles, cookies et respect du RGPD pour les utilisateurs.',
    keywords: ['confidentialité', 'données personnelles', 'RGPD', 'cookies', 'vie privée'],
    path: '/confidentiality',
    ogImage: '/og-confidentiality.jpg',
    twitterImage: '/twitter-confidentiality.jpg'
  }
}

// Fonction helper pour générer les métadonnées d'une page
export function getPageMetadata(pageName: keyof typeof pagesMetadata): Metadata {
  const config = pagesMetadata[pageName]
  return generateMetadata(config)
}

// Fonction pour générer le JSON-LD structuré
export function generateJsonLd(type: 'organization' | 'website' | 'article', data: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
  }

  switch (type) {
    case 'organization':
      return {
        ...baseSchema,
        '@type': 'Organization',
        name: defaultConfig.siteName,
        description: 'Plateforme d\'intelligence open source de nouvelle génération',
        url: defaultConfig.siteUrl,
        logo: `${defaultConfig.siteUrl}/logo.png`,
        sameAs: [
          'https://twitter.com/PinokioS1ffredi',
          'https://linkedin.com/company/PinokioS1ffredi',
          'https://github.com/margoul1Malin'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'French'
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'FR'
        },
        foundingDate: '2024',
        industry: 'Cybersecurity',
        ...data
      }

    case 'website':
      return {
        ...baseSchema,
        '@type': 'WebSite',
        name: defaultConfig.siteName,
        url: defaultConfig.siteUrl,
        description: 'Plateforme d\'intelligence open source',
        publisher: {
          '@type': 'Organization',
          name: defaultConfig.siteName
        },
        ...data
      }

    case 'article':
      return {
        ...baseSchema,
        '@type': 'Article',
        publisher: {
          '@type': 'Organization',
          name: defaultConfig.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${defaultConfig.siteUrl}/logo.png`
          }
        },
        ...data
      }

    default:
      return baseSchema
  }
} 