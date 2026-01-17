"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Props {
  profile: any
  responsesCount: number
  totalScore: number
}

export default function DashboardClient({ profile, responsesCount, totalScore }: Props) {
  const totalIndicators = 59
  const progress = responsesCount ? Math.round((responsesCount / totalIndicators) * 100) : 0

  const maxPossibleScore = responsesCount ? responsesCount * 3 : 1
  const sustainabilityLevel = Math.round((totalScore / maxPossibleScore) * 100)

  let sustainabilityCategory = "No evaluado"
  let sustainabilityCategoryColor = "#94a3b8"

  if (totalScore >= 42 && totalScore <= 93) {
    sustainabilityCategory = "Nivel mínimo"
    sustainabilityCategoryColor = "#B89B5E"
  } else if (totalScore >= 94 && totalScore <= 112) {
    sustainabilityCategory = "Nivel medio"
    sustainabilityCategoryColor = "#2F4F3E"
  } else if (totalScore >= 113 && totalScore <= 126) {
    sustainabilityCategory = "Nivel alto"
    sustainabilityCategoryColor = "#6D1A1A"
  }

  const progressData = [
    { name: "Completado", value: progress, fill: "#6D1A1A" },
    { name: "Pendiente", value: 100 - progress, fill: "#FAF7F2" },
  ]

  const sustainabilityData = [
    { name: sustainabilityCategory, value: totalScore, fill: sustainabilityCategoryColor },
    { name: "Puntaje máximo", value: 126 - totalScore, fill: "#FAF7F2" },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {profile?.nombre_fantasia || profile?.razon_social}
        </h1>
        <p className="text-muted-foreground">Panel de control de sostenibilidad enoturística</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Progreso */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Autoevaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <ChartContainer config={{}} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="text-center">
                <p className="text-3xl font-bold">{progress}%</p>
                <p className="text-sm text-muted-foreground">
                  {responsesCount} de {totalIndicators} indicadores completados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Nivel de Sostenibilidad */}
        <Card>
          <CardHeader>
            <CardTitle>Nivel de Sostenibilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <ChartContainer config={{}} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sustainabilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {sustainabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: sustainabilityCategoryColor }}>
                  {sustainabilityCategory}
                </p>
                <p className="text-sm text-muted-foreground">
                  Puntaje: {totalScore} / 126
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}