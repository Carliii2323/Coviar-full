"use client"

import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

function ResetPasswordContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <ResetPasswordForm />
    </div>
  )
}

export default function ActualizarContrasenaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}