// src/components/forms/parameters/PropDetails.tsx
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

// Interfaces
export interface Challenge_products {
  id: string | number;
  name: string;
}

export interface Challenge_subcategory {
  id: string | number;
  name: string;
}

export interface Challenge_step {
  id: string | number;
  name: string;
}

export interface ChallengeStage {
  id: string | number;
  name: string;
  minimumTradingDays: number;
  maximumDailyLoss: number;
  maximumTotalLoss: number;
  maximumLossPerTrade: number;
  profitTarget: number;
  leverage: number;
}

export interface ChallengeRelationsStages {
  challenge_subcategory: Challenge_subcategory;
  challenge_products: Challenge_products[];
  challenge_step: Challenge_step;
  challenge_stages: ChallengeStage[];
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

  const [editableProp, setEditableProp] = useState(prop);
  const [selectedStageId, setSelectedStageId] = useState<string | number | null>(null);

  // Stage seleccionado para visualización o edición
  const selectedStage = editableProp.challenge_stages.find(
    (stage) => stage.id === selectedStageId
  ) || null;

  // Filtrado de ítems disponibles
  const productavailable = productsData?.filter(
    (product) => !editableProp.challenge_products.some((p) => p.id === product.id)
  );
  const stagesavailable = stagesdata?.filter(
    (stage) => !editableProp.challenge_stages.some((p) => p.id === stage.id)
  );
  const stepavailable =
    stepsdata?.filter((step) => step.id !== editableProp.challenge_step?.id) || [];
  const subcategoriesavailable =
    subcategoriesData?.filter(
      (subcategory) => subcategory.id !== editableProp.challenge_subcategory?.id
    ) || [];

  // Handlers para agregar/quitar/actualizar
  const addProduct = (product: Challenge_products) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: [...prev.challenge_products, product],
    }));
  };

  const removeProduct = (productId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: prev.challenge_products.filter((p) => p.id !== productId),
    }));
  };

  const changeSubcategory = (subcategory: Challenge_subcategory | null) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_subcategory: subcategory,
    }));
  };

  const addStage = (stage: ChallengeStage) => {
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

  const handleStageMetricChange = (
    stageId: string | number,
    field: string,
    value: string | null
  ) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: prev.challenge_stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              [field]: field === "leverage" ? value : value === "" ? null : parseFloat(value as string),
            }
          : stage
      ),
    }));
  };

  // Guardar cambios
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
          body: JSON.stringify({
            data: {
              challenge_subcategory: editableProp.challenge_subcategory,
              challenge_step: editableProp.challenge_step,
              challenge_stages: editableProp.challenge_stages.map((stage) => ({
                id: stage.id,
                name: stage.name,
                minimumTradingDays: stage.minimumTradingDays,
                maximumDailyLoss: stage.maximumDailyLoss,
                maximumTotalLoss: stage.maximumTotalLoss,
                maximumLossPerTrade: stage.maximumLossPerTrade,
                profitTarget: stage.profitTarget,
                leverage: stage.leverage,
              })),
              challenge_products: editableProp.challenge_products,
            },
          }),
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

  // Clases para inputs
  const inputDarkClasses =
    "bg-zinc-800 text-yellow-100 border-none focus:ring-0 focus:outline-none p-2 rounded w-full";

  // Render principal
  return (
    <div className="bg-gradient-to-b from-black via-zinc-900 to-black h-max p-6 text-yellow-100">
      {modalType !== 2 ? (
        <div className="space-y-6">
          <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
            <CardContent className="space-y-6 w-full p-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-[2] min-w-[280px]">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge>Categoría</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {prop.challenge_step?.name && (
                      <Card>
                        <CardContent className="p-2 flex items-center justify-between">
                          <span className="text-xs">{prop.challenge_step.name}</span>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge>Subcategoría</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {prop.challenge_subcategory?.name && (
                      <Card>
                        <CardContent className="p-2 flex items-center justify-between">
                          <span className="text-xs">{prop.challenge_subcategory.name}</span>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {selectedStage && (
                    <CardHeader className="px-0">
                      <CardTitle className="text-amber-400">
                        Parámetros para {selectedStage.name}
                      </CardTitle>
                      <div className="space-y-1 mt-2 text-sm">
                        <CardDescription>
                          Días mínimos de trading: {selectedStage.minimumTradingDays ?? "N/A"}
                        </CardDescription>
                        <CardDescription>
                          Pérdida diaria máxima: {selectedStage.maximumDailyLoss ?? "N/A"}
                        </CardDescription>
                        <CardDescription>
                          Pérdida máxima total: {selectedStage.maximumTotalLoss ?? "N/A"}
                        </CardDescription>
                        <CardDescription>
                          Pérdida máxima por operación: {selectedStage.maximumLossPerTrade ?? "N/A"}
                        </CardDescription>
                        <CardDescription>
                          Objetivo de ganancia: {selectedStage.profitTarget ?? "N/A"}
                        </CardDescription>
                        <CardDescription>
                          Apalancamiento: {selectedStage.leverage ?? "N/A"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  )}
                </div>

                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">Fases</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {prop.challenge_stages.map((stage) => (
                      <Card key={stage.id}>
                        <CardContent className="p-2 flex items-center justify-between">
                          <Button
                            variant="link"
                            className="text-xs text-yellow-100 p-0"
                            onClick={() => setSelectedStageId(stage.id)}
                          >
                            {stage.name}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
            <CardContent className="space-y-6 w-full p-6">
              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Categoría</Badge>
                </h3>
                {editableProp.challenge_step?.name && (
                  <Card className="bg-zinc-800 rounded-lg shadow-sm">
                    <CardContent className="p-2 flex items-center justify-between">
                      <span className="text-xs">{editableProp.challenge_step.name}</span>
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

              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Subcategoría</Badge>
                </h3>
                {editableProp.challenge_subcategory?.name && (
                  <Card className="bg-zinc-800 rounded-lg shadow-sm">
                    <CardContent className="p-2 flex items-center justify-between">
                      <span className="text-xs">{editableProp.challenge_subcategory.name}</span>
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

              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Fases</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {editableProp.challenge_stages.map((stage) => (
                    <Card key={stage.id} className="bg-zinc-800 rounded-lg shadow-sm">
                      <CardContent className="p-2 flex items-center justify-between">
                        <span className="text-xs">{stage.name}</span>
                        <div>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => setSelectedStageId(stage.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-black mr-2"
                          >
                            Editar Métricas
                          </Button>
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => removeStage(stage.id)}
                          >
                            -
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm mb-2">
                  <Badge className="bg-amber-300 text-black">Productos</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {editableProp.challenge_products.map((product) => (
                    <Card key={product.id} className="bg-zinc-800 rounded-lg shadow-sm">
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

              {selectedStage && (
                <CardHeader className="px-0">
                  <CardTitle className="text-amber-400">
                    Editar Parámetros para {selectedStage.name}
                  </CardTitle>
                  <div className="space-y-2 mt-2 text-sm">
                    <CardDescription>
                      Días mínimos de trading:
                      <input
                        type="number"
                        name="minimumTradingDays"
                        value={selectedStage.minimumTradingDays ?? ""}
                        onChange={(e) =>
                          handleStageMetricChange(selectedStage.id, "minimumTradingDays", e.target.value)
                        }
                        className={inputDarkClasses + " mt-1"}
                      />
                    </CardDescription>
                    <CardDescription>
                      Pérdida diaria máxima:
                      <input
                        type="number"
                        name="maximumDailyLoss"
                        value={selectedStage.maximumDailyLoss ?? ""}
                        onChange={(e) =>
                          handleStageMetricChange(selectedStage.id, "maximumDailyLoss", e.target.value)
                        }
                        className={inputDarkClasses + " mt-1"}
                      />
                    </CardDescription>
                    <CardDescription>
                      Pérdida máxima total:
                      <input
                        type="number"
                        name="maximumTotalLoss"
                        value={selectedStage.maximumTotalLoss ?? ""}
                        onChange={(e) =>
                          handleStageMetricChange(selectedStage.id, "maximumTotalLoss", e.target.value)
                        }
                        className={inputDarkClasses + " mt-1"}
                      />
                    </CardDescription>
                    <CardDescription>
                      Pérdida máxima por operación:
                      <input
                        type="number"
                        name="maximumLossPerTrade"
                        value={selectedStage.maximumLossPerTrade ?? ""}
                        onChange={(e) =>
                          handleStageMetricChange(selectedStage.id, "maximumLossPerTrade", e.target.value)
                        }
                        className={inputDarkClasses + " mt-1"}
                      />
                    </CardDescription>
                    <CardDescription>
                      Objetivo de ganancia:
                      <input
                        type="number"
                        name="profitTarget"
                        value={selectedStage.profitTarget ?? ""}
                        onChange={(e) =>
                          handleStageMetricChange(selectedStage.id, "profitTarget", e.target.value)
                        }
                        className={inputDarkClasses + " mt-1"}
                      />
                    </CardDescription>
                    <CardDescription>
                      Apalancamiento:
                      <input
                        type="number"
                        name="leverage"
                        value={selectedStage.leverage ?? ""}
                        onChange={(e) =>
                          handleStageMetricChange(selectedStage.id, "leverage", e.target.value)
                        }
                        className={inputDarkClasses + " mt-1"}
                      />
                    </CardDescription>
                  </div>
                </CardHeader>
              )}

              <Button
                onClick={handleSave}
                className="bg-amber-500 hover:bg-amber-400 text-black rounded-lg"
              >
                Guardar
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">Productos disponibles</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {productavailable?.map((product) => (
                    <Card key={product.id} className="bg-zinc-800 rounded-lg shadow-sm">
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

            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">Fases disponibles</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {stagesavailable?.map((stage) => (
                    <Card key={stage.id} className="bg-zinc-800 rounded-lg shadow-sm">
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

            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">Subcategorías disponibles</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {subcategoriesavailable?.map((subcategory) => (
                    <Card key={subcategory.id} className="bg-zinc-800 rounded-lg shadow-sm">
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

            <Card className="bg-zinc-900 shadow-md rounded-lg text-yellow-100">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm">
                  <Badge className="bg-amber-300 text-black">Categorías disponibles</Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {stepavailable?.map((step) => (
                    <Card key={step.id} className="bg-zinc-800 rounded-lg shadow-sm">
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