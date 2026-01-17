// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface ApiError {
  error: string
  message: string
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = data as ApiError
    throw new Error(error.message || 'Error en la petición')
  }

  return (data as ApiResponse<T>).data
}

export interface Usuario {
  idUsuario: number
  email: string
  nombre: string
  apellido: string
  rol: string
  activo: boolean
  fecha_registro: string
  ultimo_acceso?: string
}

export interface RegistroData {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: string
}

export interface LoginData {
  email: string
  password: string
}

export async function registrarUsuario(data: RegistroData): Promise<Usuario> {
  return apiRequest<Usuario>('/api/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function loginUsuario(data: LoginData): Promise<Usuario> {
  return apiRequest<Usuario>('/api/usuarios/verificar', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export default {
  registrarUsuario,
  loginUsuario,
}