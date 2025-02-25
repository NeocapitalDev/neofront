"use client";
import { useState, useEffect } from "react";

/**
 * parseBalanceFromName (opcional, si ChallengeProduct se llama "5k", "10k", etc.)
 */
function parseBalanceFromName(name) {
  if (!name) return NaN;
  const dict = { "5k": 5000, "10k": 10000, "20k": 20000 };
  const clean = name.trim().toLowerCase();
  if (dict[clean] !== undefined) {
    return dict[clean];
  }
  const numeric = clean.replace(/[^\d]/g, "");
  if (!numeric) return NaN;
  const val = parseInt(numeric, 10);
  if (isNaN(val)) return NaN;
  if (clean.includes("k")) {
    return val * 1000;
  }
  return val;
}

export default function MyWizard() {
  // -------------------------------------------------
  // 1. Arrays para Step, Subcategory, Product, Stage, Relations
  // -------------------------------------------------
  const [stepsData, setStepsData] = useState([]);
  const [subcatsData, setSubcatsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [stagesData, setStagesData] = useState([]);
  const [relationsData, setRelationsData] = useState([]); // NUEVO

  // Opcional: broker accounts si parseas "5k" => 5000
  const [brokersData, setBrokersData] = useState([]);

  // -------------------------------------------------
  // 2. Selecciones en el wizard
  // -------------------------------------------------
  const [currentStep, setCurrentStep] = useState(0);

  // Seleccionamos por "name", para no exponer IDs en <option>
  const [selectedStepName, setSelectedStepName] = useState("");
  const [selectedSubcatName, setSelectedSubcatName] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [selectedStageName, setSelectedStageName] = useState("");
  const [selectedBrokerName, setSelectedBrokerName] = useState("");

  // -------------------------------------------------
  // 3. Fetch de Steps (solo id, name)
  // -------------------------------------------------
  useEffect(() => {
    async function fetchSteps() {
      try {
        // Traemos sólo id y name
        const url = `
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-steps?
          fields[0]=id&fields[1]=name
        `.replace(/\s+/g, "");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        });
        if (!res.ok) throw new Error("Error fetching Steps");
        const json = await res.json();

        const arr = (json.data || []).map((item) => {
          const a = item.attributes || {};
          return {
            id: item.id,
            name: a.name || `Step ${item.name}`,
          };
        });
        setStepsData(arr);
        if (arr.length > 0) {
          setSelectedStepName(arr[0].name);
        }
      } catch (err) {
        console.error("fetchSteps error:", err);
      }
    }
    fetchSteps();
  }, []);

  // -------------------------------------------------
  // 4. Fetch de Subcategories (solo id, name)
  // -------------------------------------------------
  useEffect(() => {
    async function fetchSubcats() {
      try {
        const url = `
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-subcategories?
          fields[0]=id&fields[1]=name
        `.replace(/\s+/g, "");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        });
        if (!res.ok) throw new Error("Error fetching Subcategories");
        const json = await res.json();

        const arr = (json.data || []).map((item) => {
          const a = item.attributes || {};
          return {
            id: item.id,
            name: a.name || `Subcat ${item.name}`,
          };
        });
        setSubcatsData(arr);
        if (arr.length > 0) {
          setSelectedSubcatName(arr[0].name);
        }
      } catch (err) {
        console.error("fetchSubcats error:", err);
      }
    }
    fetchSubcats();
  }, []);

  // -------------------------------------------------
  // 5. Fetch de Products (solo id, name)
  // -------------------------------------------------
  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = `
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-products?
          fields[0]=id&fields[1]=name
        `.replace(/\s+/g, "");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        });
        if (!res.ok) throw new Error("Error fetching Products");
        const json = await res.json();

        const arr = (json.data || []).map((item) => {
          const a = item.attributes || {};
          return {
            id: item.id,
            name: a.name || `Product ${item.name}`,
          };
        });
        setProductsData(arr);
        if (arr.length > 0) {
          setSelectedProductName(arr[0].name);
        }
      } catch (err) {
        console.error("fetchProducts error:", err);
      }
    }
    fetchProducts();
  }, []);

  // -------------------------------------------------
  // 6. Fetch de Stages (solo id, name)
  // -------------------------------------------------
  useEffect(() => {
    async function fetchStages() {
      try {
        const url = `
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-stages?
          fields[0]=id&fields[1]=name
        `.replace(/\s+/g, "");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        });
        if (!res.ok) throw new Error("Error fetching Stages");
        const json = await res.json();

        const arr = (json.data || []).map((item) => {
          const a = item.attributes || {};
          return {
            id: item.id,
            name: a.name || `Stage ${item.name}`,
          };
        });
        setStagesData(arr);
        if (arr.length > 0) {
          setSelectedStageName(arr[0].name);
        }
      } catch (err) {
        console.error("fetchStages error:", err);
      }
    }
    fetchStages();
  }, []);

  // -------------------------------------------------
  // 7. NUEVO: Fetch de ChallengeRelationsStage
  // -------------------------------------------------
  // Asumimos que la “ChallengeRelationsStage” 
  // tiene campos como minTradingDays, maxDailyLoss, etc.
  // y relaciones a challenge_step, challenge_subcategory, challenge_stage.
  useEffect(() => {
    async function fetchRelations() {
      try {
        // Ejemplo: traemos ID, minimumTradingDays, maximumDailyLoss, etc.
        // Y poblamos step, subcat, stage con sus ID.
        // Ajusta los nombres si tu modelo es distinto.
        const url = `
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations-stages?
          fields[0]=id
          &fields[1]=minimumTradingDays
          &fields[2]=maximumDailyLoss
          &fields[3]=maximumLoss
          &fields[4]=profitTarget
          &fields[5]=leverage

          &populate[challenge_step][fields][0]=id
          &populate[challenge_subcategory][fields][0]=id
          &populate[challenge_stage][fields][0]=id
        `.replace(/\s+/g, "");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        });
        if (!res.ok) throw new Error("Error fetching ChallengeRelationsStage");
        const json = await res.json();

        const arr = (json.data || []).map((item) => {
          const a = item || {};

          // step
          let stepId = null;
          if (a.challenge_step?.data) {
            stepId = a.challenge_step.data.id;
          }

          // subcat
          let subcatId = null;
          if (a.challenge_subcategory?.data) {
            subcatId = a.challenge_subcategory.data.id;
          }

          // stage
          let stageId = null;
          if (a.challenge_stage?.data) {
            stageId = a.challenge_stage.data.id;
          }

          return {
            id: item.id,
            minimumTradingDays: a.minimumTradingDays ?? 0,
            maximumDailyLoss: a.maximumDailyLoss ?? 0,
            maximumLoss: a.maximumLoss ?? 0,
            profitTarget: a.profitTarget ?? 0,
            leverage: a.leverage ?? "1:100",
            stepId,
            subcatId,
            stageId,
          };
        });
        setRelationsData(arr);
      } catch (err) {
        console.error("fetchRelations error:", err);
      }
    }
    fetchRelations();
  }, []);

  // -------------------------------------------------
  // 8. Broker parse (opcional)
  // -------------------------------------------------
  useEffect(() => {
    if (!selectedProductName) {
      setBrokersData([]);
      setSelectedBrokerName("");
      return;
    }
    const balanceRequired = parseBalanceFromName(selectedProductName);
    if (isNaN(balanceRequired)) {
      console.warn("No se pudo parsear productName:", selectedProductName);
      setBrokersData([]);
      setSelectedBrokerName("");
      return;
    }

    async function fetchBrokers() {
      try {
        const url = `
          ${process.env.NEXT_PUBLIC_BACKEND_URL}/api/broker-accounts?
          filters[used][$eq]=false&
          filters[balance][$eq]=${balanceRequired}
        `.replace(/\s+/g, "");

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}` },
        });
        if (!res.ok) throw new Error("Error fetching Brokers");
        const json = await res.json();

        const arr = (json.data || []).map((item) => {
          const a = item || {};
          return {
            id: item.id,
            name: a.login || `Broker${item.login}`,
            balance: a.balance || 0,
            used: a.used || false,
          };
        });
        setBrokersData(arr);
        if (arr.length > 0) {
          setSelectedBrokerName(arr[0].name);
        }
      } catch (err) {
        console.error("fetchBrokers error:", err);
      }
    }
    fetchBrokers();
  }, [selectedProductName]);

  // -------------------------------------------------
  // 9. Wizard
  // -------------------------------------------------
  const goNext = () => {
    if (currentStep < 1) setCurrentStep(currentStep + 1);
  };
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // -------------------------------------------------
  // 10. handleSubmit
  // -------------------------------------------------
  const handleSubmit = async () => {
    // Convertimos “name” → “id”
    const stepObj = stepsData.find((s) => s.name === selectedStepName);
    const subcatObj = subcatsData.find((s) => s.name === selectedSubcatName);
    const productObj = productsData.find((p) => p.name === selectedProductName);
    const stageObj = stagesData.find((st) => st.name === selectedStageName);
    const brokerObj = brokersData.find((b) => b.name === selectedBrokerName);

    const payload = {
      data: {
        challenge_step: stepObj?.id,
        challenge_subcategory: subcatObj?.id,
        challenge_product: productObj?.id,
        challenge_stage: stageObj?.id,
        broker_account: brokerObj?.id,
      },
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error creating Challenge");
      const created = await res.json();
      alert(`Challenge creado (ID: ${created.data.id})`);
    } catch (err) {
      console.error("Error al crear Challenge:", err);
    }
  };

  // -------------------------------------------------
  // 11. Render Steps
  // -------------------------------------------------
  const renderStep = () => {
    switch (currentStep) {
      // -------------------------------------------------
      // Paso 0: Selección
      // -------------------------------------------------
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Selección de Campos</h2>

            {/* Step */}
            <div>
              <label className="block mb-1">Challenge Step</label>
              <select
                className="w-full p-2 bg-gray-700"
                value={selectedStepName}
                onChange={(e) => setSelectedStepName(e.target.value)}
              >
                {stepsData.map((step) => (
                  <option key={step.id} value={step.name}>
                    {step.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block mb-1">Challenge Subcategory</label>
              <select
                className="w-full p-2 bg-gray-700"
                value={selectedSubcatName}
                onChange={(e) => setSelectedSubcatName(e.target.value)}
              >
                {subcatsData.map((sc) => (
                  <option key={sc.id} value={sc.name}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="block mb-1">Challenge Product</label>
              <select
                className="w-full p-2 bg-gray-700"
                value={selectedProductName}
                onChange={(e) => setSelectedProductName(e.target.value)}
              >
                {productsData.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block mb-1">Challenge Stage</label>
              <select
                className="w-full p-2 bg-gray-700"
                value={selectedStageName}
                onChange={(e) => setSelectedStageName(e.target.value)}
              >
                {stagesData.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Broker (opcional) */}
            <div>
              <label className="block mb-1">Broker Account</label>
              <select
                className="w-full p-2 bg-gray-700"
                value={selectedBrokerName}
                onChange={(e) => setSelectedBrokerName(e.target.value)}
              >
                {brokersData.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} (balance={b.balance}, used={b.used ? "TRUE" : "FALSE"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      // -------------------------------------------------
      // Paso 1: Confirmación
      // -------------------------------------------------
      case 1: {
        // Buscamos ID en arrays
        const stepObj = stepsData.find((s) => s.name === selectedStepName);
        const subcatObj = subcatsData.find((s) => s.name === selectedSubcatName);
        const productObj = productsData.find((p) => p.name === selectedProductName);
        const stageObj = stagesData.find((st) => st.name === selectedStageName);
        const brokerObj = brokersData.find((b) => b.name === selectedBrokerName);

        // AHORA: Buscamos si hay un ChallengeRelationsStage que coincida
        // con stepObj.id, subcatObj.id, stageObj.id
        const matchingRelation = relationsData.find((rel) => {
          return (
            rel.stepId === stepObj?.id &&
            rel.subcatId === subcatObj?.id &&
            rel.stageId === stageObj?.id
          );
        });

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">2. Confirmación</h2>

            <div className="bg-gray-800 p-3 rounded space-y-2">
              <h3 className="text-yellow-300 font-bold">Selección</h3>
              <p>Step: {selectedStepName} (ID: {stepObj?.id})</p>
              <p>Subcategory: {selectedSubcatName} (ID: {subcatObj?.id})</p>
              <p>Product: {selectedProductName} (ID: {productObj?.id})</p>
              <p>Stage: {selectedStageName} (ID: {stageObj?.id})</p>
              <p>Broker: {selectedBrokerName} (ID: {brokerObj?.id})</p>
            </div>

            {/* Muestra la info de la RelationStage si existe */}
            <div className="bg-gray-800 p-3 rounded space-y-2">
              <h3 className="text-yellow-300 font-bold">ChallengeRelationsStage (Filtrado)</h3>
              {matchingRelation ? (
                <>
                  <p>ID: {matchingRelation.id}</p>
                  <p>Min Trading Days: {matchingRelation.minimumTradingDays}</p>
                  <p>Max Daily Loss: {matchingRelation.maximumDailyLoss}</p>
                  <p>Max Loss: {matchingRelation.maximumLoss}</p>
                  <p>Profit Target: {matchingRelation.profitTarget}</p>
                  <p>Leverage: {matchingRelation.leverage}</p>
                </>
              ) : (
                <p className="text-gray-400">
                  No hay un ChallengeRelationsStage que coincida con la selección
                </p>
              )}
            </div>
          </div>
        );
      }

      default:
        return <div>ERROR</div>;
    }
  };

  // -------------------------------------------------
  // 12. Render principal
  // -------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Barra de pasos */}
        <div className="flex space-x-2 justify-center mb-4">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full ${
                idx <= currentStep ? "bg-yellow-400" : "bg-gray-600"
              }`}
            />
          ))}
        </div>

        <div className="bg-gray-800 p-4 rounded">{renderStep()}</div>

        <div className="flex justify-between">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded ${
              currentStep === 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Atrás
          </button>
          {currentStep < 1 ? (
            <button
              onClick={goNext}
              className="px-4 py-2 rounded bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-green-500 text-black hover:bg-green-400"
            >
              Crear Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
