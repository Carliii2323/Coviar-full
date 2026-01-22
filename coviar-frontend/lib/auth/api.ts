// RUTA: coviar-frontend/lib/auth/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  nombre: string
  apellido: string
  rol?: string
}

export interface Usuario {
  idUsuario: number
  email: string
  nombre: string
  apellido: string
  rol: string
  activo: boolean
  fecha_registro: string
}

export interface AuthResponse {
  success: boolean
  data: {
    usuario: Usuario
    message: string
  }
}

// Registrar nuevo usuario
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    credentials: 'include', // ← IMPORTANTE: envía y recibe cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.data?.message || 'Error al registrar')
  }

  return response.json()
}

// Iniciar sesión
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include', // ← IMPORTANTE: envía y recibe cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.data?.message || 'Credenciales inválidas')
  }

  return response.json()
}

// Cerrar sesión
export async function logout(): Promise<void> {
  // Usar la API route de Next.js como intermediaria para eliminar cookies del servidor
  const response = await fetch('/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Error al cerrar sesión')
  }
}

// Obtener usuario actual (verificar autenticación)
export async function getCurrentUser(): Promise<Usuario | null> {
  try {
    const response = await fetch(`${API_URL}/api/usuarios/me`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      return null // No autenticado
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    return null
  }
}
