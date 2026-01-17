import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function RegistroExitosoPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Registro Exitoso</CardTitle>
          <CardDescription>Por favor, verifica tu correo electrónico</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Hemos enviado un correo de confirmación a tu dirección de email. Por favor, revisa tu bandeja de entrada y
            haz clic en el enlace de confirmación para activar tu cuenta.
          </p>
          <Link href="/login" className="block">
            <Button className="w-full">Ir a Iniciar Sesión</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
