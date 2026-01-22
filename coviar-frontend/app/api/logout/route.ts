// RUTA: coviar-frontend/app/api/logout/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    
    console.log('🔐 API Route /logout - Iniciando logout...')
    
    // 1. Llamar al backend para logout
    try {
      const cookieHeader = request.headers.get('cookie') || ''
      const backendResponse = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
      })
      
      if (!backendResponse.ok) {
        console.error('⚠️ Error en backend logout:', backendResponse.status)
      } else {
        console.log('✅ Backend logout exitoso')
      }
    } catch (err) {
      console.error('⚠️ Error llamando backend:', err)
      // Continuamos aunque falle el backend
    }

    // 2. Crear respuesta con headers Set-Cookie para eliminar cookies
    const response = new NextResponse(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    // 3. Eliminar cookies usando Set-Cookie con MaxAge=0
    // Nota: Las cookies se configuran tanto en el backend como aquí en Next.js
    response.cookies.set({
      name: 'auth_token',
      value: '',
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    })
    
    response.cookies.set({
      name: 'refresh_token',
      value: '',
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax'
    })
    
    console.log('✅ Cookies eliminadas correctamente')
    
    return response
  } catch (error) {
    console.error('❌ Error en logout API:', error)
    return NextResponse.json(
      { success: false, message: 'Error during logout' },
      { status: 500 }
    )
  }
}
