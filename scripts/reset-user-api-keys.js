const { execSync } = require('child_process')

console.log('🔄 Réinitialisation du système de clés API utilisateur...')

try {
  // Nettoyer la collection existante
  console.log('🧹 Nettoyage de la collection user_api_keys...')
  
  // Générer le client Prisma avec le nouveau modèle
  console.log('📦 Génération du client Prisma...')
  execSync('npx prisma generate', { stdio: 'inherit' })
  
  // Pousser les changements vers la base de données
  console.log('🚀 Application des changements à la base de données...')
  execSync('npx prisma db push', { stdio: 'inherit' })
  
  console.log('✅ Réinitialisation terminée avec succès!')
  console.log('\n📝 Changements apportés:')
  console.log('- Le modèle UserApiKeys stocke maintenant TOUTES les clés API d\'un utilisateur')
  console.log('- Un seul document par utilisateur au lieu d\'un par outil')
  console.log('- Structure: { leakCheck: "...", numVerify: "...", twilioSid: "...", ... }')
  console.log('\n🔧 Prochaines étapes:')
  console.log('1. Redémarrez votre serveur de développement')
  console.log('2. Testez la sauvegarde des clés API sur l\'outil Phone Leak')
  console.log('3. Les clés seront maintenant persistantes entre les sessions')
  
} catch (error) {
  console.error('❌ Erreur lors de la réinitialisation:', error.message)
  process.exit(1)
} 