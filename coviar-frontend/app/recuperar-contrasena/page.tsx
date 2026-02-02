"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    console.log('🔄 Enviando solicitud de recuperación...')
    console.log('📧 Email:', email)
    console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL)

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/request-password-reset`
      console.log('📍 URL completa:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('📡 Response status:', response.status)
      
      const data = await response.json()
      console.log('📦 Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud')
      }

      if (data.success) {
        setMessage(data.message || "Se ha enviado un correo con instrucciones para recuperar tu contraseña")
        setEmail("")
      } else {
        setError(data.message || "Ocurrió un error al procesar tu solicitud")
      }
    } catch (err: unknown) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message : "Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl text-center">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-center">
            Ingresa tu email para recibir instrucciones
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            {message && <div className="text-sm text-primary bg-primary/10 p-3 rounded-md">{message}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Instrucciones"}
            </Button>

            <div className="text-center text-sm">
              <a href="/login" className="text-primary hover:underline">
                Volver a Iniciar Sesión
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
