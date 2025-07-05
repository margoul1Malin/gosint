import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Fonction pour vérifier un nom d'utilisateur sur différentes sources
async function checkUsernameLeaks(username: string) {
  const results = []
  
  // Simulation de vérification sur différentes sources
  // En production, vous pourriez utiliser des APIs comme:
  // - Sherlock pour la recherche de noms d'utilisateur
  // - WhatsMyName pour la vérification de présence
  // - Ou d'autres bases de données de fuites
  
  // Pour les tests, on utilise des données d'exemple
  const testUsernames = [
    'admin',
    'test',
    'user',
    'demo',
    'root',
    'administrator'
  ]
  
  if (testUsernames.includes(username.toLowerCase())) {
    // Simulation de résultats pour les tests
    results.push({
      source: 'LinkedIn Data Breach 2012',
      breachDate: '2012-06-05',
      description: 'En juin 2012, LinkedIn a subi une fuite de données qui a exposé 6,5 millions de mots de passe hachés.',
      dataClasses: ['Email addresses', 'Passwords', 'Usernames'],
      verified: true,
      fabricated: false,
      sensitive: false,
      retired: false,
      spamList: false
    })
    
    results.push({
      source: 'Adobe Data Breach 2013',
      breachDate: '2013-10-04',
      description: 'En octobre 2013, Adobe a subi une fuite de données massive affectant 38 millions d\'utilisateurs.',
      dataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames'],
      verified: true,
      fabricated: false,
      sensitive: false,
      retired: false,
      spamList: false
    })
  }
  
  // Vérification sur des plateformes sociales (simulation)
  const socialPlatforms = [
    'Twitter',
    'Instagram', 
    'Facebook',
    'GitHub',
    'Reddit',
    'TikTok',
    'YouTube',
    'Twitch'
  ]
  
  // Simulation de présence sur les plateformes
  if (username.length >= 3 && username.length <= 15) {
    const randomPlatforms = socialPlatforms
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1)
    
    for (const platform of randomPlatforms) {
      results.push({
        source: `${platform} Account Found`,
        breachDate: '2024-01-01',
        description: `Compte trouvé sur ${platform} avec ce nom d'utilisateur`,
        dataClasses: ['Public profile', 'Username'],
        verified: false,
        fabricated: false,
        sensitive: false,
        retired: false,
        spamList: false
      })
    }
  }
  
  return results
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { username } = await request.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur requis' },
        { status: 400 }
      )
    }

    // Validation du nom d'utilisateur
    if (username.length < 2) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur trop court' },
        { status: 400 }
      )
    }

    if (username.length > 50) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur trop long' },
        { status: 400 }
      )
    }

    // Caractères autorisés (lettres, chiffres, tirets, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur contient des caractères invalides' },
        { status: 400 }
      )
    }

    // Vérification des fuites
    const results = await checkUsernameLeaks(username)

    return NextResponse.json({
      results,
      count: results.length,
      username: username
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du nom d\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 