const { execSync } = require('child_process')

console.log('🔧 Configuration du système de clés API utilisateur...')

try {
  // Générer le client Prisma avec le nouveau modèle
  console.log('📦 Génération du client Prisma...')
  execSync('npx prisma generate', { stdio: 'inherit' })
  
  // Pousser les changements vers la base de données
  console.log('🚀 Application des changements à la base de données...')
  execSync('npx prisma db push', { stdio: 'inherit' })
  
  console.log('✅ Configuration terminée avec succès!')
  console.log('\n📝 Prochaines étapes:')
  console.log('1. Ajoutez API_KEYS_ENCRYPTION_KEY dans votre .env')
  console.log('2. Redémarrez votre serveur de développement')
  console.log('3. Testez l\'outil Phone Leak avec la sauvegarde des clés API')
  
} catch (error) {
  console.error('❌ Erreur lors de la configuration:', error.message)
  process.exit(1)
} 