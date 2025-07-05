import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validation basique
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Validation du format email
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { message: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Validation du format téléphone (optionnel)
    if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { message: 'Format de téléphone invalide' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          phone ? { phone } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email ou ce téléphone existe déjà' },
        { status: 409 }
      )
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'))

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null, // Optionnel
        password: hashedPassword,
        role: 'USER',
        status: 'ACTIVE'
      }
    })

    // Enregistrer l'activité de création de compte
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'ACCOUNT_CREATED',
        details: {
          method: 'email',
          identifier: email
        }
      }
    })

    // Retourner la réponse sans le mot de passe
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { message: 'Une erreur interne est survenue' },
      { status: 500 }
    )
  }
} 