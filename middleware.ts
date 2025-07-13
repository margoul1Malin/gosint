import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Pages publiques accessibles sans authentification
  const publicPages = [
    '/',
    '/auth/signin',
    '/auth/signup'
  ]
  
  // Routes et fichiers système à exclure
  const systemRoutes = [
    '/api/auth/',
    '/_next/',
    '/favicon.ico',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/',
    '/browserconfig.xml'
  ]
  
  // Routes API publiques accessibles sans authentification
  const publicApiRoutes = [
    '/api/categories',
    '/api/categories/',
    '/api/tools/',
    '/api/contact',
    '/api/test-auth'
  ]
  
  // Vérifier si c'est une route système
  const isSystemRoute = systemRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (isSystemRoute) {
    return NextResponse.next()
  }
  
  // Vérifier si c'est une route API publique
  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (isPublicApiRoute) {
    return NextResponse.next()
  }
  
  // Vérifier si la page est publique
  const isPublicPage = publicPages.includes(pathname)
  
  if (isPublicPage) {
    return NextResponse.next()
  }

  // Pour toutes les autres pages, vérifier si l'utilisateur est connecté
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.JWT_SECRET 
    })
    
    console.log(`Middleware - Page: ${pathname}, Token présent: ${!!token}`)
    
    if (!token) {
      console.log(`Middleware - Redirection vers /auth/signin pour ${pathname}`)
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    console.log(`Middleware - Accès autorisé à ${pathname}`)
    return NextResponse.next()
  } catch (error) {
    console.error('Erreur middleware:', error)
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - manifest files
     * - well-known files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|json)$).*)',
  ],
} 