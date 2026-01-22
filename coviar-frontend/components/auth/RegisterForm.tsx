// RUTA: coviar-frontend/components/auth/RegisterForm.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRegisterForm } from '@/lib/auth/hooks'

export function RegisterForm() {
  const { formData, handleChange, handleSubmit, isLoading, error } = useRegisterForm()

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Crear Cuenta</h1>
        <p className="text-gray-500">Únete a la comunidad Coviar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Juan"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="apellido" className="text-sm font-medium">
              Apellido
            </label>
            <Input
              id="apellido"
              type="text"
              name="apellido"
              placeholder="Pérez"
              value={formData.apellido}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

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
          <p className="text-xs text-gray-500">
            Mínimo 6 caracteres
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Crear Cuenta'}
        </Button>
      </form>

      <div className="text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  )
}
