#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Configuration par défaut
const defaultConfig = {
  siteName: 'aOSINT',
  siteUrl: 'https://aosint.com',
  author: 'aOSINT Team',
  twitterHandle: '@aOSINT'
}

// Template pour le layout
const layoutTemplate = (pageName, jsonLdData = null) => `import { getPageMetadata${jsonLdData ? ', generateJsonLd' : ''} } from '@/lib/metadata'

export const metadata = getPageMetadata('${pageName}')

export default function ${capitalize(pageName)}Layout({
  children,
}: {
  children: React.ReactNode
}) {${jsonLdData ? `
  const jsonLd = generateJsonLd('${jsonLdData.type}', ${JSON.stringify(jsonLdData.data, null, 4)})

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )` : `
  return <>{children}</>`}
}
`

// Fonction pour capitaliser
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Fonction pour créer un layout
function createLayout(pageName, options = {}) {
  const {
    directory = `app/${pageName}`,
    jsonLd = null,
    force = false
  } = options

  const layoutPath = path.join(directory, 'layout.tsx')
  
  // Vérifier si le répertoire existe
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
    console.log(`✅ Répertoire créé: ${directory}`)
  }

  // Vérifier si le layout existe déjà
  if (fs.existsSync(layoutPath) && !force) {
    console.log(`⚠️  Le layout existe déjà: ${layoutPath}`)
    console.log(`   Utilisez --force pour écraser`)
    return
  }

  // Générer le contenu du layout
  const layoutContent = layoutTemplate(pageName, jsonLd)

  // Écrire le fichier
  fs.writeFileSync(layoutPath, layoutContent)
  console.log(`✅ Layout créé: ${layoutPath}`)
}

// Fonction pour ajouter une nouvelle page dans la configuration
function addPageConfig(pageName, config) {
  const metadataPath = 'lib/metadata.ts'
  
  if (!fs.existsSync(metadataPath)) {
    console.log(`❌ Fichier de métadonnées non trouvé: ${metadataPath}`)
    return
  }

  const metadataContent = fs.readFileSync(metadataPath, 'utf8')
  
  // Vérifier si la page existe déjà
  if (metadataContent.includes(`${pageName}:`)) {
    console.log(`⚠️  La page '${pageName}' existe déjà dans la configuration`)
    return
  }

  // Créer la nouvelle configuration
  const newPageConfig = `  ${pageName}: {
    title: '${config.title}',
    description: '${config.description}',
    keywords: [${config.keywords.map(k => `'${k}'`).join(', ')}],
    path: '${config.path}',
    ogImage: '/og-${pageName}.jpg',
    twitterImage: '/twitter-${pageName}.jpg'
  },`

  // Trouver la position d'insertion (avant la fermeture de pagesMetadata)
  const insertPosition = metadataContent.lastIndexOf('}')
  const beforeInsert = metadataContent.substring(0, insertPosition)
  const afterInsert = metadataContent.substring(insertPosition)

  const newContent = beforeInsert + newPageConfig + '\n' + afterInsert

  fs.writeFileSync(metadataPath, newContent)
  console.log(`✅ Configuration ajoutée pour '${pageName}' dans ${metadataPath}`)
}

// Interface en ligne de commande
function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📋 Générateur de métadonnées aOSINT

Usage:
  node scripts/generate-metadata.js <command> [options]

Commandes:
  create <pageName>     Créer un layout avec métadonnées
  add <pageName>        Ajouter une page à la configuration

Options:
  --title "Titre"       Titre de la page
  --desc "Description"  Description de la page
  --keywords "k1,k2"    Mots-clés (séparés par des virgules)
  --path "/path"        Chemin de la page
  --dir "directory"     Répertoire de destination
  --jsonld              Ajouter un JSON-LD
  --force               Écraser les fichiers existants

Exemples:
  node scripts/generate-metadata.js create tools --title "Outils OSINT" --desc "Suite d'outils" --keywords "outils,OSINT" --path "/tools"
  node scripts/generate-metadata.js add contact --title "Contact" --desc "Nous contacter" --keywords "contact,support" --path "/contact"
    `)
    return
  }

  const command = args[0]
  const pageName = args[1]

  if (!pageName) {
    console.log('❌ Nom de page requis')
    return
  }

  // Parser les options
  const options = {}
  for (let i = 2; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.substring(2)
      const value = args[i + 1]
      options[key] = value
      i++ // Skip next argument
    }
  }

  switch (command) {
    case 'create':
      const jsonLd = options.jsonld ? {
        type: 'website',
        data: {}
      } : null

      createLayout(pageName, {
        directory: options.dir || `app/${pageName}`,
        jsonLd,
        force: options.force
      })
      break

    case 'add':
      if (!options.title || !options.desc || !options.path) {
        console.log('❌ Options requises: --title, --desc, --path')
        return
      }

      const config = {
        title: options.title,
        description: options.desc,
        keywords: options.keywords ? options.keywords.split(',') : [],
        path: options.path
      }

      addPageConfig(pageName, config)
      break

    default:
      console.log(`❌ Commande inconnue: ${command}`)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createLayout, addPageConfig } 