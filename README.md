# aOSINT - Advanced Open Source Intelligence Platform

🔍 **Plateforme d'intelligence ouverte avancée** avec un design cyberpunk moderne pour les professionnels de la cybersécurité et les enquêteurs numériques.

## 🚀 Fonctionnalités

- **Design Cyberpunk Ultra-Moderne** : Interface utilisateur futuriste avec animations et effets visuels
- **Outils OSINT Intégrés** : Collection complète d'outils d'investigation numérique
- **Authentification Sécurisée** : Système d'inscription et de connexion avec E-mail/mot de passe
- **Interface Responsive** : Compatible avec tous les appareils
- **Performance Optimisée** : Construit avec Next.js et Tailwind CSS

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, React 19, TypeScript
- **Styling** : Tailwind CSS 4 avec design system cyberpunk
- **Base de Données** : MongoDB avec Prisma ORM
- **Authentification** : NextAuth.js avec bcryptjs
- **Animations** : Framer Motion
- **Icônes** : Lucide React

## 📦 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- MongoDB (local ou cloud)

### Installation des dépendances

```bash
# Installer les dépendances principales
npm install prisma @prisma/client bcryptjs jsonwebtoken next-auth @next-auth/prisma-adapter

# Installer les dépendances pour l'interface
npm install framer-motion lucide-react

# Installer les types TypeScript
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Configuration

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd aosint
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Ajouter dans `.env.local` :
```env
# Database
DATABASE_URL="mongodb://localhost:27017/aosint"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT
JWT_SECRET="your-jwt-secret-here"
```

4. **Configurer Prisma**
```bash
npx prisma init
npx prisma generate
npx prisma db push
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

## 🎨 Design System

### Couleurs Cyberpunk

- **Primary** : `#00ff88` (Vert néon)
- **Secondary** : `#ff0080` (Rose néon)
- **Accent** : `#00d4ff` (Bleu cyan)
- **Background** : `#0a0a0a` (Noir profond)
- **Surface** : `#1a1a1a` (Gris foncé)

### Typographie

- **Headings** : Orbitron (Monospace futuriste)
- **Body** : Rajdhani (Sans-serif moderne)

### Animations

- **Glow Effect** : Effet de lueur sur les éléments importants
- **Pulse** : Animation de pulsation pour les indicateurs
- **Slide In** : Animations d'entrée fluides

## 🔧 Structure du Projet

```
aosint/
├── app/
│   ├── components/
│   │   ├── Header.tsx      # En-tête avec navigation
│   │   ├── Hero.tsx        # Section héro principale
│   │   └── Footer.tsx      # Pied de page
│   ├── globals.css         # Styles globaux cyberpunk
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Page d'accueil
├── public/                 # Assets statiques
├── prisma/                 # Configuration base de données
├── tailwind.config.js      # Configuration Tailwind
└── package.json
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm run build
vercel --prod
```

### Docker

```bash
docker build -t aosint .
docker run -p 3000:3000 aosint
```

## 🔐 Sécurité

- Authentification sécurisée avec NextAuth.js
- Hachage des mots de passe avec bcryptjs
- Protection CSRF intégrée
- Validation des données côté serveur

## 📝 Roadmap

- [ ] Système d'authentification complet
- [ ] Dashboard utilisateur
- [ ] Outils OSINT intégrés
- [ ] API REST pour les outils
- [ ] Documentation interactive
- [ ] Système de plugins

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire le guide de contribution avant de soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens Utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)

---

**aOSINT** - Votre plateforme d'intelligence ouverte nouvelle génération 🔍✨
