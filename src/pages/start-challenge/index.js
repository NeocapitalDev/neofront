"use client";

import { useStrapiData } from "../../services/strapiService";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// Iconos
import { CheckIcon, ChevronRightIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ChallengeRelations() {
  const router = useRouter();
  const { data: relations, error, isLoading } = useStrapiData("challenge-relations?populate=*");

  // --- Estados para manejar las selecciones ---
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Procesar los datos para obtener steps únicos y sus relaciones
  const stepsData = relations
    ? [...new Set(relations.map((relation) => relation.challenge_step.name))].map((stepName) => ({
        step: stepName,
        relations: relations.filter((relation) => relation.challenge_step.name === stepName),
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
        const firstActiveProduct = firstRelationProducts.find((product) => product.isActive !== false);
        if (firstActiveProduct) {
          setSelectedProduct(firstActiveProduct);
        }
      }
    }
  }, [stepsData]);

  // Función para manejar el envío del formulario y la navegación al siguiente paso
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedProduct) {
      // Enriquecemos el producto con propiedades adicionales para la página de revisión
      const productDetails = {
        ...selectedProduct,
        // Valores por defecto si no existen
        profitTarget: selectedProduct.profitTarget || 20,
        minTradingDays: selectedProduct.minTradingDays || 10,
        dailyDrawdown: selectedProduct.dailyDrawdown || 5,
        maxLoss: selectedProduct.maxLoss || 10,
        phasePeriod: selectedProduct.phasePeriod || "Unlimited",
        price: selectedProduct.precio || 3500.00
      };
      
      // Guardamos en localStorage para recuperarlo en la página de revisión
      localStorage.setItem('selectedProduct', JSON.stringify(productDetails));
      
      // Navegamos a la página de revisión
      router.push('/start-challenge/review');
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-black"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div></div>;
  if (error) return <div className="flex justify-center items-center h-screen bg-black text-red-500">Error: {error.message}</div>;

  // --- Handlers para clicks ---
  const handleStepClick = (step) => {
    setSelectedStep(step);

    // Verificamos subcategoría y producto al cambiar de step
    const stepRelations = stepsData.find((item) => item.step === step).relations;
    if (stepRelations.length > 0) {
      const validSubcategories = stepRelations.map((r) => r.challenge_subcategory.name);

      if (!validSubcategories.includes(selectedSubcategory)) {
        // Forzar la subcategoría al primer item
        setSelectedSubcategory(stepRelations[0].challenge_subcategory.name);

        // Seleccionar primer producto activo
        const firstRelationProducts = stepRelations[0].challenge_products;
        const firstActiveProduct = firstRelationProducts.find((product) => product.isActive !== false);
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
    const stepRelations = stepsData.find((item) => item.step === selectedStep).relations;
    const relation = stepRelations.find((r) => r.challenge_subcategory.name === subcategory);
    if (relation && relation.challenge_products.length > 0) {
      const firstActiveProduct = relation.challenge_products.find((product) => product.isActive !== false);
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header similar a ImpulseWorld pero con colores de Neocapital */}
      <header>
        <section className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/">
            <Image src="/images/logo-dark.png" alt="Neocapital logo" width={236} height={60} className="h-10 w-auto" />
          </Link>
        </section>
        <section className="bg-zinc-900 border-b border-zinc-800">
          <div className="container mx-auto px-4 py-4">
            <h2 className="text-2xl font-bold text-amber-400">Compra tu producto</h2>
            <div className="flex items-center mt-4 mb-2">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black font-bold">1</span>
                <span className="ml-2 text-amber-100">Configura tu producto</span>
              </div>
              <div className="h-[2px] w-12 bg-zinc-700 mx-4"></div>
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 font-bold">2</span>
              </div>
              {/*
              <div className="h-[2px] w-12 bg-zinc-700 mx-4"></div>
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 font-bold">3</span>
              </div>
              */}
            </div>
          </div>
        </section>
      </header>

      {/* Contenido principal con layout de dos columnas como ImpulseWorld */}
      <form onSubmit={handleSubmit}>
        <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Configuración */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Steps Section */}
            <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
              <div className="flex items-center mb-3">
                <h3 className="text-amber-400 font-medium">Steps</h3>
                <div className="relative ml-2 group">
                  <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                  <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                    Selecciona el paso del proceso que deseas configurar
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4 text-sm">Selecciona el tipo de paso que deseas configurar.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stepsData.map((item, index) => (
                  <div key={index} className="relative">
                    <input
                      type="radio"
                      id={`step-${index}`}
                      name="step"
                      checked={selectedStep === item.step}
                      onChange={() => handleStepClick(item.step)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`step-${index}`}
                      className={classNames(
                        "block p-4 rounded-lg border cursor-pointer transition-all",
                        selectedStep === item.step
                          ? "bg-zinc-800 border-amber-500 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                      )}
                    >
                      <div className="product-info">
                        <span className="block font-medium">{item.step}</span>
                        <span className="block text-xs mt-1 text-zinc-500">
                          {item.relations.length} opciones
                        </span>
                      </div>
                      {selectedStep === item.step && (
                        <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* Subcategorías Section */}
            {selectedStep && (
              <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
                <div className="flex items-center mb-3">
                  <h3 className="text-amber-400 font-medium">Subcategorías</h3>
                  <div className="relative ml-2 group">
                    <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                    <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                      Elige la subcategoría para tu producto
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 mb-4 text-sm">
                  Selecciona la subcategoría para el paso {selectedStep}.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {stepsData
                    .find((item) => item.step === selectedStep)
                    .relations.map((relation, index) => (
                      <div key={index} className="relative">
                        <input
                          type="radio"
                          id={`subcategory-${index}`}
                          name="subcategory"
                          checked={selectedSubcategory === relation.challenge_subcategory.name}
                          onChange={() => handleSubcategoryClick(relation.challenge_subcategory.name)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`subcategory-${index}`}
                          className={classNames(
                            "block p-4 rounded-lg border cursor-pointer transition-all",
                            selectedSubcategory === relation.challenge_subcategory.name
                              ? "bg-zinc-800 border-amber-500 text-white"
                              : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                          )}
                        >
                          <span className="block font-medium">{relation.challenge_subcategory.name}</span>
                          {selectedSubcategory === relation.challenge_subcategory.name && (
                            <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                          )}
                        </label>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Productos Section */}
            {selectedSubcategory && (
              <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
                <div className="flex items-center mb-3">
                  <h3 className="text-amber-400 font-medium">Productos</h3>
                  <div className="relative ml-2 group">
                    <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                    <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                      Selecciona el producto que deseas adquirir
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 mb-4 text-sm">
                  Elige el producto para {selectedSubcategory}.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(() => {
                    // Ubicamos la relación actual
                    const stepRelations = stepsData.find(
                      (item) => item.step === selectedStep
                    ).relations;
                    const selectedRelation = stepRelations.find(
                      (r) => r.challenge_subcategory.name === selectedSubcategory
                    );

                    if (
                      selectedRelation &&
                      selectedRelation.challenge_products.length > 0
                    ) {
                      return selectedRelation.challenge_products.map(
                        (product, productIndex) => (
                          <div key={`${selectedRelation.id}-${productIndex}`} className="relative">
                            <input
                              type="radio"
                              id={`product-${productIndex}`}
                              name="product"
                              disabled={product.isActive === false}
                              checked={selectedProduct && selectedProduct.name === product.name}
                              onChange={() => handleProductClick(product)}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`product-${productIndex}`}
                              className={classNames(
                                "block p-4 rounded-lg border cursor-pointer transition-all",
                                product.isActive === false
                                  ? "bg-zinc-800 border-zinc-700 text-zinc-600 opacity-50 cursor-not-allowed"
                                  : selectedProduct && selectedProduct.name === product.name
                                  ? "bg-zinc-800 border-amber-500 text-white"
                                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                              )}
                            >
                              <span className="block font-medium">{product.name}</span>
                              {product.isPremium && (
                                <span className="inline-block bg-amber-500 text-black text-xs px-2 py-1 rounded mt-2 font-semibold">
                                  Premium
                                </span>
                              )}
                              {selectedProduct && selectedProduct.name === product.name && (
                                <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                              )}
                            </label>
                          </div>
                        )
                      );
                    } else {
                      return (
                        <p className="text-zinc-500 col-span-3">
                          No hay productos disponibles para esta subcategoría
                        </p>
                      );
                    }
                  })()}
                </div>
              </section>
            )}
          </div>

          {/* Columna derecha - Resumen del producto */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-zinc-900 rounded-lg shadow-md border border-zinc-800 overflow-hidden">
              <header className="p-5 border-b border-zinc-800">
                <h3 className="text-amber-400 font-medium mb-1">Tu producto es:</h3>
                {selectedProduct ? (
                  <>
                    <p className="text-xl font-bold text-white">{selectedProduct.name}</p>
                    {selectedProduct.balance && (
                      <span className="block text-sm text-zinc-400 mt-1">
                        {selectedProduct.balance} USD
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-500">Ningún producto seleccionado</p>
                )}
              </header>

              {selectedProduct && (
                <>
                  <section className="p-5 border-b border-zinc-800">
                    <h4 className="text-amber-400 font-medium mb-3">Características:</h4>
                    <ul className="space-y-3">
                      {selectedProduct.profitTarget && (
                        <li className="flex items-center text-sm">
                          <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-zinc-400">Profit Target:</span>
                          <strong className="ml-auto text-white">{selectedProduct.profitTarget}%</strong>
                        </li>
                      )}
                      {selectedProduct.minTradingDays && (
                        <li className="flex items-center text-sm">
                          <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-zinc-400">Mínimo de días operados:</span>
                          <strong className="ml-auto text-white">{selectedProduct.minTradingDays} días</strong>
                        </li>
                      )}
                      {selectedProduct.dailyDrawdown && (
                        <li className="flex items-center text-sm">
                          <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-zinc-400">Drawdown diario:</span>
                          <strong className="ml-auto text-white">{selectedProduct.dailyDrawdown}%</strong>
                        </li>
                      )}
                      {selectedProduct.maxLoss && (
                        <li className="flex items-center text-sm">
                          <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-zinc-400">Pérdida máxima:</span>
                          <strong className="ml-auto text-white">{selectedProduct.maxLoss}%</strong>
                        </li>
                      )}
                      <li className="flex items-center text-sm">
                        <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-zinc-400">Periodo fase única:</span>
                        <strong className="ml-auto text-white">
                          {selectedProduct.phasePeriod || "Unlimited"}
                        </strong>
                      </li>
                    </ul>
                  </section>

                  <div className="p-5 border-b border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400">Precio</span>
                      <p className="text-xl font-bold text-amber-400">
                        ${selectedProduct.precio || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <button
                      type="submit"
                      disabled={!selectedProduct}
                      className={`w-full flex items-center justify-center transition-colors py-3 px-4 rounded ${
                        selectedProduct
                          ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                          : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      <span className="uppercase">Continuar</span>
                      <ChevronRightIcon className="h-5 w-5 ml-2" />
                    </button>
                    <p className="text-xs text-zinc-500 mt-3 text-center">
                      *Precio no incluye tarifa de servicio de pago.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}