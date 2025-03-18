"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "..";

// Función para formatear la fecha en dd/mm/aaaa
function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function StepsOrganizado() {
  const router = useRouter();

  // Estado unificado - estructura organizada
  const [stepsData, setStepsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [selectedSubcatIndex, setSelectedSubcatIndex] = useState(null);

  // Carga de datos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch 1: TODOS los Steps
        const stepsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-steps?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!stepsRes.ok) throw new Error("Error al cargar Steps");
        const stepsJson = await stepsRes.json();
        const stepsItems = stepsJson.data || [];
        
        // Fetch 2: ChallengeRelation (para subcats, products, stages)
        const relRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!relRes.ok) throw new Error("Error al cargar ChallengeRelation");
        const relJson = await relRes.json();
        const relItems = relJson.data || [];
        
        console.log("Steps =>", stepsItems);
        console.log("ChallengeRelations =>", relItems);
        
        // Estructura reorganizada
        const organizedData = organizarDatos(stepsItems, relItems);
        setStepsData(organizedData);
        
        // Seleccionar el primer step por defecto
        if (organizedData.length > 0) {
          setSelectedStepIndex(0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("loadData error:", error);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Función para organizar datos en la estructura solicitada
  function organizarDatos(steps, relations) {
    // Primero, agrupamos steps por nombre para combinar los que son iguales
    const stepsByName = {};
    
    steps.forEach(step => {
      const stepName = step.name.trim();
      
      if (!stepsByName[stepName]) {
        stepsByName[stepName] = {
          step: {
            id: step.id,
            documentId: step.documentId,
            name: stepName,
            createdAt: step.createdAt,
            updatedAt: step.updatedAt,
            publishedAt: step.publishedAt
          },
          subcategories: [],
          relations: []
        };
      }
      
      // Añadimos la relación de este step a todas las relaciones
      relations.forEach(rel => {
        if (rel.challenge_step && rel.challenge_step.documentId === step.documentId) {
          // Evitamos duplicados
          if (!stepsByName[stepName].relations.some(r => r.id === rel.id)) {
            stepsByName[stepName].relations.push(rel);
          }
          
          // Procesamos subcategorías
          if (rel.challenge_subcategory) {
            const subcat = rel.challenge_subcategory;
            const subcatDoc = subcat.documentId;
            
            // Verificamos si ya existe esta subcategoría
            let existingSubcat = stepsByName[stepName].subcategories.find(
              sc => sc.documentId === subcatDoc
            );
            
            if (!existingSubcat) {
              existingSubcat = {
                id: subcat.id,
                documentId: subcatDoc,
                name: subcat.name || "Subcat sin nombre",
                stages: []
              };
              stepsByName[stepName].subcategories.push(existingSubcat);
            }
            
            // Procesamos stages
            if (rel.challenge_stages && rel.challenge_stages.length > 0) {
              rel.challenge_stages.forEach(stage => {
                // Verificamos si este stage ya existe en esta subcategoría
                if (!existingSubcat.stages.some(s => s.id === stage.id)) {
                  existingSubcat.stages.push({
                    id: stage.id,
                    documentId: stage.documentId,
                    name: stage.name || "Stage sin nombre",
                    parametros: {
                      id: rel.id,
                      documentId: rel.documentId,
                      minimumTradingDays: rel.minimumTradingDays,
                      maximumDailyLoss: rel.maximumDailyLoss,
                      profitTarget: rel.profitTarget,
                      leverage: rel.leverage,
                      maximumTotalLoss: rel.maximumTotalLoss,
                      maximumLossPerTrade: rel.maximumLossPerTrade,
                      createdAt: rel.createdAt,
                      updatedAt: rel.updatedAt
                    }
                  });
                }
              });
            } else {
              // Si no hay stages explícitos, creamos uno basado en la relación
              if (!existingSubcat.stages.some(s => s.id === rel.id)) {
                existingSubcat.stages.push({
                  id: rel.id,
                  documentId: rel.documentId,
                  name: `Stage ${existingSubcat.stages.length + 1}`,
                  parametros: {
                    id: rel.id,
                    documentId: rel.documentId,
                    minimumTradingDays: rel.minimumTradingDays,
                    maximumDailyLoss: rel.maximumDailyLoss,
                    profitTarget: rel.profitTarget,
                    leverage: rel.leverage,
                    maximumTotalLoss: rel.maximumTotalLoss,
                    maximumLossPerTrade: rel.maximumLossPerTrade,
                    createdAt: rel.createdAt,
                    updatedAt: rel.updatedAt
                  }
                });
              }
            }
            
            // Procesamos productos relacionados con esta subcategoría
            if (rel.challenge_products && rel.challenge_products.length > 0) {
              if (!existingSubcat.products) {
                existingSubcat.products = [];
              }
              
              rel.challenge_products.forEach(product => {
                if (!existingSubcat.products.some(p => p.id === product.id)) {
                  existingSubcat.products.push({
                    id: product.id,
                    documentId: product.documentId,
                    name: product.name || "Product sin nombre"
                  });
                }
              });
            }
          }
        }
      });
    });
    
    // Convertimos a array para la salida final
    return Object.values(stepsByName);
  }

  // Reset subcategoría cuando cambie el Step
  useEffect(() => {
    setSelectedSubcatIndex(null);
  }, [selectedStepIndex]);

  // Botón "+"
  function handlePlusClick() {
    router.push("/admin/steps");
  }

  // Obtener el step seleccionado
  const selectedStep = selectedStepIndex !== null ? stepsData[selectedStepIndex] : null;
  
  // Obtener subcategorías del step seleccionado
  const subcatOptions = selectedStep ? selectedStep.subcategories : [];
  
  // Obtener la subcategoría seleccionada
  const selectedSubcat = selectedSubcatIndex !== null && subcatOptions.length > 0 
    ? subcatOptions[selectedSubcatIndex] : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-6 bg-gradient-to-b  text-yellow-100">
          <div className="flex items-center justify-center h-32">
            <p className="text-amber-500">Cargando datos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Fondo general con un degradado oscuro */}
      <div className="min-h-screen p-6 bg-gradient-to-b  text-yellow-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-center">Step → Subcategory → Products & Stages & Parameters</h2>

          {/* 1) STEPS */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {stepsData.length === 0 ? (
              <>
                <span className="text-gray-400">No hay Steps</span>
                <Button
                  onClick={handlePlusClick}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                {stepsData.map((stepObj, index) => (
                  <button
                    key={stepObj.step.documentId}
                    onClick={() => setSelectedStepIndex(index)}
                    className={cn(
                      "px-4 py-2 rounded-lg transition",
                      selectedStepIndex === index
                        ? "bg-amber-500 text-black"
                        : "bg-zinc-800 hover:bg-zinc-700 text-yellow-100"
                    )}
                  >
                    {stepObj.step.name}
                  </button>
                ))}
                <Button
                  onClick={handlePlusClick}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* 2) SUBCATEGORY */}
          {selectedStep && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {subcatOptions.length === 0 ? (
                <>
                  <span className="text-gray-400">No hay Subcategorías para este Step</span>
                  <Button
                    onClick={handlePlusClick}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  {subcatOptions.map((sc, index) => (
                    <button
                      key={sc.documentId}
                      onClick={() => setSelectedSubcatIndex(index)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition",
                        selectedSubcatIndex === index
                          ? "bg-amber-500 text-black"
                          : "bg-zinc-800 hover:bg-zinc-700 text-yellow-100"
                      )}
                    >
                      {sc.name}
                    </button>
                  ))}
                  <Button
                    onClick={handlePlusClick}
                    className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* 3) PRODUCTS & STAGES */}
          {selectedSubcat && (
            <div
              className={cn(
                "mt-6",
                selectedSubcat.stages.length === 1
                  ? "flex flex-col items-center gap-6"
                  : "flex flex-row gap-6"
              )}
            >
              {/* PRODUCTS */}
              <Card className={cn(
                "bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100",
                selectedSubcat.stages.length === 1 ? "w-full md:w-1/2" : "flex-1"
              )}>
                <CardHeader>
                  <CardTitle className="text-amber-400">Products Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedSubcat.products && selectedSubcat.products.length > 0 ? (
                      <>
                        {selectedSubcat.products.map((p) => (
                          <div key={p.id} className="px-4 py-2 bg-zinc-800 rounded-lg">
                            {p.name}
                          </div>
                        ))}
                        <Button
                          onClick={handlePlusClick}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400">No hay Products en esta Subcat</span>
                        <Button
                          onClick={handlePlusClick}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* STAGES */}
              <Card className={cn(
                "bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100",
                selectedSubcat.stages.length === 1 ? "w-full md:w-1/2" : "flex-1"
              )}>
                <CardHeader>
                  <CardTitle className="text-amber-400">Stages Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedSubcat.stages.length > 0 ? (
                      <>
                        {selectedSubcat.stages.map((sg) => (
                          <div key={sg.id} className="px-4 py-2 bg-zinc-800 rounded-lg">
                            {sg.name}
                          </div>
                        ))}
                        <Button
                          onClick={handlePlusClick}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400">No hay Stages para este Step</span>
                        <Button
                          onClick={handlePlusClick}
                          className="bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 4) TARJETAS DE PARÁMETROS POR CADA STAGE */}
          {selectedSubcat && selectedSubcat.stages.length > 0 && (
            <div className="mt-8 space-y-6">
              {selectedSubcat.stages.length === 1 ? (
                <div className="flex justify-center">
                  <div className="w-full md:w-1/2">
                    <Card className="bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100 w-full">
                      <CardHeader>
                        <CardTitle className="text-amber-400">{selectedSubcat.stages[0].name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-amber-300">Sub Categoría: </span>
                            {selectedSubcat.name ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Min Trading Days: </span>
                            {selectedSubcat.stages[0].parametros.minimumTradingDays ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Daily Loss: </span>
                            {selectedSubcat.stages[0].parametros.maximumDailyLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Profit Target: </span>
                            {selectedSubcat.stages[0].parametros.profitTarget ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Leverage: </span>
                            {selectedSubcat.stages[0].parametros.leverage ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Maximum Total Loss: </span>
                            {selectedSubcat.stages[0].parametros.maximumTotalLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Maximum Loss Per Trade: </span>
                            {selectedSubcat.stages[0].parametros.maximumLossPerTrade ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Creado: </span>
                            {formatDate(selectedSubcat.stages[0].parametros.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Actualizado: </span>
                            {formatDate(selectedSubcat.stages[0].parametros.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : selectedSubcat.stages.length === 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSubcat.stages.map((sg) => (
                    <Card
                      key={sg.id}
                      className="bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100 w-full"
                    >
                      <CardHeader>
                        <CardTitle className="text-amber-400">{sg.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-amber-300">Sub Categoría: </span>
                            {selectedSubcat.name ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Min Trading Days: </span>
                            {sg.parametros.minimumTradingDays ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Daily Loss: </span>
                            {sg.parametros.maximumDailyLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Profit Target: </span>
                            {sg.parametros.profitTarget ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Leverage: </span>
                            {sg.parametros.leverage ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Maximum Total Loss: </span>
                            {sg.parametros.maximumTotalLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Maximum Loss Per Trade: </span>
                            {sg.parametros.maximumLossPerTrade ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Creado: </span>
                            {formatDate(sg.parametros.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Actualizado: </span>
                            {formatDate(sg.parametros.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedSubcat.stages.map((sg) => (
                    <Card
                      key={sg.id}
                      className="bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100 w-full"
                    >
                      <CardHeader>
                        <CardTitle className="text-amber-400">{sg.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-amber-300">Sub Categoría: </span>
                            {selectedSubcat.name ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Min Trading Days: </span>
                            {sg.parametros.minimumTradingDays ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Daily Loss: </span>
                            {sg.parametros.maximumDailyLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Profit Target: </span>
                            {sg.parametros.profitTarget ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Leverage: </span>
                            {sg.parametros.leverage ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Maximum Total Loss: </span>
                            {sg.parametros.maximumTotalLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Maximum Loss Per Trade: </span>
                            {sg.parametros.maximumLossPerTrade ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Creado: </span>
                            {formatDate(sg.parametros.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Actualizado: </span>
                            {formatDate(sg.parametros.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}