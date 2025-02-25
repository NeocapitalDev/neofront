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
}

interface DetailsProps {
  prop: ChallengeRelationsStages;
  modalType: number; // 0 for view, 1 for edit, 2 for create
}

export function PropDetails({ prop, modalType }: DetailsProps) {
  const [editableProp, setEditableProp] = useState(prop);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProp((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log(editableProp);
  };

  const inputDarkClasses =
    "dark:bg-gray-800 dark:text-white dark:border-gray-600 p-2 rounded";

  return (
    <Card>

      <CardContent className="space-y-6 ">



        <div className="flex gap-6">


          {/* Sección de Subcategoria */}
          <div className="flex-1">
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

            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Subcategoria
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Card key={editableProp.challenge_subcategory?.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {modalType === 2 ? (
                          <input
                            type="text"
                            name="challenge_subcategory.name"
                            value={editableProp.challenge_subcategory?.name}
                            onChange={(e) => {
                              setEditableProp((prev) => ({
                                ...prev,
                                challenge_subcategory: {
                                  ...prev.challenge_subcategory,
                                  name: e.target.value,
                                },
                              }));
                            }}
                            className={inputDarkClasses}
                          />
                        ) : (
                          prop.challenge_subcategory?.name
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {prop.challenge_subcategory?.id}
                      </p>
                    </div>
                    <Badge>Subcategoria</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sección de Productos */}

          <div className="flex-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Productos
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {editableProp.challenge_products.map((product, index) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {modalType === 2 ? (
                            <input
                              type="text"
                              name={`challenge_products[${index}].name`}
                              value={product.name}
                              onChange={(e) => {
                                const newProducts = [...editableProp.challenge_products];
                                newProducts[index].name = e.target.value;
                                setEditableProp((prev) => ({
                                  ...prev,
                                  challenge_products: newProducts,
                                }));
                              }}
                              className={inputDarkClasses}
                            />
                          ) : (
                            product.name
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {product.id}
                        </p>
                      </div>
                      <Badge variant="secondary">Producto</Badge>
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
  );
}
