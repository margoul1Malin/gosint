# Documentation Complète du Projet aOSINT

## 🎯 Vue d'ensemble du Projet

**aOSINT** est une plateforme avancée d'Open Source Intelligence (OSINT) développée avec Next.js 15, React 19 et TypeScript. L'application propose une interface cyberpunk moderne pour les professionnels de la cybersécurité et les enquêteurs numériques, avec un système de file d'attente robuste pour gérer les tâches intensives.

### Technologies Principales
- **Frontend** : Next.js 15, React 19, TypeScript
- **Base de données** : MongoDB avec Prisma ORM
- **Authentification** : NextAuth.js avec bcryptjs
- **Styling** : Tailwind CSS 4 avec design system cyberpunk
- **Animations** : Framer Motion
- **Icônes** : Lucide React, React Icons

## 📁 Architecture du Projet

```
aosint/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts     # Configuration NextAuth
│   │   │   └── register/route.ts          # Inscription utilisateur
│   │   ├── queue/
│   │   │   ├── status/route.ts            # API statut des tâches
│   │   │   └── stats/route.ts             # API statistiques queue
│   │   ├── tools/
│   │   │   ├── email-leak/
│   │   │   │   └── holehe/route.ts        # API Holehe (queue)
│   │   │   ├── phone-leak/
│   │   │   │   └── ignorant/route.ts      # API Ignorant (queue)
│   │   │   ├── google-dorking/route.ts    # API Google Dorking
│   │   │   └── password-leak/route.ts     # API Password Leak
│   │   ├── user/                          # APIs utilisateur
│   │   ├── admin/                         # APIs administration
│   │   └── categories/                    # APIs catégories
│   ├── tools/
│   │   ├── google-dorking/page.tsx        # Interface Google Dorking
│   │   ├── e-mail-leak/page.tsx          # Interface Email Leak
│   │   ├── phone-leak/page.tsx           # Interface Phone Leak
│   │   ├── password-leak/page.tsx        # Interface Password Leak
│   │   └── leaks/page.tsx                # Hub fuites de données
│   ├── dashboard/                         # Tableau de bord
│   ├── auth/                             # Pages d'authentification
│   ├── admin/                            # Interface administration
│   ├── components/                       # Composants réutilisables
│   ├── layout.tsx                        # Layout principal
│   ├── page.tsx                          # Page d'accueil
│   └── globals.css                       # Styles globaux
├── lib/
│   ├── queue.ts                          # Classe TaskQueue principale
│   ├── queue-instance.ts                 # Instance globale queue
│   ├── auth.ts                           # Configuration NextAuth
│   ├── prisma.ts                         # Configuration Prisma
│   ├── holehe-executor.ts                # Exécuteur Holehe
│   ├── ignorant-executor.ts              # Exécuteur Ignorant
│   ├── google-dorking-executor.ts        # Exécuteur Google Dorking
│   ├── password-leak-executor.ts         # Exécuteur Password Leak
│   └── email-leak-executor.ts            # Exécuteur Email Leak
├── prisma/
│   └── schema.prisma                     # Schéma base de données
├── types/                                # Types TypeScript
├── public/                               # Assets statiques
├── pynv/                                 # Environnement Python virtuel
├── scripts/                              # Scripts utilitaires
└── middleware.ts                         # Middleware Next.js
```

## 🔐 Système d'Authentification

### Configuration NextAuth (`lib/auth.ts`)
- **Stratégie** : JWT avec CredentialsProvider
- **Connexion** : Email ou téléphone + mot de passe
- **Session** : 30 jours de validité
- **Sécurité** : Hachage bcryptjs, validation des statuts utilisateur

### Middleware d'Authentification (`middleware.ts`)
- **Pages publiques** : `/`, `/auth/signin`, `/auth/signup`
- **Redirection automatique** : Vers `/auth/signin` si non connecté
- **Exclusions** : Routes API, fichiers statiques, assets système

### Modèle Utilisateur (Prisma)
```typescript
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  phone         String?   // Optionnel
  password      String
  name          String?
  role          Role      @default(USER)
  status        UserStatus @default(ACTIVE)
  // ... autres champs
}
```

## 🚀 Système de File d'Attente

### Architecture de la Queue (`lib/queue.ts`)

#### Interface QueueTask
```typescript
interface QueueTask {
  id: string
  type: 'holehe' | 'ignorant' | 'google-dorking' | 'password-leak' | 'email-leak'
  userId: string
  data: any
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
}
```

#### Configuration des Limites
```typescript
const QUEUE_CONFIGS = {
  'holehe': {
    maxConcurrent: 2,      // 2 tâches simultanées max
    timeout: 120000,       // 2 minutes
    retryAttempts: 1
  },
  'ignorant': {
    maxConcurrent: 2,
    timeout: 120000,       // 2 minutes
    retryAttempts: 1
  },
  'google-dorking': {
    maxConcurrent: 3,
    timeout: 300000,       // 5 minutes
    retryAttempts: 1
  },
  'password-leak': {
    maxConcurrent: 5,
    timeout: 60000,        // 1 minute
    retryAttempts: 2
  },
  'email-leak': {
    maxConcurrent: 5,
    timeout: 60000,        // 1 minute
    retryAttempts: 2
  }
}
```

#### Rate Limiting par Utilisateur
- **Holehe/Ignorant** : 2 minutes entre requêtes
- **Google Dorking** : 5 minutes entre requêtes
- **Password/Email Leak** : 30 secondes entre requêtes

### Classe TaskQueue
```typescript
export class TaskQueue {
  private tasks: Map<string, QueueTask> = new Map()
  private runningTasks: Map<string, Set<string>> = new Map()
  private userLastRequest: Map<string, Map<string, Date>> = new Map()

  // Méthodes principales
  async addTask(taskType: string, userId: string, data: any): Promise<string>
  getTaskStatus(taskId: string): QueueTask | null
  getQueueStats(): Record<string, any>
  cleanupOldTasks(): void
}
```

## 🛠️ Outils OSINT Disponibles

### 1. Google Dorking (`app/tools/google-dorking/page.tsx`)
- **Fonction** : Recherche OSINT avancée avec dorks prédéfinis
- **APIs** : SerpAPI pour les recherches Google
- **Dorks** : 48 dorks prédéfinis pour réseaux sociaux, forums, etc.
- **Configuration** : Clés API sauvegardées par utilisateur

### 2. Email Leak Detection (`app/tools/e-mail-leak/page.tsx`)
- **APIs** : LeakCheck, Hunter.io, Holehe
- **Fonctionnalités** :
  - Vérification fuites de données
  - Recherche comptes associés (Holehe)
  - Analyse des violations de données
- **Sécurité** : Chiffrement des clés API

### 3. Phone Leak Detection (`app/tools/phone-leak/page.tsx`)
- **APIs** : LeakCheck, NumVerify, Twilio
- **Outils intégrés** :
  - Ignorant (réseaux sociaux)
  - Google Dorks spécialisés
  - Vérification des fuites
- **Formats** : Support international des numéros

### 4. Password Leak Detection (`app/tools/password-leak/page.tsx`)
- **APIs** : LeakCheck, HaveIBeenPwned
- **Sécurité** : Hachage SHA-1 k-anonymity
- **Fonctionnalités** :
  - Vérification fuites de mots de passe
  - Analyse de la force
  - Recommandations de sécurité

### 5. Hub Fuites de Données (`app/tools/leaks/page.tsx`)
- **Vue d'ensemble** : Tous les outils de détection de fuites
- **Documentation** : Guides d'utilisation et bonnes pratiques
- **Ressources** : Liens vers APIs externes

## 🔧 Exécuteurs de Tâches

### 1. Holehe Executor (`lib/holehe-executor.ts`)
```typescript
export async function executeHolehe(email: string): Promise<HoleheResult[]>
```
- **Commande** : `pynv/bin/holehe [email] --no-color --only-used`
- **Timeout** : 60 secondes
- **Parsing** : Analyse de la sortie console pour détecter les comptes

### 2. Ignorant Executor (`lib/ignorant-executor.ts`)
```typescript
export async function executeIgnorant(countryCode: string, phoneNumber: string): Promise<IgnorantResult[]>
```
- **Commande** : `pynv/bin/ignorant [countryCode] [phoneNumber]`
- **Timeout** : 60 secondes
- **Parsing** : Reconnaissance des patterns `[+]`, `[-]`, `[x]`

### 3. Google Dorking Executor (`lib/google-dorking-executor.ts`)
```typescript
export async function executeGoogleDorking(phoneNumber: string): Promise<GoogleDorksResult[]>
```
- **Simulation** : Génère des requêtes Google Dork
- **Timeout** : 30 secondes
- **Résultats** : URLs de recherche Google formatées

### 4. Password Leak Executor (`lib/password-leak-executor.ts`)
```typescript
export async function executePasswordLeak(password: string, apiKeys: ApiKeys): Promise<PasswordResult[]>
```
- **APIs** : LeakCheck, HaveIBeenPwned
- **Sécurité** : Pas de stockage des mots de passe
- **Simulation** : Résultats mockés pour démonstration

### 5. Email Leak Executor (`lib/email-leak-executor.ts`)
```typescript
export async function executeEmailLeak(email: string, apiKeys: ApiKeys): Promise<EmailLeakResult[]>
```
- **APIs** : LeakCheck, HaveIBeenPwned
- **Fonctionnalités** : Vérification parallèle des APIs
- **Simulation** : Résultats mockés avec probabilités

## 🌐 APIs REST

### Queue Management
- **GET** `/api/queue/status?taskId=xxx` - Statut d'une tâche
- **GET** `/api/queue/stats` - Statistiques de la queue

### Tools APIs
- **POST** `/api/tools/email-leak/holehe` - Lancer Holehe (queue)
- **POST** `/api/tools/phone-leak/ignorant` - Lancer Ignorant (queue)
- **POST** `/api/tools/google-dorking` - Google Dorking
- **POST** `/api/tools/password-leak` - Vérification mot de passe
- **POST** `/api/tools/email-leak` - Vérification email

### Authentication
- **POST** `/api/auth/register` - Inscription
- **POST** `/api/auth/[...nextauth]` - NextAuth endpoints

## 🎨 Design System Cyberpunk

### Couleurs
```css
--primary: #00ff88      /* Vert néon */
--secondary: #ff0080    /* Rose néon */
--accent: #00d4ff       /* Bleu cyan */
--background: #0a0a0a   /* Noir profond */
--surface: #1a1a1a      /* Gris foncé */
```

### Typographie
- **Headings** : Orbitron (Monospace futuriste)
- **Body** : Rajdhani (Sans-serif moderne)

### Animations
- **Glow Effect** : Effet de lueur sur les éléments
- **Pulse** : Animation de pulsation
- **Slide In** : Animations d'entrée fluides

## 🔍 Modèles de Données (Prisma)

### Utilisateurs et Authentification
```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  phone         String?
  password      String
  role          Role      @default(USER)
  status        UserStatus @default(ACTIVE)
  // Relations
  accounts      Account[]
  sessions      Session[]
  activityLogs  ActivityLog[]
  favorites     Favorite[]
  searchHistory SearchHistory[]
}
```

### Outils et Catégories
```prisma
model Tool {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  slug        String   @unique
  description String
  category    Category @relation(fields: [categoryId], references: [id])
  difficulty  ToolDifficulty @default(BEGINNER)
  isActive    Boolean  @default(true)
}

model Category {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  slug        String @unique
  description String
  tools       Tool[]
}
```

### Activité et Historique
```prisma
model ActivityLog {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  action    String
  details   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

## 🚨 Gestion des Erreurs et Debugging

### Logs de Debug (Queue)
```typescript
// Création de tâche
console.log(`📝 Tâche créée avec ID: ${task.id}`)
console.log(`💾 Tâche stockée dans Map: ${this.tasks.has(task.id)}`)

// Recherche de tâche
console.log(`🔍 Recherche de la tâche: ${taskId}`)
console.log(`📋 Tâches disponibles: ${Array.from(this.tasks.keys()).join(', ')}`)

// Exécution
console.log(`🚀 Démarrage de la tâche ${task.id} (${task.type})`)
console.log(`✅ Tâche ${task.id} terminée avec succès`)
```

### Gestion des Timeouts
- **Holehe/Ignorant** : 60-120 secondes
- **Google Dorking** : 300 secondes
- **Password/Email Leak** : 60 secondes

### Rate Limiting
- Messages d'erreur explicites avec temps d'attente
- Gestion par utilisateur et par type de tâche
- Stockage en mémoire des dernières requêtes

## 🔧 Configuration et Déploiement

### Variables d'Environnement
```env
# Base de données
DATABASE_URL="mongodb://localhost:27017/aosint"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# APIs externes (optionnelles)
SERPAPI_KEY="your-serpapi-key"
LEAKCHECK_API_KEY="your-leakcheck-key"
HIBP_API_KEY="your-hibp-key"
```

### Scripts de Démarrage
```bash
# Développement
npm run dev

# Production
npm run build
npm run start

# Base de données
npx prisma generate
npx prisma db push
```

### Environnement Python
```bash
# Installer les outils Python
pip install holehe ignorant

# Vérifier l'installation
pynv/bin/holehe --help
pynv/bin/ignorant --help
```

## 📊 Monitoring et Statistiques

### APIs de Monitoring
- **Queue Stats** : Tâches en cours, en attente, terminées
- **User Activity** : Logs d'activité détaillés
- **Tool Usage** : Statistiques d'utilisation des outils

### Métriques Importantes
- Temps d'exécution des tâches
- Taux de succès/échec
- Utilisation des APIs externes
- Charge de la queue par type de tâche

## 🔐 Sécurité et Bonnes Pratiques

### Authentification
- Hachage bcryptjs pour les mots de passe
- Sessions JWT sécurisées
- Validation des statuts utilisateur
- Logs d'activité complets

### Protection des Données
- Chiffrement des clés API utilisateur
- Pas de stockage des mots de passe en clair
- Anonymisation des recherches
- Nettoyage automatique des anciennes tâches

### Rate Limiting
- Limitation par utilisateur et par outil
- Prévention des abus d'API
- Messages d'erreur informatifs

## 🚀 Fonctionnalités Avancées

### Système de Favoris
- Sauvegarde des outils préférés
- Historique des recherches
- Partage de résultats

### Notifications
- Système de notifications en temps réel
- Alertes de sécurité
- Notifications de fin de tâche

### Administration
- Interface d'administration complète
- Gestion des utilisateurs
- Monitoring des performances
- Configuration des outils

## 📝 Guide de Développement

### Ajouter un Nouvel Outil
1. **Créer l'exécuteur** dans `lib/[tool]-executor.ts`
2. **Ajouter la configuration** dans `QUEUE_CONFIGS`
3. **Créer l'API** dans `app/api/tools/[tool]/route.ts`
4. **Développer l'interface** dans `app/tools/[tool]/page.tsx`
5. **Mettre à jour la base** avec les nouvelles catégories

### Modifier la Queue
1. **Configuration** : Ajuster les limites dans `QUEUE_CONFIGS`
2. **Rate Limiting** : Modifier les délais dans `canUserMakeRequest`
3. **Timeout** : Ajuster les timeouts par type de tâche
4. **Retry Logic** : Configurer les tentatives de retry

### Debugging
1. **Activer les logs** dans la classe TaskQueue
2. **Vérifier le stockage** des tâches en mémoire
3. **Monitorer les timeouts** et les erreurs
4. **Analyser les performances** des exécuteurs

## 🔄 Cycle de Vie d'une Tâche

1. **Création** : Utilisateur soumet une requête
2. **Validation** : Vérification rate limiting + données
3. **Queue** : Ajout à la file d'attente
4. **Exécution** : Traitement par l'exécuteur approprié
5. **Résultats** : Stockage et retour à l'utilisateur
6. **Nettoyage** : Suppression après 24h

## 🎯 Points d'Attention pour l'IA

### Problèmes Récurrents
- **Tâches non trouvées** : Vérifier le stockage en Map
- **Timeouts** : Ajuster selon la complexité des outils
- **Rate limiting** : Équilibrer performance et protection
- **Parsing** : Vérifier les expressions régulières

### Bonnes Pratiques
- Toujours ajouter des logs de debug
- Tester les timeouts et les cas d'erreur
- Valider les données d'entrée
- Documenter les nouvelles fonctionnalités

### Architecture
- Respecter la séparation des responsabilités
- Utiliser les types TypeScript
- Suivre les conventions de nommage
- Maintenir la cohérence du design system

---

Cette documentation complète devrait fournir à votre assistant IA toutes les informations nécessaires pour comprendre, maintenir et développer le projet aOSINT efficacement. 