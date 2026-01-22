// RUTA: coviar-frontend/middleware.ts

import { NextRequest, NextResponse } from 'next/server'

function isTokenValid(token: string | undefined): boolean {
  // Si no hay token o está explícitamente expirado
  if (!token || token === 'expired' || token === '') {
    console.log('❌ Token no válido (no existe, está vacío o expirado)')
    return false
  }
  
  try {
    // Decodificar el JWT (sin verificar la firma, solo el payload)
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('❌ Token formato inválido - no tiene 3 partes')
      return false
    }
    
    // Decodificar el payload (segunda parte del JWT)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )
    
    console.log('🔍 Token payload:', { exp: payload.exp, iat: payload.iat })
    
    // Verificar si el token está expirado
    // exp está en segundos, Date.now() en milisegundos
    const expirationTimeMs = payload.exp * 1000
    const nowMs = Date.now()
    
    if (expirationTimeMs < nowMs) {
      console.log(`❌ Token expirado: ${new Date(expirationTimeMs)} < ${new Date(nowMs)}`)
      return false
    }
    
    console.log(`✅ Token válido hasta: ${new Date(expirationTimeMs)}`)
    return true
  } catch (error) {
    console.error('⚠️ Error decodificando token:', error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const pathname = request.nextUrl.pathname
  
  console.log(`🔍 Middleware: ${pathname} - Token: ${token ? token.substring(0, 20) + '...' : 'sin token'}`)

  // Si el usuario intenta acceder a /login o /registro y tiene logout param
  if (
    (pathname === '/login' || pathname === '/registro') &&
    request.nextUrl.searchParams.get('logout') === 'true'
  ) {
    console.log('✅ Logout param detected, allowing access to login page')
    return NextResponse.next()
  }

  // Si tiene token válido y va a login/registro, redirigir a dashboard
  if (
    (pathname === '/login' || pathname === '/registro') &&
    isTokenValid(token)
  ) {
    console.log('🔄 Token válido en login/registro, redirigiendo a dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si intenta acceder a ruta protegida sin token válido, redirigir a login
  const protectedPaths = ['/dashboard', '/configuracion', '/historial', '/autoevaluacion']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath && !isTokenValid(token)) {
    console.log('🚫 Ruta protegida sin token válido, redirigiendo a login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/registro', '/dashboard/:path*', '/configuracion/:path*', '/historial/:path*', '/autoevaluacion/:path*'],
}
