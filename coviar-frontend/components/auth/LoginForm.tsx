// RUTA: coviar-frontend/components/auth/LoginForm.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoginForm } from '@/lib/auth/hooks'

export function LoginForm() {
  const { formData, handleChange, handleSubmit, isLoading, error } = useLoginForm()

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
        <p className="text-gray-500">Accede a tu cuenta Coviar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-blue-600 hover:underline">
          Regístrate aquí
        </Link>
      </div>

      <div className="text-center text-sm">
        <Link href="/recuperar-contrasena" className="text-gray-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  )
}
