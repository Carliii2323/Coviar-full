// RUTA: coviar-frontend/components/auth/LogoutButton.tsx

'use client'

import { useAuth } from '@/lib/auth/hooks'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const { handleLogout, isLoading } = useAuth()

  const handleClick = async () => {
    try {
      await handleLogout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
    </Button>
  )
}
