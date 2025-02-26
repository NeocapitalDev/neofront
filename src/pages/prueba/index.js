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
 * 3) Products (obtenidos de "relations" => subcatDoc)
 * 4) Stages (del step => challenge_stages)
 *
 * - Si la lista está vacía => "No hay X" + icono "+" en la misma fila
 * - Si la lista NO está vacía => se listan en la misma fila y, al final, un icono "+"
 * - No mostramos documentId en la UI, solo el name.
 */
export default function StepSubcatAutoShowNoResumen() {
  const router = useRouter();

  // --- Colecciones ---
  const [steps, setSteps] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [relations, setRelations] = useState([]);

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

        // 3) Products
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

        // 5) Relations
        const relRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations-stages?populate=*`,
          { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` } }
        );
        if (!relRes.ok) throw new Error("Error al cargar Relations");
        const relJson = await relRes.json();

        setSteps(stepsJson.data || []);
        setSubcats(subJson.data || []);
        setProducts(prodJson.data || []);
        setStages(stgJson.data || []);
        setRelations(relJson.data || []);

        console.log("Steps =>", stepsJson.data);
        console.log("Subcats =>", subJson.data);
        console.log("Products =>", prodJson.data);
        console.log("Stages =>", stgJson.data);
        console.log("Relations =>", relJson.data);
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
    // Redirige a /admin/relations/new
    router.push("/admin/relations/new");
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

  // ========== PRODUCTS: relations => subcatDoc => relItem.challenge_products ==========
  let productList = [];
  let relItem = null;
  if (selectedSubcatDoc) {
    relItem = relations.find((rel) => {
      const csc = rel.challenge_subcategory;
      return csc && csc.documentId === selectedSubcatDoc;
    });
    if (relItem) {
      productList = relItem.challenge_products || [];
    }
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
            // Lista vacía => "No hay Steps" + icono "+" en la misma fila
            <>
              <span className="text-gray-400">No hay Steps</span>
              <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </>
          ) : (
            // Lista con datos => items + icono "+" al final
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
              <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
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
                <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
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
                <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* ================== 3) PRODUCTS & STAGES ================== */}
        {selectedSubcatDoc && (
          <div className="space-y-4 mt-4">
            {/* PRODUCTS */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Products Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {relItem ? (
                    relItem.challenge_products && relItem.challenge_products.length > 0 ? (
                      <>
                        {relItem.challenge_products.map((p) => (
                          <div key={p.id} className="px-4 py-2 bg-zinc-800 rounded">
                            {p.name ?? "Product sin nombre"}
                          </div>
                        ))}
                        <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400">No hay Products en la relación</span>
                        <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </>
                    )
                  ) : (
                    <>
                      <span className="text-gray-400">
                        No existe "challenge-relations-stage" para esta Subcat
                      </span>
                      <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* STAGES */}
            <Card className="bg-zinc-900 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Stages Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  {stageList.length > 0 ? (
                    <>
                      {stageList.map((sg) => (
                        <div key={sg.id} className="px-4 py-2 bg-zinc-800 rounded">
                          {sg.name ?? "Stage sin nombre"}
                        </div>
                      ))}
                      <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400">No hay Stages para este Step</span>
                      <Button onClick={handlePlusClick} className="bg-red-500 hover:bg-red-400 flex items-center gap-1">
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
