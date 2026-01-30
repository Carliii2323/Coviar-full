"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export default function ConfiguracionPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    admin_first_name: "Juan",
    admin_last_name: "Pérez",
    admin_role: "Gerente General",
    admin_phone: "+54 261 123-4567",
    email: "contacto@bodega.com",
    razon_social: "Bodega Los Andes S.A.",
    nombre_fantasia: "Viñedos del Valle",
    cuit: "20-12345678-9",
    bodega_inv: "BOD-001",
    vinedo_inv: "VIN-001",
    provincia: "Mendoza",
    departamento: "Maipú",
    distrito: "Coquimbito",
    litros_vino_rango: "10,000 - 50,000 litros",
    actividades: ["Elaboración de vinos", "Enoturismo", "Exportación", "Venta al público"]
  })

  const [newActividad, setNewActividad] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddActividad = () => {
    if (newActividad.trim()) {
      setFormData(prev => ({
        ...prev,
        actividades: [...prev.actividades, newActividad.trim()]
      }))
      setNewActividad("")
    }
  }

  const handleRemoveActividad = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // TODO: Descomenta esto cuando tu API de Go esté lista
    // try {
    //   const response = await fetch(`http://localhost:8080/api/profiles/${userId}`, {
    //     method: 'PUT',
    //     headers: { 
    //       'Content-Type': 'application/json',
    //     },
    //     credentials: 'include',
    //     body: JSON.stringify({
    //       ...formData,
    //       actividades: JSON.stringify(formData.actividades)
    //     })
    //   })
    //   
    //   if (response.ok) {
    //     setIsEditing(false)
    //     alert("Cambios guardados exitosamente")
    //   } else {
    //     alert("Error al guardar los cambios")
    //   }
    // } catch (error) {
    //   console.error('Error saving:', error)
    //   alert("Error de conexión")
    // } finally {
    //   setIsSaving(false)
    // }
    
    // SIMULACIÓN - Elimina esto cuando uses la API real
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      alert("Cambios guardados exitosamente (simulación)")
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            Editar Información
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Administrador</CardTitle>
          <CardDescription>Datos de la persona responsable de la cuenta</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="admin_first_name">Nombre</Label>
            {isEditing ? (
              <Input
                id="admin_first_name"
                value={formData.admin_first_name}
                onChange={(e) => handleInputChange("admin_first_name", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.admin_first_name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="admin_last_name">Apellido</Label>
            {isEditing ? (
              <Input
                id="admin_last_name"
                value={formData.admin_last_name}
                onChange={(e) => handleInputChange("admin_last_name", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.admin_last_name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="admin_role">Rol</Label>
            {isEditing ? (
              <Input
                id="admin_role"
                value={formData.admin_role}
                onChange={(e) => handleInputChange("admin_role", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.admin_role}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="admin_phone">Celular</Label>
            {isEditing ? (
              <Input
                id="admin_phone"
                value={formData.admin_phone}
                onChange={(e) => handleInputChange("admin_phone", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.admin_phone}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Bodega/Viñedo</CardTitle>
          <CardDescription>Datos registrados de tu establecimiento</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="razon_social">Razón Social</Label>
            {isEditing ? (
              <Input
                id="razon_social"
                value={formData.razon_social}
                onChange={(e) => handleInputChange("razon_social", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.razon_social}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="nombre_fantasia">Nombre de Fantasía</Label>
            {isEditing ? (
              <Input
                id="nombre_fantasia"
                value={formData.nombre_fantasia}
                onChange={(e) => handleInputChange("nombre_fantasia", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.nombre_fantasia}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="cuit">CUIT</Label>
            {isEditing ? (
              <Input
                id="cuit"
                value={formData.cuit}
                onChange={(e) => handleInputChange("cuit", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.cuit}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="bodega_inv">Nº Bodega INV</Label>
            {isEditing ? (
              <Input
                id="bodega_inv"
                value={formData.bodega_inv}
                onChange={(e) => handleInputChange("bodega_inv", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.bodega_inv}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="vinedo_inv">Nº Viñedo INV</Label>
            {isEditing ? (
              <Input
                id="vinedo_inv"
                value={formData.vinedo_inv}
                onChange={(e) => handleInputChange("vinedo_inv", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.vinedo_inv}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="provincia">Provincia</Label>
            {isEditing ? (
              <Input
                id="provincia"
                value={formData.provincia}
                onChange={(e) => handleInputChange("provincia", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.provincia}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="departamento">Departamento</Label>
            {isEditing ? (
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => handleInputChange("departamento", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.departamento}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="distrito">Distrito</Label>
            {isEditing ? (
              <Input
                id="distrito"
                value={formData.distrito}
                onChange={(e) => handleInputChange("distrito", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.distrito}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="litros_vino_rango">Litros de Vino</Label>
            {isEditing ? (
              <Input
                id="litros_vino_rango"
                value={formData.litros_vino_rango}
                onChange={(e) => handleInputChange("litros_vino_rango", e.target.value)}
                className="mt-2"
              />
            ) : (
              <p className="font-medium mt-2">{formData.litros_vino_rango}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Label>Actividades</Label>
            {isEditing ? (
              <div className="space-y-3 mt-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar nueva actividad"
                    value={newActividad}
                    onChange={(e) => setNewActividad(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddActividad()}
                  />
                  <Button type="button" onClick={handleAddActividad}>
                    Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.actividades.map((act, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground border border-border"
                    >
                      {act}
                      <button
                        onClick={() => handleRemoveActividad(index)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.actividades.map((act, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {act}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/*import { createClient } from "@/lib/supabase/server"
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
*/