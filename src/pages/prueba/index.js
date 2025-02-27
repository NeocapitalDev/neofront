"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // o "next/router" en Next.js 12
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/24/outline";

/**
 * Wizard:
 * 1) Steps (por name; filtra internamente por step.documentId)
 * 2) Subcategories (por name; filtra internamente por subcat.documentId)
 * 3) Products (obtenidos directamente desde la subcategoría, es decir, subcat.challenge_products)
 * 4) Stages (del step => challenge_stages)
 *
 * - Si la lista está vacía => "No hay X" + icono "+" en la misma fila.
 * - Si la lista NO está vacía => se listan en la misma fila y, al final, un icono "+".
 * - No mostramos documentId en la UI, solo el name.
 */
export default function StepSubcatAutoShowNoResumen() {
  const router = useRouter();

  // --- Colecciones ---
  const [steps, setSteps] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [products, setProducts] = useState([]); // Si se requiere algo específico, aunque ahora se obtiene desde subcats.
  const [stages, setStages] = useState([]);

  // --- Selecciones (internamente docId, en UI => name) ---
  const [selectedStepDoc, setSelectedStepDoc] = useState(null);
  const [selectedSubcatDoc, setSelectedSubcatDoc] = useState(null);

  // --- Cargar data al montar ---
  useEffect(() => {
    async function loadAll() {
      try {
        // 1) Steps
        const stepsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-steps?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!stepsRes.ok) throw new Error("Error al cargar Steps");
        const stepsJson = await stepsRes.json();

        // 2) Subcats
        const subRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-subcategories?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!subRes.ok) throw new Error("Error al cargar Subcats");
        const subJson = await subRes.json();

        // 3) Products (si es necesario cargar todos por separado)
        const prodRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-products?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!prodRes.ok) throw new Error("Error al cargar Products");
        const prodJson = await prodRes.json();

        // 4) Stages
        const stgRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-stages?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!stgRes.ok) throw new Error("Error al cargar Stages");
        const stgJson = await stgRes.json();

        setSteps(stepsJson.data || []);
        setSubcats(subJson.data || []);
        setProducts(prodJson.data || []);
        setStages(stgJson.data || []);

        console.log("Steps =>", stepsJson.data);
        console.log("Subcats =>", subJson.data);
        console.log("Products =>", prodJson.data);
        console.log("Stages =>", stgJson.data);
      } catch (err) {
        console.error("loadAll error:", err);
      }
    }
    loadAll();
  }, []);

  // --- Reset subcat cuando cambie Step ---
  useEffect(() => {
    setSelectedSubcatDoc(null);
  }, [selectedStepDoc]);

  // Manejo de click en icono "+"
  function handlePlusClick() {
    // Redirige a /admin/steps o la ruta correspondiente para agregar nuevos items
    router.push("/admin/steps");
  }

  // ========== STEPS: { doc, name } ==========
  const stepOptions = steps
    .filter((s) => s.documentId)
    .map((s) => ({
      doc: s.documentId,
      name: s.name || "Step sin nombre",
    }));

  // ========== SUBCATS: { doc, name }, filtrada por StepDoc ==========
  let subcatOptions = [];
  if (selectedStepDoc) {
    const subcatsForStep = subcats.filter((sc) => {
      const st = sc.challenge_step;
      return st && st.documentId === selectedStepDoc;
    });
    subcatOptions = subcatsForStep
      .filter((sc) => sc.documentId)
      .map((sc) => ({
        doc: sc.documentId,
        name: sc.name || "Subcat sin nombre",
      }));
  }

  // ========== STAGES: si step.challenge_stages ==========
  let stageList = [];
  if (selectedStepDoc) {
    const stepObj = steps.find((st) => st.documentId === selectedStepDoc);
    if (stepObj && stepObj.challenge_stages) {
      stageList = stepObj.challenge_stages;
    }
  }

  // -----------------------------------------------
  // 1) Definir la subcategoría seleccionada global
  // -----------------------------------------------
  let selectedSubcat = null;
  if (selectedSubcatDoc) {
    selectedSubcat = subcats.find((sc) => sc.documentId === selectedSubcatDoc);
  }

  // ========== PRODUCTS: directamente desde la Subcategory ==========
  let productList = [];
  if (selectedSubcat) {
    productList = selectedSubcat.challenge_products || [];
  }

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-yellow-400 text-center">
          Step → Subcategory → (auto) Products & Stages
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
                  {productList && productList.length > 0 ? (
                    <>
                      {productList.map((p) => (
                        <div key={p.id} className="px-4 py-2 bg-zinc-800 rounded">
                          {p.name ?? "Product sin nombre"}
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
                  {stageList && stageList.length > 0 ? (
                    <>
                      {stageList.map((sg) => (
                        <div key={sg.id} className="px-4 py-2 bg-zinc-800 rounded">
                          {sg.name ?? "Stage sin nombre"}
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

        {/* OPCIONAL: Tarjeta para parámetros de la Subcategoría (si los necesitas) */}
{selectedSubcat && (
  <div className="mt-6">
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="text-yellow-400">Parámetros de la Subcategoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-200">
          {/* Nombre de la subcategoría (por si lo quieres mostrar) */}
          <div>
            <span className="font-semibold text-yellow-300">Nombre: </span>
            {selectedSubcat.name ?? "—"}
          </div>

          {/* Ejemplo: minimumTradingDays */}
          <div>
            <span className="font-semibold text-yellow-300">Min Trading Days: </span>
            {selectedSubcat.minimumTradingDays ?? "—"}
          </div>

          {/* Ejemplo: maximumDailyLoss */}
          <div>
            <span className="font-semibold text-yellow-300">Max Daily Loss: </span>
            {selectedSubcat.maximumDailyLoss ?? "—"}
          </div>

          {/* Ejemplo: maximumLoss */}
          <div>
            <span className="font-semibold text-yellow-300">Max Loss: </span>
            {selectedSubcat.maximumLoss ?? "—"}
          </div>

          {/* Ejemplo: profitTarget */}
          <div>
            <span className="font-semibold text-yellow-300">Profit Target: </span>
            {selectedSubcat.profitTarget ?? "—"}
          </div>

          {/* Ejemplo: leverage */}
          <div>
            <span className="font-semibold text-yellow-300">Leverage: </span>
            {selectedSubcat.leverage ?? "—"}
          </div>

          {/* Si broker_account es un objeto, lo mostramos así: */}
          <div>
            <span className="font-semibold text-yellow-300">Broker Account: </span>
            {selectedSubcat.broker_account ? (
              <div className="ml-4 mt-1">
                {/* Ajusta estos campos según los que tengas en tu objeto broker_account */}
                <div>Login: {selectedSubcat.broker_account.login}</div>
                <div>Password: {selectedSubcat.broker_account.password}</div>
                <div>Balance: {selectedSubcat.broker_account.balance}</div>
                <div>Server: {selectedSubcat.broker_account.server}</div>
                <div>Platform: {selectedSubcat.broker_account.platform}</div>
                {/* Agrega las propiedades que necesites */}
              </div>
            ) : (
              "—"
            )}
          </div>

          {/* Agrega más campos si tu subcategoría tiene otros */}
          <div>
            <span className="font-semibold text-yellow-300">Fecha de creación: </span>
            {selectedSubcat.createdAt ?? "—"}
          </div>
          <div>
            <span className="font-semibold text-yellow-300">Fecha de actualización: </span>
            {selectedSubcat.updatedAt ?? "—"}
          </div>
          {/* etc. */}
        </div>
      </CardContent>
    </Card>
  </div>
)}
      </div>
    </div>
  );
}
