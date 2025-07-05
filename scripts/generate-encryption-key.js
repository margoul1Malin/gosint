const crypto = require('crypto')

// Générer une clé de chiffrement sécurisée de 32 caractères
const encryptionKey = crypto.randomBytes(32).toString('hex')

console.log('🔐 Clé de chiffrement générée pour les clés API utilisateur:')
console.log('')
console.log(`API_KEYS_ENCRYPTION_KEY=${encryptionKey}`)
console.log('')
console.log('⚠️  IMPORTANT: Ajoutez cette ligne à votre fichier .env et gardez-la secrète!')
console.log('⚠️  Ne partagez jamais cette clé et ne la commitez pas dans Git!')
console.log('')
console.log('📝 Étapes suivantes:')
console.log('1. Copiez la ligne ci-dessus dans votre fichier .env')
console.log('2. Exécutez: node scripts/setup-user-api-keys.js')
console.log('3. Redémarrez votre serveur de développement') 