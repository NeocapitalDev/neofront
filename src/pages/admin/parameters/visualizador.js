"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "..";

/**
 * Estructura:
 * 1) Mostrar TODOS los Steps (de "challenge-steps")
 * 2) Subcategorías, Products y Stages vienen de "challenge-relations" (un segundo fetch)
 * 3) Filtramos por documentId (Step, Subcat) para Products & Stages
 * 4) Tarjetas de parámetros POR CADA STAGE, usando grid para alineación horizontal
 * 5) Fechas en formato dd/mm/aaaa
 */

// Función para formatear la fecha en dd/mm/aaaa
function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function StepSubcatAutoShowNoResumen() {
  const router = useRouter();

  // --- Colecciones ---
  const [allSteps, setAllSteps] = useState([]);
  const [relations, setRelations] = useState([]);

  // --- Selecciones ---
  const [selectedStepDoc, setSelectedStepDoc] = useState(null);
  const [selectedSubcatDoc, setSelectedSubcatDoc] = useState(null);

  // ----------------------------------------------------------------
  // 1) Cargar Steps y ChallengeRelation
  // ----------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch 1: TODOS los Steps
        const stepsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-steps?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!stepsRes.ok) throw new Error("Error al cargar Steps");
        const stepsJson = await stepsRes.json();
        const stepsItems = stepsJson.data || [];
        setAllSteps(stepsItems);

        if (stepsItems.length > 0 && selectedStepDoc === null) {
          const firstDocId = stepsItems[0].documentId;
          if (firstDocId) setSelectedStepDoc(firstDocId);
        }

        // Fetch 2: ChallengeRelation (para subcats, products, stages)
        const relRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!relRes.ok) throw new Error("Error al cargar ChallengeRelation");
        const relJson = await relRes.json();
        const relItems = relJson.data || [];
        setRelations(relItems);

        console.log("Steps =>", stepsItems);
        console.log("ChallengeRelations =>", relItems);
      } catch (error) {
        console.error("loadData error:", error);
      }
    }
    loadData();
  }, [selectedStepDoc]);

  // Reset subcategoría cuando cambie el Step
  useEffect(() => {
    setSelectedSubcatDoc(null);
  }, [selectedStepDoc]);

  // Botón "+"
  function handlePlusClick() {
    router.push("/admin/steps");
  }

  // ----------------------------------------------------------------
  // 2) Steps: { doc, name }
  // ----------------------------------------------------------------
  const stepOptions = allSteps
    .filter((s) => s.documentId)
    .map((s) => ({
      doc: s.documentId,
      name: s.name || "Step sin nombre",
      id: s.id,
    }));

  // ----------------------------------------------------------------
  // 3) Subcategorías
  // ----------------------------------------------------------------
  let subcatOptions = [];
  if (selectedStepDoc) {
    const subcatMap = new Map();
    relations.forEach((rel) => {
      const step = rel.challenge_step;
      const subcat = rel.challenge_subcategory;
      if (step && subcat && step.documentId === selectedStepDoc) {
        const docSubcat = subcat.documentId;
        const nameSubcat = subcat.name || "Subcat sin nombre";
        if (!subcatMap.has(docSubcat)) {
          subcatMap.set(docSubcat, { doc: docSubcat, name: nameSubcat, id: subcat.id });
        }
      }
    });
    subcatOptions = Array.from(subcatMap.values());
  }

  // ----------------------------------------------------------------
  // 4) Products & Stages
  // ----------------------------------------------------------------
  let productList = [];
  let stageList = [];
  let selectedSubcat = null;
  let options = {};

  if (selectedStepDoc && selectedSubcatDoc) {
    relations.forEach((rel) => {
      const step = rel.challenge_step;
      const subcat = rel.challenge_subcategory;
      if (step && subcat && step.documentId === selectedStepDoc && subcat.documentId === selectedSubcatDoc) {
        selectedSubcat = subcat;
        options = {
          minTradingDays: rel.minimumTradingDays,
          maxDailyLoss: rel.maximumDailyLoss,
          maxLoss: rel.maximumLoss,
          profitTarget: rel.profitTarget,
          leverage: rel.leverage,
          brokerAccount: rel.broker_account,
          createdAt: rel.createdAt,
          updatedAt: rel.updatedAt,
        };

        // PRODUCTS
        const productsArr = rel.challenge_products || [];
        productsArr.forEach((p) => {
          const pDoc = p.documentId;
          const pName = p.name || "Product sin nombre";
          if (!productList.some((x) => x.doc === pDoc)) {
            productList.push({ doc: pDoc, name: pName, id: p.id });
          }
        });

        // STAGES
        const stagesArr = rel.challenge_stages || [];
        stagesArr.forEach((sg) => {
          const sgDoc = sg.documentId;
          const sgName = sg.name || "Stage sin nombre";
          if (!stageList.some((x) => x.doc === sgDoc)) {
            stageList.push({ doc: sgDoc, name: sgName, id: sg.id });
          }
        });
      }
    });
  }

  return (
    <DashboardLayout>
      {/* Fondo general con un degradado oscuro */}
      <div className="min-h-screen p-6 bg-gradient-to-b from-black via-zinc-900 to-black text-yellow-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-center">Step → Subcategory → Products & Stages & Parameters</h2>

          {/* 1) STEPS */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {stepOptions.length === 0 ? (
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
                {stepOptions.map((stepObj) => (
                  <button
                    key={stepObj.doc}
                    onClick={() => setSelectedStepDoc(stepObj.doc)}
                    className={cn(
                      "px-4 py-2 rounded-lg transition",
                      selectedStepDoc === stepObj.doc
                        ? "bg-amber-500 text-black"
                        : "bg-zinc-800 hover:bg-zinc-700 text-yellow-100"
                    )}
                  >
                    {stepObj.name}
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
          {selectedStepDoc && (
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
                  {subcatOptions.map((sc) => (
                    <button
                      key={sc.doc}
                      onClick={() => setSelectedSubcatDoc(sc.doc)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition",
                        selectedSubcatDoc === sc.doc
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
          {selectedSubcatDoc && (
            <div
              className={cn(
                "mt-6",
                stageList.length === 1
                  ? "flex flex-col items-center gap-6"
                  : "flex flex-row gap-6"
              )}
            >
              {/* PRODUCTS */}
              <Card className={cn(
                "bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100",
                stageList.length === 1 ? "w-full md:w-1/2" : "flex-1"
              )}>
                <CardHeader>
                  <CardTitle className="text-amber-400">Products Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    {productList.length > 0 ? (
                      <>
                        {productList.map((p) => (
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
                stageList.length === 1 ? "w-full md:w-1/2" : "flex-1"
              )}>
                <CardHeader>
                  <CardTitle className="text-amber-400">Stages Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    {stageList.length > 0 ? (
                      <>
                        {stageList.map((sg) => (
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
          {selectedSubcat && stageList.length > 0 && (
            <div className="mt-8 space-y-6">
              {stageList.length === 1 ? (
                <div className="flex justify-center">
                  <div className="w-full md:w-1/2">
                    <Card className="bg-zinc-900 rounded-lg shadow-md p-4 text-yellow-100 w-full">
                      <CardHeader>
                        <CardTitle className="text-amber-400">{stageList[0].name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-amber-300">Sub Categoría: </span>
                            {selectedSubcat.name ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Min Trading Days: </span>
                            {options.minTradingDays ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Daily Loss: </span>
                            {options.maxDailyLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Loss: </span>
                            {options.maxLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Profit Target: </span>
                            {options.profitTarget ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Leverage: </span>
                            {options.leverage ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Creado: </span>
                            {formatDate(options.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Actualizado: </span>
                            {formatDate(options.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : stageList.length === 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stageList.map((sg) => (
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
                            {options.minTradingDays ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Daily Loss: </span>
                            {options.maxDailyLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Loss: </span>
                            {options.maxLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Profit Target: </span>
                            {options.profitTarget ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Leverage: </span>
                            {options.leverage ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Creado: </span>
                            {formatDate(options.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Actualizado: </span>
                            {formatDate(options.updatedAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stageList.map((sg) => (
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
                            {options.minTradingDays ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Daily Loss: </span>
                            {options.maxDailyLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Max Loss: </span>
                            {options.maxLoss ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Profit Target: </span>
                            {options.profitTarget ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Leverage: </span>
                            {options.leverage ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Creado: </span>
                            {formatDate(options.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium text-amber-300">Actualizado: </span>
                            {formatDate(options.updatedAt)}
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
