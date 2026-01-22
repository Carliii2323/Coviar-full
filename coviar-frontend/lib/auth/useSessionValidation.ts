// RUTA: coviar-frontend/lib/auth/useSessionValidation.ts

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import * as authApi from './api'

const PROTECTED_PATHS = ['/dashboard', '/configuracion', '/historial', '/autoevaluacion']

export function useSessionValidation() {
  const router = useRouter()
  const pathname = usePathname()
  
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))

  useEffect(() => {
    if (!isProtectedPath) return

    // Verificar si la sesión es válida
    const validateSession = async () => {
      try {
        const user = await authApi.getCurrentUser()
        
        if (!user) {
          // No hay sesión válida, redirigir a login
          console.log('❌ Sesión inválida, redirigiendo a /login')
          router.push('/login')
        } else {
          // Sesión válida
          console.log('✅ Sesión válida:', user.email)
        }
      } catch (error) {
        console.error('Error validando sesión:', error)
        router.push('/login')
      }
    }

    validateSession()
  }, [isProtectedPath, pathname, router])
}
