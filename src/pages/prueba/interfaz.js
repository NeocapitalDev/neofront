"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
export default function Interfaz() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedAmount, setSelectedAmount] = useState("10k")

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:1337/api/categories?populate=*", {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        })
        if (!response.ok) {
          throw new Error("Error al obtener los productos")
        }
        const data = await response.json()
        setProducts(data.data)
        // Establecer selecciones iniciales
        if (data.data.length > 0) {
          setSelectedPlan(data.data[0].id)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])


  // Encontrar las subcategorías del plan seleccionado
  // const currentSubcategories = products.find((p) => p.id === selectedPlan)?.subcategories || []

  const amounts = ["5K", "10K", "25K", "50K", "100K"]

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Plan Selection */}
        <div className="flex justify-center gap-2 flex-wrap">
          {products.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "px-6 py-2 rounded-full transition-all",
                selectedPlan === plan.id
                  ? "bg-yellow-400 text-black font-bold"
                  : "bg-zinc-900 text-white hover:bg-zinc-800",
              )}
            >
              {plan.name}
            </button>
          ))}
        </div>

        {/* Subcategory Selection */}
        <div className="flex justify-center gap-2 flex-wrap">
          {products
            .find((p) => p.id === selectedPlan)
            ?.subcategories.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "px-6 py-2 rounded-full transition-all flex items-center gap-2",
                  selectedType === type.id
                    ? "bg-yellow-400 text-black font-bold"
                    : "bg-zinc-900 text-white hover:bg-zinc-800",
                )}
              >
                {type.name}
                <Badge variant="secondary" className="bg-red-500 text-white">
                  Limited time
                </Badge>
              </button>
            ))}
        </div>

        {/* Amount Selection */}
        <div className="flex justify-center gap-2 flex-wrap">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(amount)}
              className={cn(
                "px-6 py-2 rounded-full transition-all",
                selectedAmount === amount
                  ? "bg-yellow-400 text-black font-bold"
                  : "bg-zinc-900 text-white hover:bg-zinc-800",
              )}
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Trading Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {["Student", "Practitioner", "Master"].map((level) => (
            <Card key={level} className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400">Evaluation Stage</CardTitle>
                <h3 className="text-2xl font-bold">{level}</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Minimum Trading Days</span>
                  <span className="font-bold">3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Maximum Daily Loss</span>
                  <span className="font-bold">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Maximum Loss</span>
                  <span className="font-bold">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Profit Target</span>
                  <span className="font-bold">{level === "Student" ? "$800 (8%)" : "$500 (5%)"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Leverage</span>
                  <span className="font-bold">1:100</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

