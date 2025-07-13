const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listOSINTTools() {
  try {
    console.log('🔍 Récupération de tous les outils OSINT...\n')

    // Récupérer tous les outils avec leurs catégories
    const tools = await prisma.tool.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Récupérer toutes les catégories
    const categories = await prisma.category.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Créer un map des catégories pour faciliter la recherche
    const categoryMap = new Map()
    categories.forEach(cat => {
      categoryMap.set(cat.id, cat)
    })

    console.log(`📊 Total: ${tools.length} outils trouvés\n`)

    // Grouper par catégorie
    const toolsByCategory = new Map()

    tools.forEach(tool => {
      tool.categoryIds.forEach(categoryId => {
        const category = categoryMap.get(categoryId)
        if (category) {
          if (!toolsByCategory.has(category.name)) {
            toolsByCategory.set(category.name, [])
          }
          toolsByCategory.get(category.name).push(tool)
        }
      })
    })

    // Afficher par catégorie
    for (const [categoryName, categoryTools] of toolsByCategory.entries()) {
      console.log(`\n🏷️  ${categoryName} (${categoryTools.length} outils):`)
      console.log('=' .repeat(50))
      
      categoryTools.forEach((tool, index) => {
        const status = tool.isActive ? '✅' : '❌'
        const premium = tool.isPremium ? '💎' : '🆓'
        const difficulty = getDifficultyIcon(tool.difficulty)
        
        console.log(`${index + 1}. ${status} ${premium} ${difficulty} ${tool.name}`)
        console.log(`   📝 ${tool.description}`)
        console.log(`   🔗 /tools/${tool.slug}`)
        console.log(`   📅 Créé: ${new Date(tool.createdAt).toLocaleDateString('fr-FR')}`)
        console.log('')
      })
    }

    // Outils sans catégorie
    const toolsWithoutCategory = tools.filter(tool => tool.categoryIds.length === 0)
    if (toolsWithoutCategory.length > 0) {
      console.log(`\n🔍 Outils sans catégorie (${toolsWithoutCategory.length}):`)
      console.log('=' .repeat(50))
      
      toolsWithoutCategory.forEach((tool, index) => {
        const status = tool.isActive ? '✅' : '❌'
        const premium = tool.isPremium ? '💎' : '🆓'
        const difficulty = getDifficultyIcon(tool.difficulty)
        
        console.log(`${index + 1}. ${status} ${premium} ${difficulty} ${tool.name}`)
        console.log(`   📝 ${tool.description}`)
        console.log(`   🔗 /tools/${tool.slug}`)
        console.log('')
      })
    }

    // Statistiques globales
    console.log('\n📈 STATISTIQUES GLOBALES:')
    console.log('=' .repeat(50))
    console.log(`📊 Total outils: ${tools.length}`)
    console.log(`✅ Actifs: ${tools.filter(t => t.isActive).length}`)
    console.log(`❌ Inactifs: ${tools.filter(t => !t.isActive).length}`)
    console.log(`💎 Premium: ${tools.filter(t => t.isPremium).length}`)
    console.log(`🆓 Gratuits: ${tools.filter(t => !t.isPremium).length}`)
    console.log(`🏷️  Catégories: ${categories.length}`)
    
    // Répartition par difficulté
    const difficultyStats = tools.reduce((acc, tool) => {
      acc[tool.difficulty] = (acc[tool.difficulty] || 0) + 1
      return acc
    }, {})
    
    console.log('\n🎯 Répartition par difficulté:')
    Object.entries(difficultyStats).forEach(([difficulty, count]) => {
      console.log(`   ${getDifficultyIcon(difficulty)} ${difficulty}: ${count}`)
    })

    // Liste simple pour copier-coller
    console.log('\n📋 LISTE SIMPLE (pour copier-coller):')
    console.log('=' .repeat(50))
    tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} (${tool.slug})`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des outils:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getDifficultyIcon(difficulty) {
  switch (difficulty) {
    case 'BEGINNER': return '🟢'
    case 'INTERMEDIATE': return '🟡'
    case 'ADVANCED': return '🟠'
    case 'EXPERT': return '🔴'
    default: return '⚪'
  }
}

// Exécuter le script
listOSINTTools().catch(console.error) 