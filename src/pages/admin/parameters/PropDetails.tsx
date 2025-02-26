import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { useStrapiData } from "../../../services/strapiService";

export interface Challenge_products {
  id: string | number;
  name: string;
}

export interface Challenge_subcategory {
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
  documentId: string;
}

interface DetailsProps {
  prop: ChallengeRelationsStages;
  modalType: number; // 0 for view, 1 for edit, 2 for create
}

export function PropDetails({ prop, modalType }: DetailsProps) {

  const { data: productsData, error: productsError, isLoading: productsLoading } = useStrapiData("challenge-products");
  const { data: subcategoriesData, error: subcategoriesError, isLoading: subcategoriesLoading } = useStrapiData("challenge-subcategories");

  // Estado local basado en prop para manipular seleccionados
  const [editableProp, setEditableProp] = useState(prop);

  // Productos disponibles (excluyendo los que ya están en challenge_products)
  const productavailable = productsData?.filter((product) =>
    !editableProp.challenge_products.some(p => p.id === product.id)
  );

  // Subcategorías disponibles (excluyendo la ya seleccionada)
  const subcategoriesavailable = subcategoriesData?.filter((subcategory) =>
    subcategory.id !== editableProp.challenge_subcategory?.id
  ) || [];

  // Función para agregar un producto
  const addProduct = (product: Challenge_products) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: [...prev.challenge_products, product]
    }));
  };

  // Función para quitar un producto
  const removeProduct = (productId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_products: prev.challenge_products.filter(p => p.id !== productId)
    }));
  };

  // Función para cambiar la subcategoría
  const changeSubcategory = (subcategory: Challenge_subcategory) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_subcategory: subcategory
    }));
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProp((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log("Datos a enviar:", { data: editableProp });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations-stages/${editableProp.documentId}/update-with-relations`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({ data: editableProp }), // Envía el JSON actualizado
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la actualización: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      alert("Hubo un error al guardar.");
    }
  };


  const inputDarkClasses =
    "dark:bg-zinc-800 dark:text-white dark:border-gray-600 p-1 rounded w-full";

  return (
    <div className="flex gap-4 justify-center ">
      <Card >

        <CardContent className="space-y-6 w-full ">



          <div className="flex gap-4">


            {/* Sección de Subcategoria */}
            <div className="flex-[2] my-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                <Badge>Subcategoria</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_subcategory && editableProp.challenge_subcategory.name ? (

                  <Card key={editableProp.challenge_subcategory?.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {modalType === 2 ? (
                              <div>
                                <p className="font-medium">{editableProp.challenge_subcategory?.name}</p>

                                <Button variant="destructive" className="absolute -mx-4" size="icon" onClick={() => changeSubcategory(null)}>
                                  -
                                </Button>
                              </div>

                            ) : (
                              prop.challenge_subcategory.name
                            )}
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                        ID: {prop.challenge_subcategory?.id}
                      </p> */}
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
                      value={editableProp.minimumTradingDays}
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
                      value={editableProp.maximumDailyLoss}
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
                      value={editableProp.maximumLoss}
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
                      value={editableProp.profitTarget}
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
                      value={editableProp.leverage}
                      onChange={handleChange}
                      className={inputDarkClasses}
                    />
                  ) : (
                    prop.leverage
                  )}
                </CardDescription>
              </CardHeader>


            </div>

            {/* Sección de Productos */}

            <div className="flex-[1] mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                <Badge variant="secondary">Productos</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_products.map((product, index) => (
                  <Card key={product.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {modalType === 2 ? (
                              <div>
                                <p className="font-medium">{product.name}</p>

                                <Button variant="destructive" className="absolute -mx-4" size="icon" onClick={() => removeProduct(product.id)}>
                                  -
                                </Button>
                              </div>

                            ) : (
                              product.name
                            )}
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                          ID: {product.id}
                        </p> */}
                        </div>
                      </div>
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


      {modalType === 2 && (


        <div className="flex gap-4">
          <Card >

            <CardContent className="space-y-6 ">



              <div className="flex gap-4">



                {/* Sección de Productos disponibles*/}

                <div className="flex-[1] mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">Productos disponibles</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {productavailable?.map((product, index) => (
                      <Card key={product.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {modalType === 2 ? (
                                  <div>
                                    <p className="font-medium">{product.name}</p>

                                    <Button variant="default" className="absolute -mx-4" size="icon" onClick={() => addProduct(product)}>
                                      +
                                    </Button>
                                  </div>

                                ) : (
                                  product.name
                                )}
                              </p>
                              {/* <p className="text-sm text-muted-foreground">
          ID: {product.id}
        </p> */}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

              </div>



            </CardContent>


          </Card>


          <Card >


            <CardContent className="space-y-6 ">



              <div className="flex gap-4">



                {/* Sección de Subcategorias disponibles*/}

                <div className="flex-[1] mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    <Badge  className="bg-amber-200 text-black">Subcategorias disponibles</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {subcategoriesavailable?.map((subcategory, index) => (
                      <Card key={subcategory.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {modalType === 2 ? (

                                  <div>

                                    <p className="font-medium">{subcategory.name}</p>

                                    <Button variant="default" className="absolute " size="icon" onClick={() => changeSubcategory(subcategory)}>
                                      +
                                    </Button>
                                  </div>

                                ) : (
                                  subcategory.name
                                )}
                              </p>
                              {/* <p className="text-sm text-muted-foreground">
  ID: {product.id}
</p> */}
                            </div>
                          </div>
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
