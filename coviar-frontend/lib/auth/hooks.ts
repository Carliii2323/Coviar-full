// RUTA: coviar-frontend/lib/auth/hooks.ts

'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as authApi from './api'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authApi.login({ email, password })
        const user = response.data.usuario
        console.log('Login exitoso:', user)
        
        // Guardar usuario en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('usuario', JSON.stringify(user))
        }
        
        // Redirigir al dashboard
        router.push('/dashboard')
        return user
      } catch (err: any) {
        const errorMessage = err.message || 'Error al iniciar sesión'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const handleRegister = useCallback(
    async (data: authApi.RegisterData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await authApi.register(data)
        const user = response.data.usuario
        console.log('Registro exitoso:', user)
        
        // Guardar usuario en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('usuario', JSON.stringify(user))
        }
        
        // Redirigir al dashboard
        router.push('/dashboard')
        return user
      } catch (err: any) {
        const errorMessage = err.message || 'Error al registrar'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  const handleLogout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('📤 Iniciando logout...')
      
      // 1. Llamar a la API route de Next.js para logout
      const response = await authApi.logout()
      console.log('✅ Logout exitoso en servidor')
      
      // 2. Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('usuario')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        console.log('✅ localStorage limpiado')
      }
      
      // 3. Esperar un poco para que las cookies se eliminen completamente
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 4. Redirigir a login con parámetro logout - usar router.push en lugar de location.href
      if (typeof window !== 'undefined') {
        console.log('🔄 Redirigiendo a /login')
        // Invalidar el caché de Next.js para forzar una recarga completa
        router.replace('/login?logout=true')
        
        // Si el push falla por algún motivo, fallback a location.href
        setTimeout(() => {
          window.location.href = '/login?logout=true'
        }, 1000)
      }
    } catch (err: any) {
      console.error('❌ Error en logout:', err)
      setError(err.message || 'Error al cerrar sesión')
      
      // Aunque haya error, limpiar y redirigir
      if (typeof window !== 'undefined') {
        localStorage.removeItem('usuario')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        
        // Esperar un poco antes de redirigir
        setTimeout(() => {
          window.location.href = '/login?logout=true'
        }, 500)
      }
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    isLoading,
    error,
  }
}

export function useLoginForm() {
  const { handleLogin, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin(formData.email, formData.password)
  }

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
  }
}

export function useRegisterForm() {
  const { handleRegister, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleRegister({
      ...formData,
      rol: 'bodega',
    })
  }

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
  }
}
