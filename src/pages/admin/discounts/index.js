// src/pages/admin/discounts/index.js
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Pencil, AlertCircle } from "lucide-react";
import DashboardLayout from "..";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from 'sonner';

export default function DiscountsManager() {
  const { data: session } = useSession();
  const [stepsData, setStepsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [selectedSubcatIndex, setSelectedSubcatIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountDescription, setDiscountDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset subcategoría cuando cambie el Step
  useEffect(() => {
    setSelectedSubcatIndex(null);
    setSelectedProduct(null);
  }, [selectedStepIndex]);

  // Reset producto cuando cambie la subcategoría
  useEffect(() => {
    setSelectedProduct(null);
  }, [selectedSubcatIndex]);

  // Update discount states when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setDiscountEnabled(selectedProduct.hasDiscount || false);
      setDiscountDescription(selectedProduct.descuento || "");
    } else {
      setDiscountEnabled(false);
      setDiscountDescription("");
    }
  }, [selectedProduct]);

  // Carga de datos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching data...");

        // Using the same populate format that works in visualizador.js
        const stepsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-steps?populate=*`,
          { 
            headers: { 
              Authorization: `Bearer ${session?.jwt || process.env.NEXT_PUBLIC_API_TOKEN}` 
            } 
          }
        );
        if (!stepsRes.ok) throw new Error("Error al cargar Steps");
        const stepsJson = await stepsRes.json();
        const stepsItems = stepsJson.data || [];
        
        console.log("Steps data:", stepsItems);

        // Use simple populate=* instead of the complex nested format
        const relRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations?populate=*`,
          { 
            headers: { 
              Authorization: `Bearer ${session?.jwt || process.env.NEXT_PUBLIC_API_TOKEN}` 
            } 
          }
        );
        if (!relRes.ok) throw new Error("Error al cargar ChallengeRelation");
        const relJson = await relRes.json();
        const relItems = relJson.data || [];
        
        console.log("Relations data:", relItems);

        const productsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-products?populate=*`,
          { 
            headers: { 
              Authorization: `Bearer ${session?.jwt || process.env.NEXT_PUBLIC_API_TOKEN}` 
            } 
          }
        );
        if (!productsRes.ok) throw new Error("Error al cargar ChallengeProducts");
        const productsJson = await productsRes.json();
        const productsItems = productsJson.data || [];
        
        console.log("Products data:", productsItems);
        
        const subcatsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-subcategories?populate=*`,
          { 
            headers: { 
              Authorization: `Bearer ${session?.jwt || process.env.NEXT_PUBLIC_API_TOKEN}` 
            } 
          }
        );
        if (!subcatsRes.ok) throw new Error("Error al cargar Subcategories");
        const subcatsJson = await subcatsRes.json();
        const subcatsItems = subcatsJson.data || [];
        
        console.log("Subcategories data:", subcatsItems);

        // Estructura reorganizada usando la misma lógica que en visualizador.js
        const organizedData = organizarDatos(stepsItems, relItems, productsItems, subcatsItems);
        console.log("Organized data:", organizedData);
        setStepsData(organizedData);

        // Seleccionar el primer step por defecto si hay datos
        if (organizedData.length > 0) {
          setSelectedStepIndex(0);
        }

        setLoading(false);
      } catch (error) {
        console.error("loadData error:", error);
        setError(error.message);
        setLoading(false);
      }
    }

    if (session?.jwt || process.env.NEXT_PUBLIC_API_TOKEN) {
      loadData();
    }
  }, [session]);

  // Función para organizar datos en la estructura deseada
  function organizarDatos(steps, relations, products, subcategories) {
    // Primero, agrupamos steps por nombre para combinar los que son iguales
    const stepsByName = {};
  
    steps.forEach(step => {
      // Get the step data regardless of structure format
      const stepId = step.id;
      const stepName = step.attributes?.name || step.name;
      
      if (!stepsByName[stepName]) {
        stepsByName[stepName] = {
          step: {
            id: stepId,
            name: stepName,
          },
          subcategories: [],
          relations: []
        };
      }
    });
  
    // Procesamos las relaciones
    relations.forEach(relation => {
      // Get challenge_step, handling both flattened and nested structures
      let stepObj = null;
      let challengeStep = null;
      
      // Try different data structures
      if (relation.challenge_step) {
        // Flattened structure
        challengeStep = relation.challenge_step;
      } else if (relation.attributes?.challenge_step?.data) {
        // Nested structure with attributes
        challengeStep = relation.attributes.challenge_step.data;
      }
      
      if (!challengeStep) {
        console.log("Relación sin step detectada:", relation.id);
        return;
      }
      
      // Get step name, handling both structures
      const stepName = challengeStep.attributes?.name || challengeStep.name;
      
      // Find the corresponding step object
      stepObj = stepsByName[stepName];
      if (!stepObj) {
        console.log(`Step no encontrado para relación: ${stepName}`);
        return;
      }
      
      // Store the relation
      stepObj.relations.push(relation);
      
      // Process subcategory
      let subcategory = null;
      
      if (relation.challenge_subcategory) {
        // Flattened structure
        subcategory = relation.challenge_subcategory;
      } else if (relation.attributes?.challenge_subcategory?.data) {
        // Nested structure
        subcategory = relation.attributes.challenge_subcategory.data;
      }
      
      if (subcategory) {
        const subcatId = subcategory.id;
        const subcatName = subcategory.attributes?.name || subcategory.name;
        
        // Check if this subcategory already exists
        let existingSubcat = stepObj.subcategories.find(sc => sc.id === subcatId);
        
        if (!existingSubcat) {
          existingSubcat = {
            id: subcatId,
            name: subcatName || "Subcategoría sin nombre",
            products: []
          };
          stepObj.subcategories.push(existingSubcat);
        }
        
        // Process products
        let productRelations = [];
        
        if (relation.challenge_products) {
          // Flattened structure
          productRelations = relation.challenge_products;
        } else if (relation.attributes?.challenge_products?.data) {
          // Nested structure
          productRelations = relation.attributes.challenge_products.data;
        }
        
        if (Array.isArray(productRelations) && productRelations.length > 0) {
          productRelations.forEach(productRef => {
            const productId = productRef.id;
            const fullProduct = products.find(p => p.id === productId);
            
            /*
            if (fullProduct && !existingSubcat.products.some(p => p.id === productId)) {
              const productName = fullProduct.attributes?.name || fullProduct.name;
              const productPrice = fullProduct.attributes?.precio || fullProduct.precio;
              const productWooId = fullProduct.attributes?.WoocomerceId || fullProduct.WoocomerceId;
              const hasDiscount = fullProduct.attributes?.hasDiscount || fullProduct.hasDiscount || false;
              const descuento = fullProduct.attributes?.descuento || fullProduct.descuento || "";
              
              existingSubcat.products.push({
                id: productId,
                name: productName || "Producto sin nombre",
                precio: productPrice,
                WoocomerceId: productWooId,
                hasDiscount: hasDiscount,
                descuento: descuento
              });
            }
            */

            // Inside the productRelations.forEach loop in organizarDatos:
            if (fullProduct && !existingSubcat.products.some(p => p.id === productId)) {
                const productName = fullProduct.attributes?.name || fullProduct.name;
                const productPrice = fullProduct.attributes?.precio || fullProduct.precio;
                const productWooId = fullProduct.attributes?.WoocomerceId || fullProduct.WoocomerceId;
                const hasDiscount = fullProduct.attributes?.hasDiscount || fullProduct.hasDiscount || false;
                const descuento = fullProduct.attributes?.descuento || fullProduct.descuento || "";
                // Add documentId here
                const documentId = fullProduct.attributes?.documentId || fullProduct.documentId;
                
                existingSubcat.products.push({
                id: productId,
                documentId: documentId, // Include documentId
                name: productName || "Producto sin nombre",
                precio: productPrice,
                WoocomerceId: productWooId,
                hasDiscount: hasDiscount,
                descuento: descuento
                });
            }

          });
        }
      }
    });
  
    return Object.values(stepsByName);
  }

  // Guardar cambios de descuento
  const saveProductDiscount = async () => {
    if (!selectedProduct || !session?.jwt) {
      toast.error("No hay producto seleccionado o no existe sesión.");
      return;
    }
  
    try {
      setSaving(true);
      
      // Use the correct API endpoint format for Strapi v5
      // Notice: singular name (challenge-product) and documentId instead of numeric ID
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-products/${selectedProduct.documentId}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.jwt}`
          },
          body: JSON.stringify({ 
            data: {
              hasDiscount: discountEnabled,
              descuento: discountEnabled ? discountDescription : ""
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error al actualizar: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Actualizar datos en el state
      setStepsData(prevData => {
        return prevData.map(stepData => {
          const updatedSubcats = stepData.subcategories.map(subcat => {
            const updatedProducts = subcat.products.map(product => {
              if (product.id === selectedProduct.id) {
                return {
                  ...product,
                  hasDiscount: discountEnabled,
                  descuento: discountEnabled ? discountDescription : ""
                };
              }
              return product;
            });
            return { ...subcat, products: updatedProducts };
          });
          return { ...stepData, subcategories: updatedSubcats };
        });
      });
      
      // Actualizar el producto seleccionado
      setSelectedProduct({
        ...selectedProduct,
        hasDiscount: discountEnabled,
        descuento: discountEnabled ? discountDescription : ""
      });
      
      toast.success("Descuento actualizado correctamente");
    } catch (error) {
      console.error("Error al guardar el descuento:", error);
      toast.error(`Error al guardar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="p-6 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white rounded-lg shadow-lg border-t-4 border-[var(--app-secondary)] flex justify-center">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--app-secondary)] mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">Cargando datos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white rounded-lg shadow-lg border-t-4 border-[var(--app-secondary)]">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error al cargar los datos:</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white rounded-lg shadow-lg border-t-4 border-[var(--app-secondary)]">
        <h1 className="text-4xl font-bold mb-8 text-zinc-800 dark:text-white">
          <span className="border-b-2 border-[var(--app-secondary)] pb-1">Gestión de Descuentos</span>
        </h1>

        <div className="mb-10">
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Seleccione un Step, luego una Subcategoría y finalmente un Producto para gestionar sus descuentos.
          </p>

          {/* 1) STEPS */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">Seleccionar Step</h2>
            <div className="flex items-center flex-wrap gap-3">
              {stepsData.length === 0 ? (
                <span className="text-zinc-500 dark:text-gray-400">No hay Steps disponibles</span>
              ) : (
                stepsData.map((stepObj, index) => (
                  <button
                    key={stepObj.step.id}
                    onClick={() => setSelectedStepIndex(index)}
                    className={cn(
                      "px-4 py-2 rounded-lg transition shadow-sm",
                      selectedStepIndex === index
                        ? "bg-[var(--app-secondary)] text-black"
                        : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    )}
                  >
                    {stepObj.step.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 2) SUBCATEGORIES */}
          {selectedStep && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">Seleccionar Subcategoría</h2>
              <div className="flex items-center flex-wrap gap-3">
                {subcatOptions.length === 0 ? (
                  <span className="text-zinc-500 dark:text-gray-400">No hay Subcategorías para este Step</span>
                ) : (
                  subcatOptions.map((subcategory, index) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedSubcatIndex(index)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition shadow-sm",
                        selectedSubcatIndex === index
                          ? "bg-[var(--app-secondary)] text-black"
                          : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      )}
                    >
                      {subcategory.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3) PRODUCTS */}
          {selectedSubcat && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-zinc-800 dark:text-zinc-200">Seleccionar Producto</h2>
              <div className="flex items-center flex-wrap gap-3">
                {selectedSubcat.products.length === 0 ? (
                  <span className="text-zinc-500 dark:text-gray-400">No hay Productos para esta Subcategoría</span>
                ) : (
                  selectedSubcat.products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-2",
                        selectedProduct?.id === product.id
                          ? "bg-[var(--app-secondary)] text-black"
                          : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      )}
                    >
                      {product.name}
                      <Pencil className="h-4 w-4" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4) PRODUCT DETAILS & DISCOUNT FORM */}
        {selectedProduct && (
          <Card className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="text-[var(--app-secondary)] dark:text-[var(--app-secondary)] text-xl">
                Detalles del Producto: {selectedProduct.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detalles del producto */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">Nombre del Producto</h3>
                    <p className="font-medium">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">Precio</h3>
                    <p className="font-medium">${selectedProduct.precio}</p>
                  </div>
                  <div>
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">ID en WooCommerce</h3>
                    <p className="font-medium">{selectedProduct.WoocomerceId || "No asignado"}</p>
                  </div>
                </div>

                {/* Formulario de descuento */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Habilitar Descuento</h3>
                    <Switch 
                      checked={discountEnabled} 
                      onCheckedChange={setDiscountEnabled} 
                      className="data-[state=checked]:bg-[var(--app-secondary)]"
                    />
                  </div>
                  
                  {discountEnabled && (
                    <div>
                      <h3 className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">Descripción del Descuento</h3>
                      <Textarea
                        value={discountDescription}
                        onChange={(e) => setDiscountDescription(e.target.value)}
                        placeholder="Ingrese los detalles del descuento aquí..."
                        className="min-h-[120px] bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={saveProductDiscount} 
                    disabled={saving}
                    className="bg-[var(--app-secondary)] text-black hover:bg-[var(--app-secondary)]/90 w-full mt-4"
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster position="top-right" richColors />
    </DashboardLayout>
  );
}