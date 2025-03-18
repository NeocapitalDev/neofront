"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStrapiData } from "../../../services/strapiService";

export interface Challenge_products {
  id: string | number;
  name: string;
}

export interface Challenge_subcategory {
  id: string | number;
  name: string;
}

export interface Challenge_stages {
  id: string | number;
  name: string;
}

export interface Challenge_step {
  id: string | number;
  name: string;
}

export interface ChallengeRelationsStages {
  minimumTradingDays: number;
  maximumDailyLoss: number;
  maximumTotalLoss: number; // Cambiar de maximumLoss a maximumTotalLoss
  maximumLossPerTrade: number; // Añadir este campo
  profitTarget: number;
  leverage: number;
  challenge_subcategory: Challenge_subcategory;
  challenge_products: Challenge_products[];
  challenge_step: Challenge_step;
  challenge_stages: Challenge_stages[];
  documentId: string;
}

interface DetailsProps {
  prop: ChallengeRelationsStages;
  modalType: number; // 0 for view, 1 for edit, 2 for create
  onClose?: () => void;
  actualizarDatos?: () => void;
}

export default function PropDetails({
  prop,
  modalType,
  onClose,
  actualizarDatos,
}: DetailsProps) {
  const { data: productsData } = useStrapiData("challenge-products");
  const { data: subcategoriesData } = useStrapiData("challenge-subcategories");
  const { data: stagesdata } = useStrapiData("challenge-stages");
  const { data: stepsdata } = useStrapiData("challenge-steps");

  // Estado local basado en 'prop' para manipular los elementos seleccionados
  const [editableProp, setEditableProp] = useState(prop);

  // --- Filtrado de ítems disponibles ---
  const productavailable = productsData?.filter(
    (product) =>
      !editableProp.challenge_products.some((p) => p.id === product.id)
  );
  const stagesavailable = stagesdata?.filter(
    (stage) => !editableProp.challenge_stages.some((p) => p.id === stage.id)
  );
  const stepavailable =
    stepsdata?.filter((step) => step.id !== editableProp.challenge_step?.id) ||
    [];
  const subcategoriesavailable =
    subcategoriesData?.filter(
      (subcategory) => subcategory.id !== editableProp.challenge_subcategory?.id
    ) || [];

  // --- Handlers para agregar/quitar/actualizar ---
  const addProduct = (product: Challenge_products) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: [...prev.challenge_products, product],
    }));
  };

  const removeProduct = (productId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: prev.challenge_products.filter(
        (p) => p.id !== productId
      ),
    }));
  };

  const changeSubcategory = (subcategory: Challenge_subcategory | null) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_subcategory: subcategory,
    }));
  };

  const addStage = (stage: Challenge_stages) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: [...prev.challenge_stages, stage],
    }));
  };

  const removeStage = (stageId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: prev.challenge_stages.filter((p) => p.id !== stageId),
    }));
  };

  const changeCategory = (category: Challenge_step | null) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_step: category,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Convertir a número para campos numéricos
    let newValue: string | number | null = value === "" ? null : value;

    // Convertir a número para los campos que sabemos que son numéricos
    if (
      name === "minimumTradingDays" ||
      name === "maximumDailyLoss" ||
      name === "maximumTotalLoss" ||
      name === "maximumLossPerTrade" ||
      name === "profitTarget" ||
      name === "leverage"
    ) {
      newValue = value === "" ? null : parseFloat(value);
    }

    setEditableProp((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // --- Guardar cambios ---
  const handleSave = async () => {
    const toastId = toast.loading("Guardando...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations/${editableProp.documentId}/update-with-relations`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({ data: editableProp }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la actualización: ${response.statusText}`);
      }

      await response.json();
      toast.success("Se guardó correctamente.", { id: toastId });

      onClose?.();
      actualizarDatos?.();
    } catch (error) {
      toast.error("Hubo un error al guardar.", { id: toastId });
    }
  };

  // Clases para inputs oscuros y minimalistas
  const inputDarkClasses =
    "bg-zinc-800 text-yellow-100 border-none focus:ring-0 focus:outline-none p-2 rounded w-full";

  // --- Render principal ---
  return (
    <div className="bg-gradient-to-b from-black via-zinc-900 to-black h-max p-6 text-yellow-100">
      {/* Si NO es modalType=2, mostramos un layout sencillo */}
      {modalType !== 2 ? (
        <div className="space-y-6">
          <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
            <CardContent className="space-y-6 w-full p-6">
              {/* 
              Vista/Edición (modalType !== 2)
              Aquí mostramos la información asignada sin el bloque de "disponibles".
            */}
              <div className="flex gap-4 flex-wrap">
                {/* Sección de Categoría, Subcategoría y Parámetros */}
                <div className="flex-[2] min-w-[280px]">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge>Categoria</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {prop.challenge_step?.name && (
                      <Card>
                        <CardContent className="p-2 flex items-center justify-between">
                          <span className="text-xs">
                            {prop.challenge_step.name}
                          </span>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge>Subcategoria</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {prop.challenge_subcategory?.name && (
                      <Card>
                        <CardContent className="p-2 flex items-center justify-between">
                          <span className="text-xs">
                            {prop.challenge_subcategory.name}
                          </span>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Parámetros */}
                  <CardHeader className="px-0">
                    <CardTitle className="text-amber-400">
                      Parámetros y condiciones
                    </CardTitle>
                    <div className="space-y-1 mt-2 text-sm">
                      <CardDescription>
                        Días mínimos de trading: {prop.minimumTradingDays}
                      </CardDescription>
                      <CardDescription>
                        Pérdida diaria máxima: {prop.maximumDailyLoss}
                      </CardDescription>
                      <CardDescription>
                        Pérdida máxima total: {prop.maximumTotalLoss}
                      </CardDescription>
                      <CardDescription>
                        Pérdida máxima por operación: {prop.maximumLossPerTrade}
                      </CardDescription>
                      <CardDescription>
                        Objetivo de ganancia: {prop.profitTarget}
                      </CardDescription>
                      <CardDescription>
                        Apalancamiento: {prop.leverage}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </div>

                {/* Sección de Fases */}
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">Fases</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {prop.challenge_stages.map((stage) => (
                      <Card key={stage.id}>
                        <CardContent className="p-2 flex items-center justify-between">
                          <span className="text-xs">{stage.name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sección de Productos */}
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">Productos</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {prop.challenge_products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-2 flex items-center justify-between">
                          <span className="text-xs">{product.name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Si ES modalType=2, distribuimos en 2 columnas para ver asignados (izq.) y disponibles (der.)
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Columna Izquierda: Datos asignados + Parámetros + Guardar */}
          <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
            <CardContent className="space-y-6 w-full p-6">
              {/* CATEGORÍA */}
              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Categoría</Badge>
                </h3>
                {editableProp.challenge_step?.name && (
                  <Card className="bg-zinc-800 rounded-lg shadow-sm">
                    <CardContent className="p-2 flex items-center justify-between">
                      <span className="text-xs">
                        {editableProp.challenge_step.name}
                      </span>
                      {/* Botón para quitar */}
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => changeCategory(null)}
                      >
                        -
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* SUBCATEGORÍA */}
              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">
                    Subcategoría
                  </Badge>
                </h3>
                {editableProp.challenge_subcategory?.name && (
                  <Card className="bg-zinc-800 rounded-lg shadow-sm">
                    <CardContent className="p-2 flex items-center justify-between">
                      <span className="text-xs">
                        {editableProp.challenge_subcategory.name}
                      </span>
                      {/* Botón para quitar */}
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => changeSubcategory(null)}
                      >
                        -
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* FASES */}
              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Fases</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {editableProp.challenge_stages.map((stage) => (
                    <Card
                      key={stage.id}
                      className="bg-zinc-800 rounded-lg shadow-sm"
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{stage.name}</span>
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => removeStage(stage.id)}
                        >
                          -
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* PRODUCTOS */}
              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Productos</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {editableProp.challenge_products.map((product) => (
                    <Card
                      key={product.id}
                      className="bg-zinc-800 rounded-lg shadow-sm"
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{product.name}</span>
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => removeProduct(product.id)}
                        >
                          -
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* PARÁMETROS */}
              <CardHeader className="px-0">
                <CardTitle className="text-amber-400">
                  Parámetros y condiciones
                </CardTitle>
                <div className="space-y-2 mt-2 text-sm">
                  <CardDescription>
                    Días mínimos de trading:
                    <input
                      type="number"
                      name="minimumTradingDays"
                      value={editableProp.minimumTradingDays ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses + " mt-1"}
                    />
                  </CardDescription>
                  <CardDescription>
                    Pérdida diaria máxima:
                    <input
                      type="number"
                      name="maximumDailyLoss"
                      value={editableProp.maximumDailyLoss ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses + " mt-1"}
                    />
                  </CardDescription>
                  <CardDescription>
                    Pérdida máxima total:
                    <input
                      type="number"
                      name="maximumTotalLoss"
                      value={editableProp.maximumTotalLoss ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses + " mt-1"}
                    />
                  </CardDescription>
                  <CardDescription>
                    Pérdida máxima por operación:
                    <input
                      type="number"
                      name="maximumLossPerTrade"
                      value={editableProp.maximumLossPerTrade ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses + " mt-1"}
                    />
                  </CardDescription>
                  <CardDescription>
                    Objetivo de ganancia:
                    <input
                      type="number"
                      name="profitTarget"
                      value={editableProp.profitTarget ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses + " mt-1"}
                    />
                  </CardDescription>
                  <CardDescription>
                    Apalancamiento:
                    <input
                      type="number"
                      name="leverage"
                      value={editableProp.leverage ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses + " mt-1"}
                    />
                  </CardDescription>
                </div>
              </CardHeader>

              {/* BOTÓN GUARDAR */}
              <Button
                onClick={handleSave}
                className="bg-amber-500 hover:bg-amber-400 text-black rounded-lg"
              >
                Guardar
              </Button>
            </CardContent>
          </Card>

          {/* Columna Derecha: Items disponibles para asignar */}
          <div className="space-y-6">
            {/* Productos disponibles */}
            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">
                    Productos disponibles
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {productavailable?.map((product) => (
                    <Card
                      key={product.id}
                      className="bg-zinc-800 rounded-lg shadow-sm"
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{product.name}</span>
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => addProduct(product)}
                          className="bg-amber-500 hover:bg-amber-400 text-black"
                        >
                          +
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fases disponibles */}
            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">
                    Fases disponibles
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {stagesavailable?.map((stage) => (
                    <Card
                      key={stage.id}
                      className="bg-zinc-800 rounded-lg shadow-sm"
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{stage.name}</span>
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => addStage(stage)}
                          className="bg-amber-500 hover:bg-amber-400 text-black"
                        >
                          +
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subcategorías disponibles */}
            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">
                    Subcategorías disponibles
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {subcategoriesavailable?.map((subcategory) => (
                    <Card
                      key={subcategory.id}
                      className="bg-zinc-800 rounded-lg shadow-sm"
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{subcategory.name}</span>
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => changeSubcategory(subcategory)}
                          className="bg-amber-500 hover:bg-amber-400 text-black"
                        >
                          +
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categorías disponibles (Steps) */}
            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">
                    Categorías disponibles
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {stepavailable?.map((step) => (
                    <Card
                      key={step.id}
                      className="bg-zinc-800 rounded-lg shadow-sm"
                    >
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{step.name}</span>
                        <Button
                          variant="default"
                          size="xs"
                          onClick={() => changeCategory(step)}
                          className="bg-amber-500 hover:bg-amber-400 text-black"
                        >
                          +
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
