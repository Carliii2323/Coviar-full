import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function HistorialPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Historial de Evaluaciones</h1>
        <p className="text-muted-foreground">Visualiza tus evaluaciones anteriores</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones Realizadas</CardTitle>
          <CardDescription>Lista de todas tus autoevaluaciones</CardDescription>
        </CardHeader>
        <CardContent>
          {!assessments || assessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tienes evaluaciones registradas todavía</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{new Date(assessment.created_at).toLocaleDateString("es-AR")}</TableCell>
                    <TableCell>{new Date(assessment.updated_at).toLocaleDateString("es-AR")}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assessment.is_completed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {assessment.is_completed ? "Completada" : "En Progreso"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
