# 🔍 Système de Métadonnées SEO Centralisé

Ce système permet de gérer toutes les métadonnées SEO de manière centralisée tout en gardant les pages avec `'use client'`.

## 📁 Structure

```
lib/
├── metadata.ts          # Configuration centralisée des métadonnées
scripts/
├── generate-metadata.js # Script de génération automatique
app/
├── about/
│   ├── layout.tsx      # Layout avec métadonnées
│   └── page.tsx        # Page avec 'use client'
```

## 🚀 Utilisation

### 1. Ajouter une nouvelle page

```bash
# Ajouter la configuration dans lib/metadata.ts
node scripts/generate-metadata.js add tools \
  --title "Outils OSINT" \
  --desc "Suite complète d'outils OSINT pour professionnels" \
  --keywords "outils,OSINT,cybersécurité,investigation" \
  --path "/tools"

# Créer le layout automatiquement
node scripts/generate-metadata.js create tools
```

### 2. Utilisation manuelle

Dans `lib/metadata.ts`, ajoutez votre page :

```typescript
export const pagesMetadata = {
  // ... autres pages
  maNouvellePage: {
    title: 'Mon Titre',
    description: 'Ma description SEO optimisée',
    keywords: ['mot-clé1', 'mot-clé2'],
    path: '/ma-page',
    ogImage: '/og-ma-page.jpg',
    twitterImage: '/twitter-ma-page.jpg'
  }
}
```

Créez le layout `app/ma-page/layout.tsx` :

```typescript
import { getPageMetadata } from '@/lib/metadata'

export const metadata = getPageMetadata('maNouvellePage')

export default function MaPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

## 🎯 Fonctionnalités

### Métadonnées générées automatiquement

- **Title** : Titre optimisé avec nom du site
- **Description** : Description SEO
- **Keywords** : Mots-clés combinés (globaux + spécifiques)
- **Open Graph** : Facebook/LinkedIn optimisé
- **Twitter Cards** : Twitter optimisé
- **Canonical URL** : URL canonique
- **Robots** : Configuration d'indexation
- **Authors** : Informations d'auteur

### JSON-LD structuré

```typescript
import { generateJsonLd } from '@/lib/metadata'

const jsonLd = generateJsonLd('organization', {
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services OSINT',
    // ... autres données
  }
})
```

## 🛠️ Configuration

### Modifier la configuration globale

Dans `lib/metadata.ts` :

```typescript
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
    // ... autres mots-clés globaux
  ]
}
```

### Types de métadonnées supportés

```typescript
interface MetadataConfig {
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
```

## 📊 Exemples d'utilisation

### Page simple

```bash
node scripts/generate-metadata.js add contact \
  --title "Contact" \
  --desc "Contactez l'équipe aOSINT" \
  --keywords "contact,support,aide" \
  --path "/contact"

node scripts/generate-metadata.js create contact
```

### Page avec JSON-LD

```bash
node scripts/generate-metadata.js create tools --jsonld
```

### Page d'article/blog

```typescript
// Dans le layout
const jsonLd = generateJsonLd('article', {
  headline: 'Titre de l\'article',
  datePublished: '2024-01-01',
  dateModified: '2024-01-02',
  author: {
    '@type': 'Person',
    name: 'Auteur'
  }
})
```

## ✅ Avantages

1. **Centralisé** : Toutes les métadonnées dans un seul endroit
2. **Cohérent** : Format uniforme pour toutes les pages
3. **Maintenable** : Facile à modifier et maintenir
4. **Automatisé** : Script de génération automatique
5. **Flexible** : Support de différents types de contenu
6. **Compatible** : Fonctionne avec `'use client'`

## 🔧 Commandes du script

```bash
# Afficher l'aide
node scripts/generate-metadata.js

# Ajouter une page à la configuration
node scripts/generate-metadata.js add <nom> --title "Titre" --desc "Description" --keywords "k1,k2" --path "/chemin"

# Créer un layout
node scripts/generate-metadata.js create <nom> [--jsonld] [--force]

# Exemple complet
node scripts/generate-metadata.js add blog --title "Blog OSINT" --desc "Articles sur l'OSINT" --keywords "blog,articles,OSINT" --path "/blog"
node scripts/generate-metadata.js create blog --jsonld
```

## 🎨 Images Open Graph

N'oubliez pas de créer les images correspondantes :

- `/public/og-[page].jpg` (1200x630px)
- `/public/twitter-[page].jpg` (1200x630px)
- `/public/og-default.jpg` (image par défaut)
- `/public/twitter-default.jpg` (image par défaut)

## 📈 Résultat

Avec ce système, chaque page aura automatiquement :

- ✅ Métadonnées SEO optimisées
- ✅ Open Graph pour les réseaux sociaux
- ✅ Twitter Cards
- ✅ JSON-LD structuré
- ✅ URL canonique
- ✅ Configuration robots
- ✅ Compatibilité avec `'use client'` 