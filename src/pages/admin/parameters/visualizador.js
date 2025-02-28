"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // o "next/router" en Next.js 12
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
  const [allSteps, setAllSteps] = useState([]);   // Vienen de /api/challenge-steps
  const [relations, setRelations] = useState([]); // Vienen de /api/challenge-relations

  // --- Selecciones ---
  const [selectedStepDoc, setSelectedStepDoc] = useState(null);
  const [selectedSubcatDoc, setSelectedSubcatDoc] = useState(null);

  // ----------------------------------------------------------------
  // 1) Cargar Steps (para mostrar TODOS) y ChallengeRelation
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

        // Guardamos steps
        setAllSteps(stepsItems);

        // Si hay al menos un Step y no se ha seleccionado ninguno, seleccionamos el primero
        if (stepsItems.length > 0 && selectedStepDoc === null) {
          const firstDocId = stepsItems[0].documentId;
          if (firstDocId) {
            setSelectedStepDoc(firstDocId);
          }
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
  // Notar que se incluye selectedStepDoc en dependencias
  // para evitar un posible bucle; 
  // si no deseas re-llamar en caso de cambiar selectedStepDoc, 
  // quita esa dependencia.

  // Reset subcat cuando cambie Step
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
  // 3) Subcategorías derivadas de ChallengeRelation y Step seleccionado
  // ----------------------------------------------------------------
  let subcatOptions = [];
  if (selectedStepDoc) {
    const subcatMap = new Map();

    relations.forEach((rel) => {
      const step = rel.challenge_step;
      const subcat = rel.challenge_subcategory;
      if (step && subcat) {
        // Filtrar: si step.documentId === selectedStepDoc
        if (step.documentId === selectedStepDoc) {
          const docSubcat = subcat.documentId;
          const nameSubcat = subcat.name || "Subcat sin nombre";
          if (!subcatMap.has(docSubcat)) {
            subcatMap.set(docSubcat, { doc: docSubcat, name: nameSubcat, id: subcat.id });
          }
        }
      }
    });

    subcatOptions = Array.from(subcatMap.values());
  }

  // ----------------------------------------------------------------
  // 4) Products & Stages derivadas de ChallengeRelation
  // ----------------------------------------------------------------
  let productList = [];
  let stageList = [];

  // Necesitamos la subcategoría seleccionada (para los parámetros)
  let selectedSubcat = null;
  let options = {}
  if (selectedStepDoc && selectedSubcatDoc) {
    relations.forEach((rel) => {
      console.log("rel", rel);
      const step = rel.challenge_step;
      const subcat = rel.challenge_subcategory;
      if (step && subcat) {
        if (
          step.documentId === selectedStepDoc &&
          subcat.documentId === selectedSubcatDoc
        ) {
          // Guardamos la subcategoría para sus parámetros
          selectedSubcat = subcat;
          // Extraer parámetros del rel y guardarlos en options
          // const parameters = rel.parameters || {};
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

          console.log("Subcategoría seleccionada =>", selectedSubcat);
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
      }
    });
  }

  // ----------------------------------------------------------------
  // Render final (misma estructura)
  // ----------------------------------------------------------------
  return (
    <DashboardLayout>
      <div className="p-4 text-white min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-yellow-400 text-center">
            Step → Subcategory → Products & Stages & Parameters
          </h2>

          {/* ================== 1) STEPS ================== */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {stepOptions.length === 0 ? (
              <>
                <span className="text-gray-400">No hay Steps</span>
                <Button
                  onClick={handlePlusClick}
                  className="bg-red-500 hover:bg-red-400 flex items-center gap-1"
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
                      "px-4 py-2 rounded-full transition",
                      selectedStepDoc === stepObj.doc
                        ? "bg-yellow-400 text-black font-bold"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    )}
                  >
                    {stepObj.name}
                  </button>
                ))}
                <Button
                  onClick={handlePlusClick}
                  className="bg-red-500 hover:bg-red-400 flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* ================== 2) SUBCATEGORY ================== */}
          {selectedStepDoc && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {subcatOptions.length === 0 ? (
                <>
                  <span className="text-gray-400">No hay Subcategorías para este Step</span>
                  <Button
                    onClick={handlePlusClick}
                    className="bg-red-500 hover:bg-red-400 flex items-center gap-1"
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
                        "px-4 py-2 rounded-full transition",
                        selectedSubcatDoc === sc.doc
                          ? "bg-yellow-400 text-black font-bold"
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                      )}
                    >
                      {sc.name}
                    </button>
                  ))}
                  <Button
                    onClick={handlePlusClick}
                    className="bg-red-500 hover:bg-red-400 flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ================== 3) PRODUCTS & STAGES ================== */}
          {selectedSubcatDoc && (
            <div className="flex flex-row gap-4 mt-4">
              {/* PRODUCTS */}
              <Card className="bg-zinc-900 border-zinc-700 flex-1">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Products Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {productList.length > 0 ? (
                      <>
                        {productList.map((p) => (
                          <div key={p.id} className="px-4 py-2 bg-zinc-800 rounded">
                            {p.name}
                          </div>
                        ))}
                        <Button
                          onClick={handlePlusClick}
                          className="bg-red-500 hover:bg-red-400 flex items-center gap-1 p-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400">No hay Products en esta Subcat</span>
                        <Button
                          onClick={handlePlusClick}
                          className="bg-red-500 hover:bg-red-400 flex items-center gap-1 p-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* STAGES */}
              <Card className="bg-zinc-900 border-zinc-700 flex-1">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Stages Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {stageList.length > 0 ? (
                      <>
                        {stageList.map((sg) => (
                          <div key={sg.id} className="px-4 py-2 bg-zinc-800 rounded">
                            {sg.name}
                          </div>
                        ))}
                        <Button
                          onClick={handlePlusClick}
                          className="bg-red-500 hover:bg-red-400 flex items-center gap-1 p-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400">No hay Stages para este Step</span>
                        <Button
                          onClick={handlePlusClick}
                          className="bg-red-500 hover:bg-red-400 flex items-center gap-1 p-1"
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

          {/* ================== 4) UNA TARJETA POR CADA STAGE PARA PARÁMETROS ================== */}
          {selectedSubcat && stageList.length > 0 && (
            // Usamos grid para alinear horizontalmente
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {stageList.map((sg) => (
                <Card key={sg.id} className="bg-zinc-900 border-zinc-700 w-full">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">
                      Parámetros de la Subcategoría - {sg.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-200">
                      {/* Ejemplo: mostramos los campos de la Subcategoría */}
                      <div>
                        <span className="font-semibold text-yellow-300">Nombre: </span>
                        {options.name ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-300">Min Trading Days: </span>
                        {options.minTradingDays ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-300">Max Daily Loss: </span>
                        {options.maxDailyLoss ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-300">Max Loss: </span>
                        {options.maxLoss ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-300">Profit Target: </span>
                        {options.profitTarget ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-300">Leverage: </span>
                        {options.leverage ?? "—"}
                      </div>

                      {/* broker_account como objeto */}
                      <div>
                        <span className="font-semibold text-yellow-300">Broker Account: </span>
                        {options.brokerAccount ? (
                          <div className="ml-4 mt-1">
                            <div>Login: {options.brokerAccount.login}</div>
                            <div>Password: {options.brokerAccount.password}</div>
                            <div>Balance: {options.brokerAccount.balance}</div>
                            <div>Server: {options.brokerAccount.server}</div>
                            <div>Platform: {options.brokerAccount.platform}</div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </div>
                      {/* Otros campos de subcat con fecha formateada */}
                      <div>
                        <span className="font-semibold text-yellow-300">Fecha de creación: </span>
                        {formatDate(options.createdAt)}
                      </div>
                      <div>
                        <span className="font-semibold text-yellow-300">Fecha de actualización: </span>
                        {formatDate(options.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
