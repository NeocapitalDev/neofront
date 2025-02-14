"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

export default function RadialChartComponent({ wins, losses }) {
  const total = wins + losses;
  
  const winPercentage = total ? (wins / total) * 100 : 0;
  const lossPercentage = total ? (losses / total) * 100 : 0;

  const computedWinAngle = (winPercentage * 350) / 100;
  const computedLossAngle = (lossPercentage * 350) / 100;

  const winChartData = [{ name: "Win Rate", value: winPercentage, fill: "hsl(var(--chart-2))" }];
  const lossChartData = [{ name: "Loss Rate", value: lossPercentage, fill: "hsl(var(--chart-5))" }];

  return (
    <>
      <h2 className="text-lg font-semibold py-6">Win/Loss Rates</h2>
      <Card className="flex flex-col p-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Win Rates */}
          <div className="flex flex-col items-center">
            <CardHeader className="items-center pb-0">
              <CardTitle>Win Rates</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <RadialBarChart
                data={winChartData}
                startAngle={0}
                endAngle={computedWinAngle}
                innerRadius={50}
                outerRadius={70}
                width={200}
                height={200}
              >
                <PolarGrid gridType="circle" radialLines={false} stroke="none" polarRadius={[58, 46]} />
                <RadialBar dataKey="value" cornerRadius={5} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) =>
                      viewBox?.cx && viewBox?.cy ? (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-xl font-bold"
                        >
                          {winPercentage.toFixed(0)}%
                        </text>
                      ) : null
                    }
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </CardContent>
          </div>

          {/* Loss Rates */}
          <div className="flex flex-col items-center">
            <CardHeader className="items-center pb-0">
              <CardTitle>Loss Rates</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <RadialBarChart
                data={lossChartData}
                startAngle={0}
                endAngle={computedLossAngle}
                innerRadius={50}
                outerRadius={70}
                width={200}
                height={200}
              >
                <PolarGrid gridType="circle" radialLines={false} stroke="none" polarRadius={[58, 46]} />
                <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} cornerRadius={5} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) =>
                      viewBox?.cx && viewBox?.cy ? (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-xl font-bold"
                        >
                          {lossPercentage.toFixed(0)}%
                        </text>
                      ) : null
                    }
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </CardContent>
          </div>
        </div>
      </Card>
    </>
  );
}
