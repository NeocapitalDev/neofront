"use client"

import { useState, useEffect } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Importando los datos desde la ruta correcta
import openTradesByHour from "../metrix/data"

export default function Component() {
  // Estado para almacenar los datos del gráfico
  const [chartData, setChartData] = useState([])

  // Simulación de la obtención de datos
  useEffect(() => {
    // Contamos la cantidad de traders en el arreglo openTradesByHour
    const totalTraders = openTradesByHour.length
    const middlePoint = totalTraders / 2 // Establecer el punto medio de la gráfica

    // Mapear los datos y asignar el número de trader junto con su desplazamiento en el eje Y
    const processedData = openTradesByHour.map((item, index) => {
      const yPosition = middlePoint - index // Colocar en la mitad y mover hacia abajo o hacia arriba
      return {
        traderNumber: index, // Asignar número secuencial a cada trader (0, 1, 2, ...)
        profit: item.profit, // Beneficio
        yPosition, // Determinamos la posición Y del trader
      }
    })

    // Actualizamos el estado con los datos procesados
    setChartData(processedData)
  }, [])

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="font-normal text-black dark:text-white">Balance</CardTitle>
          <CardDescription className="text-4xl font-semibold text-black dark:text-white">$15,231.89</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ /* Add your ChartConfig properties here */ }}>
            <LineChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid horizontal={true} strokeWidth={2} vertical={false} />
              
              {/* Eje X con los números de trader */}
              <XAxis
                dataKey="traderNumber"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `Trader ${value}`} // Muestra "Trader 0", "Trader 1", etc.
              />
              
              {/* Eje Y ajustado */}
              <YAxis hide />
              
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              
              {/* Línea para 'profit' */}
              <Line
                dataKey="profit"
                type="natural"
                stroke="#FFC107"
                strokeWidth={2}
                dot={{
                  fill: "#FFC107",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
