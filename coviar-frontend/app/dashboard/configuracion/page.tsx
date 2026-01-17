import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Administrador</CardTitle>
          <CardDescription>Datos de la persona responsable de la cuenta</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{profile?.admin_first_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Apellido</p>
            <p className="font-medium">{profile?.admin_last_name}</p>
          </div>
          {profile?.admin_role && (
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="font-medium">{profile.admin_role}</p>
            </div>
          )}
          {profile?.admin_phone && (
            <div>
              <p className="text-sm text-muted-foreground">Celular</p>
              <p className="font-medium">{profile.admin_phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Bodega/Viñedo</CardTitle>
          <CardDescription>Datos registrados de tu establecimiento</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Razón Social</p>
            <p className="font-medium">{profile?.razon_social}</p>
          </div>
          {profile?.nombre_fantasia && (
            <div>
              <p className="text-sm text-muted-foreground">Nombre de Fantasía</p>
              <p className="font-medium">{profile.nombre_fantasia}</p>
            </div>
          )}
          {profile?.cuit && (
            <div>
              <p className="text-sm text-muted-foreground">CUIT</p>
              <p className="font-medium">{profile.cuit}</p>
            </div>
          )}
          {profile?.bodega_inv && (
            <div>
              <p className="text-sm text-muted-foreground">Nº Bodega INV</p>
              <p className="font-medium">{profile.bodega_inv}</p>
            </div>
          )}
          {profile?.vinedo_inv && (
            <div>
              <p className="text-sm text-muted-foreground">Nº Viñedo INV</p>
              <p className="font-medium">{profile.vinedo_inv}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Provincia</p>
            <p className="font-medium">{profile?.provincia}</p>
          </div>
          {profile?.departamento && (
            <div>
              <p className="text-sm text-muted-foreground">Departamento</p>
              <p className="font-medium">{profile.departamento}</p>
            </div>
          )}
          {profile?.distrito && (
            <div>
              <p className="text-sm text-muted-foreground">Distrito</p>
              <p className="font-medium">{profile.distrito}</p>
            </div>
          )}
          {profile?.litros_vino_rango && (
            <div>
              <p className="text-sm text-muted-foreground">Litros de Vino</p>
              <p className="font-medium">{profile.litros_vino_rango}</p>
            </div>
          )}
          {profile?.actividades && Array.isArray(JSON.parse(profile.actividades as string)) && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Actividades</p>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(profile.actividades as string).map((act: string) => (
                  <span
                    key={act}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
