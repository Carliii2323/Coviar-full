"use client"

import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}