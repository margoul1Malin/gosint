import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer la catégorie "web-analysis"
    const category = await prisma.category.findUnique({
      where: { slug: 'web-analysis' }
    })

    if (!category) {
      // Si la catégorie n'existe pas, retourner des outils mockés
      return NextResponse.json({
        tools: getMockTools(),
        category: {
          id: 'web-analysis',
          name: 'Analyse Web',
          slug: 'web-analysis',
          description: 'Outils d\'analyse et d\'audit de sites web, domaines et infrastructures',
          icon: 'FiGlobe',
          color: '#00d4ff'
        }
      })
    }

    // Récupérer tous les outils de cette catégorie
    const tools = await prisma.tool.findMany({
      where: {
        categoryIds: {
          has: category.id
        },
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      tools,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des outils:', error)
    
    // En cas d'erreur, retourner des outils mockés
    return NextResponse.json({
      tools: getMockTools(),
      category: {
        id: 'web-analysis',
        name: 'Analyse Web',
        slug: 'web-analysis',
        description: 'Outils d\'analyse et d\'audit de sites web, domaines et infrastructures',
        icon: 'FiGlobe',
        color: '#00d4ff'
      }
    })
  }
}

function getMockTools() {
  return [
    {
      id: 'whois-lookup',
      name: 'Whois Lookup',
      description: 'Recherche d\'informations sur un nom de domaine : propriétaire, serveurs DNS, dates d\'expiration et plus encore.',
      slug: 'whois-lookup',
      icon: 'FiSearch',
      isActive: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'dns-analyzer',
      name: 'DNS Analyzer',
      description: 'Analyse complète des enregistrements DNS : A, AAAA, MX, TXT, CNAME, NS et détection de configurations suspectes.',
      slug: 'dns-analyzer',
      icon: 'FiGlobe',
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ssl-checker',
      name: 'SSL Certificate Checker',
      description: 'Vérification des certificats SSL/TLS : validité, chaîne de confiance, algorithmes de chiffrement et vulnérabilités.',
      slug: 'ssl-checker',
      icon: 'FiShield',
      isActive: true,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'website-analyzer',
      name: 'Website Analyzer',
      description: 'Analyse complète d\'un site web : technologies utilisées, headers HTTP, métadonnées et informations de sécurité.',
      slug: 'website-analyzer',
      icon: 'FiEye',
      isActive: true,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'subdomain-finder',
      name: 'Subdomain Finder',
      description: 'Découverte de sous-domaines : énumération passive et active pour cartographier l\'infrastructure d\'un domaine.',
      slug: 'subdomain-finder',
      icon: 'FiActivity',
      isActive: true,
      order: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'port-scanner',
      name: 'Port Scanner',
      description: 'Scan des ports ouverts sur un serveur : détection des services, versions et potentielles vulnérabilités.',
      slug: 'port-scanner',
      icon: 'FiCode',
      isActive: true,
      order: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
} 