"use client";

import React, { useState } from "react";
import { toast } from "sonner"; // <-- Importación de sonner
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
  maximumLoss: number;
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
  /**
   * (Opcional) Función para cerrar el modal.
   * Se llamará automáticamente si se guarda con éxito.
   */
  onClose?: () => void;
  actualizarDatos?: () => void;
}

export function PropDetails({ prop, modalType, onClose,actualizarDatos}: DetailsProps) {
  const { data: productsData } = useStrapiData("challenge-products");
  const { data: subcategoriesData } = useStrapiData("challenge-subcategories");
  const { data: stagesdata } = useStrapiData("challenge-stages");
  const { data: stepsdata } = useStrapiData("challenge-steps");

  // Estado local basado en 'prop' para manipular seleccionados
  const [editableProp, setEditableProp] = useState(prop);

  // Productos disponibles (excluyendo los que ya están en challenge_products)
  const productavailable = productsData?.filter(
    (product) => !editableProp.challenge_products.some((p) => p.id === product.id)
  );

  // Stages disponibles (excluyendo las ya seleccionadas)
  const stagesavailable = stagesdata?.filter(
    (stage) => !editableProp.challenge_stages.some((p) => p.id === stage.id)
  );

  // Steps disponibles (excluyendo la ya seleccionada)
  const stepavailable =
    stepsdata?.filter((step) => step.id !== editableProp.challenge_step?.id) ||
    [];

  // Subcategorías disponibles (excluyendo la ya seleccionada)
  const subcategoriesavailable =
    subcategoriesData?.filter(
      (subcategory) => subcategory.id !== editableProp.challenge_subcategory?.id
    ) || [];

  // Función para agregar un producto
  const addProduct = (product: Challenge_products) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: [...prev.challenge_products, product],
    }));
  };

  // Función para quitar un producto
  const removeProduct = (productId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: prev.challenge_products.filter(
        (p) => p.id !== productId
      ),
    }));
  };

  // Función para cambiar la subcategoría
  const changeSubcategory = (subcategory: Challenge_subcategory | null) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_subcategory: subcategory,
    }));
  };

  // Función para agregar stage
  const addStage = (stage: Challenge_stages) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: [...prev.challenge_stages, stage],
    }));
  };

  // Función para quitar un stage
  const removeStage = (stageId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: prev.challenge_stages.filter((p) => p.id !== stageId),
    }));
  };

  // Función para cambiar la categoría (step)
  const changeCategory = (category: Challenge_step | null) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_step: category,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Si el valor es una cadena vacía, asigna null
    const newValue = value === "" ? null : value;

    setEditableProp((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

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

  const inputDarkClasses =
    "dark:bg-zinc-900 dark:text-white dark:border-gray-600 p-1 rounded w-full";

  return (
    <div className="flex gap-4 justify-center">
      <Card>
        <CardContent className="space-y-6 w-full">
          <div className="flex gap-2">
            {/* Sección de Subcategoria y Step */}
            <div className="flex-[2] my-6">
              <h3 className="text-sm text-muted-foreground mb-3">
                <Badge>Categoria</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_step?.name ? (
                  <Card key={editableProp.challenge_step.id}>
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          {modalType === 2 ? (
                            <div>
                              <span className="text-xs">
                                {editableProp.challenge_step.name}
                              </span>
                              <Button
                                variant="destructive"
                                className="mx-4"
                                size="xs"
                                onClick={() => changeCategory(null)}
                              >
                                -
                              </Button>
                            </div>
                          ) : (
                            prop.challenge_step.name
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              <h3 className="text-sm text-muted-foreground mb-3">
                <Badge>Subcategoria</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_subcategory?.name ? (
                  <Card key={editableProp.challenge_subcategory.id}>
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          {modalType === 2 ? (
                            <div>
                              <span className="text-xs">
                                {editableProp.challenge_subcategory.name}
                              </span>
                              <Button
                                variant="destructive"
                                className="mx-4"
                                size="xs"
                                onClick={() => changeSubcategory(null)}
                              >
                                -
                              </Button>
                            </div>
                          ) : (
                            prop.challenge_subcategory.name
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>

              <CardHeader>
                <CardTitle>Parámetros y condiciones</CardTitle>
                <CardDescription>
                  Días mínimos de trading:{" "}
                  {modalType === 2 ? (
                    <input
                      type="number"
                      name="minimumTradingDays"
                      value={editableProp.minimumTradingDays ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses}
                    />
                  ) : (
                    prop.minimumTradingDays
                  )}
                </CardDescription>
                <CardDescription>
                  Pérdida diaria máxima:{" "}
                  {modalType === 2 ? (
                    <input
                      type="number"
                      name="maximumDailyLoss"
                      value={editableProp.maximumDailyLoss ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses}
                    />
                  ) : (
                    prop.maximumDailyLoss
                  )}
                </CardDescription>
                <CardDescription>
                  Pérdida máxima:{" "}
                  {modalType === 2 ? (
                    <input
                      type="number"
                      name="maximumLoss"
                      value={editableProp.maximumLoss ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses}
                    />
                  ) : (
                    prop.maximumLoss
                  )}
                </CardDescription>
                <CardDescription>
                  Objetivo de ganancia:{" "}
                  {modalType === 2 ? (
                    <input
                      type="number"
                      name="profitTarget"
                      value={editableProp.profitTarget ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses}
                    />
                  ) : (
                    prop.profitTarget
                  )}
                </CardDescription>
                <CardDescription>
                  Apalancamiento:{" "}
                  {modalType === 2 ? (
                    <input
                      type="number"
                      name="leverage"
                      value={editableProp.leverage ?? ""}
                      onChange={handleChange}
                      className={inputDarkClasses}
                    />
                  ) : (
                    prop.leverage
                  )}
                </CardDescription>
              </CardHeader>
            </div>

            {/* Sección de Stages */}
            <div className="flex-[1] mt-6">
              <h3 className="text-sm text-muted-foreground mb-3">
                <Badge className="bg-amber-200 text-black">Fases</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_stages.map((stage) => (
                  <Card key={stage.id}>
                    <CardContent className="p-3 gap-1 flex items-center justify-between">
                      <span className="text-xs">{stage.name}</span>
                      {modalType === 2 ? (
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => removeStage(stage.id)}
                        >
                          -
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sección de Productos */}
            <div className="flex-[1] mt-6">
              <h3 className="text-sm text-muted-foreground mb-3">
                <Badge className="bg-amber-200 text-black">Productos</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-3 gap-1 flex items-center justify-between">
                      <span className="text-xs">{product.name}</span>
                      {modalType === 2 ? (
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => removeProduct(product.id)}
                        >
                          -
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {modalType === 2 && (
            <Button onClick={handleSave}>Guardar</Button>
          )}
        </CardContent>
      </Card>

      {/* Sección que aparece sólo en modalType=2 para editar/agregar */}
      {modalType === 2 && (
        <div className="flex gap-2">
          {/* Card de Productos disponibles */}
          <Card>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-[1] mt-6">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">
                      Productos disponibles
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {productavailable?.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-3 gap-1 flex items-center justify-between">
                          <span className="text-xs">{product.name}</span>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => addProduct(product)}
                          >
                            +
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Stages disponibles */}
          <Card>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-[1] mt-6">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">
                      Fases disponibles
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {stagesavailable?.map((stage) => (
                      <Card key={stage.id}>
                        <CardContent className="p-3 gap-1 flex items-center justify-between">
                          <span className="text-xs">{stage.name}</span>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => addStage(stage)}
                          >
                            +
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Subcategorías disponibles */}
          <Card>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-[1] mt-6">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">
                      Subcategorías disponibles
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {subcategoriesavailable?.map((subcategory) => (
                      <Card key={subcategory.id}>
                        <CardContent className="p-3 gap-1 flex items-center justify-between">
                          <span className="text-xs">{subcategory.name}</span>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => changeSubcategory(subcategory)}
                          >
                            +
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Steps disponibles */}
          <Card>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <div className="flex-[1] mt-6">
                  <h3 className="text-sm text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">
                      Categorias disponibles
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {stepavailable?.map((step) => (
                      <Card key={step.id}>
                        <CardContent className="p-3 gap-1 flex items-center justify-between">
                          <span className="text-xs">{step.name}</span>
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => changeCategory(step)}
                          >
                            +
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
