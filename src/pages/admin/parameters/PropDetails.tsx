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

export interface Challenge_stages {
  id: string | number;
  name: string;
}

export interface Challenge_step {
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
  challenge_step: Challenge_step;
  challenge_stages: Challenge_stages[];
  

  documentId: string;
}

interface DetailsProps {
  prop: ChallengeRelationsStages;
  modalType: number; // 0 for view, 1 for edit, 2 for create
}

export function PropDetails({ prop, modalType }: DetailsProps) {

  const { data: productsData, error: productsError, isLoading: productsLoading } = useStrapiData("challenge-products");
  const { data: subcategoriesData, error: subcategoriesError, isLoading: subcategoriesLoading } = useStrapiData("challenge-subcategories");
  const { data: stagesdata, error: stagesError, isLoading: stagesLoading } = useStrapiData("challenge-stages");
  const { data: stepsdata, error: stepsError, isLoading: stepsLoading } = useStrapiData("challenge-steps");

  // Estado local basado en prop para manipular seleccionados
  const [editableProp, setEditableProp] = useState(prop);

  // Productos disponibles (excluyendo los que ya están en challenge_products)
  const productavailable = productsData?.filter((product) =>
    !editableProp.challenge_products.some(p => p.id === product.id)
  );
    // Stages disponibles (excluyendo la ya seleccionada)

  const stagesavailable = stagesdata?.filter((stages) =>
    !editableProp.challenge_stages.some(p => p.id === stages.id)
  );


    // Subcategorías disponibles (excluyendo la ya seleccionada)
    const stepavailable = stepsdata?.filter((steps) =>
      steps.id !== editableProp.challenge_step?.id
    ) || [];


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

  // Función para agregar stage

  const addStage = (stages: Challenge_stages) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: [...prev.challenge_stages, stages]
    }));
  };

  // Función para quitar un producto
  const removeStage = (productId: string | number) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_stages: prev.challenge_stages.filter(p => p.id !== productId)
    }));
  };

  // Función para cambiar la subcategoría
  const changeCategory = (category: Challenge_step) => {
    setEditableProp((prev) => ({
      ...prev,
      challenge_step: category
    }));
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    // Si el valor es una cadena vacía, asigna null
    const newValue = value === "" ? null : value;
  
    setEditableProp((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  

  const handleSave = async () => {
    console.log("Datos a enviar:", { data: editableProp });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge-relations/${editableProp.documentId}/update-with-relations`,
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
    "dark:bg-zinc-900 dark:text-white dark:border-gray-600 p-1 rounded w-full";

  return (
    <div className="flex gap-4 justify-center ">
      <Card >

        <CardContent className="space-y-6 w-full ">



          <div className="flex gap-2">


            {/* Sección de Subcategoria */}
            <div className="flex-[2] my-6">
              <h3 className="text-sm   text-muted-foreground mb-3">
                <Badge>Categoria</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_step && editableProp.challenge_step.name ? (

                  <Card key={editableProp.challenge_step?.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs ">
                            {modalType === 2 ? (
                              <div>
                                <p className="text-xs ">{editableProp.challenge_step?.name}</p>

                                <Button variant="destructive" className="absolute -mt-7 ml-40" size="sm"  onClick={() => changeCategory(null)}>
                                  -
                                </Button>
                              </div>

                            ) : (
                              prop.challenge_step.name
                            )}
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                        ID: {prop.challenge_step?.id}
                      </p> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
              <h3 className="text-sm  text-muted-foreground mb-3">
                <Badge>Subcategoria</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_subcategory && editableProp.challenge_subcategory.name ? (

                  <Card key={editableProp.challenge_subcategory?.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs ">
                            {modalType === 2 ? (
                              <div>
                                <p className="text-xs ">{editableProp.challenge_subcategory?.name}</p>

                                <Button variant="destructive" className="absolute -mt-7 ml-40" size="sm"  onClick={() => changeSubcategory(null)}>
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

            {/* Sección de Stages */}

            <div className="flex-[1] mt-6">
              <h3 className="text-sm   text-muted-foreground mb-3">
                <Badge variant="secondary">Stages</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_stages.map((stages, index) => (
                  <Card key={stages.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs ">
                            {modalType === 2 ? (
                              <div>
                                <p className="text-xs  ">{stages.name}</p>

                                <Button variant="destructive" className="absolute -mt-7 ml-12" size="sm"  onClick={() => removeStage(stages.id)}>
                                  -
                                </Button>
                              </div>

                            ) : (
                              stages.name
                            )}
                          </p>
                          {/* <p className="text-sm text-muted-foreground">
                          ID: {stages.id}
                        </p> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sección de Productos */}

            <div className="flex-[1] mt-6">
              <h3 className="text-sm   text-muted-foreground mb-3">
                <Badge variant="secondary">Productos</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {editableProp.challenge_products.map((product, index) => (
                  <Card key={product.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs ">
                            {modalType === 2 ? (
                              <div>
                                <p className="text-xs ">{product.name}</p>

                                <Button variant="destructive" className="absolute -mt-7 ml-12" size="sm"  onClick={() => removeProduct(product.id)}>
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


        <div className="flex gap-2">
          <Card >

            <CardContent className="space-y-6 ">



              <div className="flex gap-2">



                {/* Sección de Productos disponibles*/}

                <div className="flex-[1] mt-6">
                  <h3 className="text-sm text-xs  text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">Productos disponibles</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {productavailable?.map((product, index) => (
                      <Card key={product.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs ">
                                {modalType === 2 ? (
                                  <div>
                                    <p className="text-xs ">{product.name}</p>

                                    <Button variant="default" className="absolute -mt-7 ml-10" size="sm"  onClick={() => addProduct(product)}>
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



              <div className="flex gap-2">



                {/* Sección de Productos disponibles*/}

                <div className="flex-[1] mt-6">
                  <h3 className="text-sm  text-muted-foreground mb-3">
                    <Badge className="bg-amber-200 text-black">Fases disponibles</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {stagesavailable?.map((stages, index) => (
                      <Card key={stages.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs ">
                                {modalType === 2 ? (
                                  <div>
                                    <p className="text-xs ">{stages.name}</p>

                                    <Button variant="default" className="absolute -mt-7 ml-10" size="sm"  onClick={() => addStage(stages)}>
                                      +
                                    </Button>
                                  </div>

                                ) : (
                                  stages.name
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



              <div className="flex gap-2">



                {/* Sección de Subcategorias disponibles*/}

                <div className="flex-[1] mt-6">
                  <h3 className="text-sm  text-muted-foreground mb-3">
                    <Badge  className="bg-amber-200 text-black">Subcategorias disponibles</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {subcategoriesavailable?.map((subcategory, index) => (
                      <Card key={subcategory.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs ">
                                {modalType === 2 ? (

                                  <div>

                                    <p className="text-xs ">{subcategory.name}</p>

                                    <Button variant="default" className="absolute -mt-7 ml-12" size="sm" onClick={() => changeSubcategory(subcategory)}>
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


          <Card >


            <CardContent className="space-y-6 ">



              <div className="flex gap-2">



                {/* Sección de Subcategorias disponibles*/}

                <div className="flex-[1] mt-6">
                  <h3 className="text-sm   text-muted-foreground mb-3">
                    <Badge  className="bg-amber-200 text-black">Categorias disponibles</Badge>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {stepavailable?.map((step, index) => (
                      <Card key={step.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs ">
                                {modalType === 2 ? (

                                  <div>

                                    <p className="text-xs ">{step.name}</p>

                                    <Button variant="default" className="absolute -mt-7 ml-12" size="sm" onClick={() => changeCategory(step)}>
                                      +
                                    </Button>
                                  </div>

                                ) : (
                                  step.name
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
