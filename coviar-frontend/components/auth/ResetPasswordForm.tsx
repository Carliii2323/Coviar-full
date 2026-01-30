"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!token) {
      setError("Token inválido o expirado")
      return
    }

    setIsLoading(true)

    console.log("🔄 Actualizando contraseña...")
    console.log("🔑 Token:", token)

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`
      console.log("📍 URL:", url)

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      console.log("📡 Response status:", response.status)

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar contraseña")
      }

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(data.message || "Error al actualizar contraseña")
      }
    } catch (err: unknown) {
      console.error("❌ Error:", err)
      setError(err instanceof Error ? err.message : "Error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="bg-destructive text-destructive-foreground">
          <CardTitle className="text-2xl text-center">Token Inválido</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">El enlace es inválido o ha expirado</p>
          <Button onClick={() => router.push("/recuperar-contrasena")} className="w-full">
            Solicitar Nuevo Enlace
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl text-center">¡Contraseña Actualizada!</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Tu contraseña ha sido actualizada exitosamente</p>
          <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl text-center">Nueva Contraseña</CardTitle>
        <CardDescription className="text-primary-foreground/80 text-center">
          Ingresa tu nueva contraseña
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}