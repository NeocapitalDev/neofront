"use client"; // Si lo necesitas en Next.js (App Router)

import { useStrapiData } from "../../services/strapiService";
import { useState, useEffect } from "react";

// IMPORTA TUS COMPONENTES DE UI (si los usas)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Función sencilla para concatenar clases condicionalmente
 * (si no usas `clsx` o `cn`).
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ChallengeRelations = () => {
  const { data: relations, error, isLoading } = useStrapiData(
    "challenge-relations?populate=*"
  );

  // --- Estados para manejar las selecciones ---
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // Objeto completo del producto

  // Procesar los datos para obtener steps únicos y sus relaciones
  const stepsData = relations
    ? [
        ...new Set(relations.map((relation) => relation.challenge_step.name)),
      ].map((stepName) => ({
        step: stepName,
        relations: relations.filter(
          (relation) => relation.challenge_step.name === stepName
        ),
      }))
    : [];

  // Seleccionar el primer step, subcategoría y producto activo por defecto
  useEffect(() => {
    if (stepsData.length > 0 && selectedStep === null) {
      const firstStep = stepsData[0].step;
      setSelectedStep(firstStep);

      // Primera subcategoría
      const firstStepRelations = stepsData[0].relations;
      if (firstStepRelations.length > 0) {
        setSelectedSubcategory(firstStepRelations[0].challenge_subcategory.name);

        // Primer producto ACTIVO
        const firstRelationProducts = firstStepRelations[0].challenge_products;
        const firstActiveProduct = firstRelationProducts.find(
          (product) => product.isActive !== false
        );
        if (firstActiveProduct) {
          setSelectedProduct(firstActiveProduct);
        }
      }
    }
  }, [stepsData]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // --- Handlers para clicks ---
  const handleStepClick = (step) => {
    setSelectedStep(step);

    // Verificamos subcategoría y producto al cambiar de step
    const stepRelations = stepsData.find((item) => item.step === step).relations;
    if (stepRelations.length > 0) {
      const validSubcategories = stepRelations.map(
        (r) => r.challenge_subcategory.name
      );

      if (!validSubcategories.includes(selectedSubcategory)) {
        // Forzar la subcategoría al primer item
        setSelectedSubcategory(stepRelations[0].challenge_subcategory.name);

        // Seleccionar primer producto activo
        const firstRelationProducts = stepRelations[0].challenge_products;
        const firstActiveProduct = firstRelationProducts.find(
          (product) => product.isActive !== false
        );
        if (firstActiveProduct) {
          setSelectedProduct(firstActiveProduct);
        } else {
          setSelectedProduct(null);
        }
      }
    } else {
      setSelectedSubcategory(null);
      setSelectedProduct(null);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);

    // Al cambiar la subcategoría, seleccionar primer producto activo
    const stepRelations = stepsData.find(
      (item) => item.step === selectedStep
    ).relations;
    const relation = stepRelations.find(
      (r) => r.challenge_subcategory.name === subcategory
    );
    if (relation && relation.challenge_products.length > 0) {
      const firstActiveProduct = relation.challenge_products.find(
        (product) => product.isActive !== false
      );
      if (firstActiveProduct) {
        setSelectedProduct(firstActiveProduct);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  };

  const handleProductClick = (product) => {
    if (product.isActive !== false) {
      setSelectedProduct(product);
    }
  };

  // ------------------------------------------------------------------
  // DISEÑO: Usamos un contenedor con fondo degradado y texto claro
  //         Agrupamos cada sección en un Card, usando colores oscuros.
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-black via-zinc-900 to-black text-yellow-100">
      <div className="max-w-5xl mx-auto space-y-8">


        {/* Card: Steps */}
        <Card className="bg-zinc-900 rounded-lg shadow-md p-4">
          <CardHeader>
            <CardTitle className="text-amber-400">Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-6">
              {stepsData.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(item.step)}
                  className="focus:outline-none"
                >
                  <div
                    className={classNames(
                      "p-4 rounded-lg shadow-md text-center min-w-[120px] transition-transform duration-100",
                      selectedStep === item.step
                        ? "bg-amber-500 text-black scale-95"
                        : "bg-zinc-800 hover:bg-zinc-700 text-yellow-100 hover:scale-95"
                    )}
                  >
                    {item.step}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card: Subcategorías (solo si hay Step seleccionado) */}
        {selectedStep && stepsData.length > 0 && (
          <Card className="bg-zinc-900 rounded-lg shadow-md p-4">
            <CardHeader>
              <CardTitle className="text-amber-400">
                Subcategories for {selectedStep}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-6">
                {stepsData
                  .find((item) => item.step === selectedStep)
                  .relations.map((relation, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleSubcategoryClick(
                          relation.challenge_subcategory.name
                        )
                      }
                      className="focus:outline-none"
                    >
                      <div
                        className={classNames(
                          "p-4 rounded-lg shadow-md text-center min-w-[120px] transition-transform duration-100",
                          selectedSubcategory ===
                            relation.challenge_subcategory.name
                            ? "bg-amber-500 text-black scale-95"
                            : "bg-zinc-800 hover:bg-zinc-700 text-yellow-100 hover:scale-95"
                        )}
                      >
                        {relation.challenge_subcategory.name}
                      </div>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card: Productos (solo si hay Subcategoría seleccionada) */}
        {selectedSubcategory && (
          <Card className="bg-zinc-900 rounded-lg shadow-md p-4">
            <CardHeader>
              <CardTitle className="text-amber-400">
                Products for {selectedSubcategory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-6">
                {(() => {
                  // Ubicamos la relación actual
                  const stepRelations = stepsData.find(
                    (item) => item.step === selectedStep
                  ).relations;
                  const selectedRelation = stepRelations.find(
                    (r) =>
                      r.challenge_subcategory.name === selectedSubcategory
                  );

                  if (
                    selectedRelation &&
                    selectedRelation.challenge_products.length > 0
                  ) {
                    return selectedRelation.challenge_products.map(
                      (product, productIndex) => (
                        <div
                          key={`${selectedRelation.id}-${productIndex}`}
                          className={classNames(
                            "p-4 rounded-lg shadow-md text-center min-w-[120px] transition-transform duration-100",
                            product.isActive !== false
                              ? selectedProduct &&
                                selectedProduct.name === product.name
                                ? "bg-amber-500 text-black scale-95 cursor-pointer"
                                : "bg-zinc-800 hover:bg-zinc-700 text-yellow-100 hover:scale-95 cursor-pointer"
                              : "bg-gray-400 text-gray-700 cursor-not-allowed"
                          )}
                          onClick={() =>
                            product.isActive !== false &&
                            handleProductClick(product)
                          }
                        >
                          {product.name}
                        </div>
                      )
                    );
                  } else {
                    return (
                      <p className="text-gray-400">
                        No products available for this subcategory
                      </p>
                    );
                  }
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card: Producto seleccionado y su precio */}
        {selectedProduct && (
          <Card className="bg-zinc-900 rounded-lg shadow-md p-4">
            <CardHeader>
              <CardTitle className="text-amber-400">Selected Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedProduct.name}
                </h3>
                <p className="text-2xl font-bold text-green-400">
                  Price: $
                  {selectedProduct.precio ? selectedProduct.precio : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChallengeRelations;
