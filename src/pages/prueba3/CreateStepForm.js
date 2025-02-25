"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepFormSchema } from "./schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useStrapiData } from "../../services/strapiService";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export function CreateStepForm() {
  // --- Datos desde Strapi ---
  const {
    data: subcategories,
    error: subError,
    isLoading: subLoading,
  } = useStrapiData(
    "challenge-subcategories?filters[challenge_step][$null]=true"
  );
  const {
    data: stageData,
    error: stageError,
    isLoading: stageLoading,
  } = useStrapiData(
    "challenge-stages?filters[challenge_steps][$null]=true"
  );

  const subcategoriesData = subcategories
    ? subcategories
      .filter(
        (subcategory) =>
          !subcategory.challenge_steps ||
          subcategory.challenge_steps === "" ||
          subcategory.challenge_steps === null
      )
      .map(({ id, documentId, name }) => ({ id, documentId, name }))
    : [];

  // --- Estados locales ---
  const [openSubcat, setOpenSubcat] = useState(false);
  const [openStages, setOpenStages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para agregar nuevos elementos custom
  const [customSubcategories, setCustomSubcategories] = useState([]);
  const [customSubcatInput, setCustomSubcatInput] = useState("");
  const [customStages, setCustomStages] = useState([]);
  const [customStagesInput, setCustomStagesInput] = useState("");

  const allSubcategories = [...subcategoriesData, ...customSubcategories];
  const allStages = [...(stageData || []), ...customStages];

  // --- useForm ---
  const form = useForm({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      documentId: "",
      name: "",
      subcategories: [],
      stages: [],
    },
  });

  // --- Función para crear el Step y sus relaciones ---
  const createStepWithRelations = async (stepPayload) => {
    try {
      // Crear el challenge step
      const stepResponse = await fetch(
        "http://localhost:1337/api/challenge-steps",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({ data: { name: stepPayload.name } }),
        }
      );
      const stepResult = await stepResponse.json();
      console.log("Challenge Step creado:", stepResult);
      const stepId = stepResult.data.documentId;

      // Crear o asociar subcategorías
      for (const subcat of stepPayload.subcategories) {
        if (typeof subcat.id === "string" && subcat.id.startsWith("custom")) {
          // Crear subcategoría nueva
          const newSubcatResponse = await fetch(
            "http://localhost:1337/api/challenge-subcategories",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
              },
              body: JSON.stringify({
                data: { name: subcat.name, challenge_step: stepId },
              }),
            }
          );
          const newSubcat = await newSubcatResponse.json();
          console.log("Subcategoría creada:", newSubcat);
        } else {
          // Asociar subcategoría existente
          await fetch(
            `http://localhost:1337/api/challenge-subcategories/${subcat.documentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
              },
              body: JSON.stringify({
                data: { challenge_step: stepId },
              }),
            }
          );
        }
      }

      // Crear o asociar stages
      for (const stage of stepPayload.stages) {
        if (typeof stage.id === "string" && stage.id.startsWith("custom")) {
          // Crear stage nuevo
          const newStageResponse = await fetch(
            "http://localhost:1337/api/challenge-stages",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
              },
              body: JSON.stringify({
                data: { name: stage.name, challenge_steps: stepId },
              }),
            }
          );
          const newStage = await newStageResponse.json();
          console.log("Stage creado:", newStage);
        } else {
          // Asociar stage existente
          await fetch(
            `http://localhost:1337/api/challenge-stages/${stage.documentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
              },
              body: JSON.stringify({
                data: { challenge_steps: stepId },
              }),
            }
          );
        }
      }
      console.log("Challenge Step y relaciones creados correctamente.");
    } catch (error) {
      console.error("Error al crear el challenge step y sus relaciones:", error);
    }
  };

  // --- Manejo del submit para crear ---
  const handleCreateSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    // Nos aseguramos de que no exista un documentId
    data.documentId = "";
    console.log("JSON final:", data);
    await createStepWithRelations(data);
    form.reset();
    setCustomSubcategories([]);
    setCustomStages([]);
    setIsLoading(false);
  });

  // --- Handlers para agregar nuevos items custom ---
  const handleAddCustomSubcat = (field) => {
    if (!customSubcatInput.trim()) return;
    const newSubcat = {
      id: `custom-${Date.now()}`,
      name: customSubcatInput.trim(),
    };
    setCustomSubcategories((prev) => [...prev, newSubcat]);
    field.onChange([...field.value, newSubcat]);
    setCustomSubcatInput("");
  };

  const handleAddCustomStage = (field) => {
    if (!customStagesInput.trim()) return;
    const newStage = {
      id: `custom-${Date.now()}`,
      name: customStagesInput.trim(),
    };
    setCustomStages((prev) => [...prev, newStage]);
    field.onChange([...field.value, newStage]);
    setCustomStagesInput("");
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto bg-black border-2 border-yellow-500">
      {isLoading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <Form {...form}>
          <form className="space-y-8">
            {/* Campo Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-500 text-lg">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre del Step"
                      className="border-gray-700 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-8">
              {/* Subcategorías Section */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="subcategories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-500 text-lg">Subcategorías</FormLabel>
                      <Card className="p-4 border border-gray-700 bg-black/50">
                        {subLoading ? (
                          <p className="text-center">Cargando</p>
                        ) : subError ? (
                          <p>Error: {subError.message}</p>
                        ) : (
                          <div className="space-y-4">
                            <Popover open={openSubcat} onOpenChange={setOpenSubcat}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full border-gray-700 bg-transparent text-white hover:bg-yellow-500/10"
                                  >
                                    {field.value.length > 0
                                      ? `${field.value.length} seleccionadas`
                                      : "Seleccionar"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 bg-black border-yellow-500 w-full">
                                <Command className="bg-black">
                                  <CommandInput placeholder="Buscar subcategorías..." className="text-yellow-500" />
                                  <CommandList>
                                    <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                    <CommandGroup>
                                      <CommandItem
                                        className="text-yellow-500 hover:bg-yellow-500/10"
                                        onSelect={() => {
                                          if (field.value.length === allSubcategories.length) {
                                            field.onChange([])
                                          } else {
                                            field.onChange(allSubcategories)
                                          }
                                        }}
                                      >
                                        <div
                                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value.length === allSubcategories.length
                                            ? "bg-yellow-500 text-black"
                                            : "opacity-50"
                                            }`}
                                        >
                                          {field.value.length === allSubcategories.length && "✓"}
                                        </div>
                                        Seleccionar Todas
                                      </CommandItem>
                                      {allSubcategories.map((subcat) => {
                                        const isSelected = field.value.some((item) => item.id === subcat.id)
                                        return (
                                          <CommandItem
                                            key={subcat.id}
                                            onSelect={() => {
                                              const current = field.value
                                              let newValues
                                              if (isSelected) {
                                                newValues = current.filter((v) => v.id !== subcat.id)
                                              } else {
                                                newValues = [...current, subcat]
                                              }
                                              field.onChange(newValues)
                                            }}
                                            className="text-yellow-500 hover:bg-yellow-500/10"
                                          >
                                            <div
                                              className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${isSelected ? "bg-yellow-500 text-black" : "opacity-50"
                                                }`}
                                            >
                                              {isSelected && "✓"}
                                            </div>
                                            {subcat.name}
                                          </CommandItem>
                                        )
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder="Nueva Subcategoría"
                                value={customSubcatInput}
                                onChange={(e) => setCustomSubcatInput(e.target.value)}
                                className="border-gray-700 bg-transparent text-white"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleAddCustomSubcat(field)}
                                className="hover:bg-yellow-500/10"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {field.value.length > 0 && (
                              <div className="grid gap-2 pt-4">
                                {field.value.map((subcat) => (
                                  <Card
                                    key={subcat.id}
                                    className="p-2 bg-yellow-500/10 border-yellow-500/20 flex justify-between items-center"
                                  >
                                    <span className="text-white">{subcat.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        field.onChange(field.value.filter((v) => v.id !== subcat.id))
                                      }}
                                      className="h-8 w-8 hover:bg-yellow-500/20"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stages Section */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="stages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-500 text-lg">Stages</FormLabel>
                      <Card className="p-4 border border-gray-700 bg-black/50">
                        {stageLoading ? (
                          <p className="text-center">Cargando</p>
                        ) : stageError ? (
                          <p>Error: {stageError.message}</p>
                        ) : (
                          <div className="space-y-4">
                            {/* ... [Similar structure as Subcategories] */}
                            <Popover open={openStages} onOpenChange={setOpenStages}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full border-gray-700 bg-transparent text-white hover:bg-yellow-500/10"
                                  >
                                    {field.value.length > 0
                                      ? `${field.value.length} seleccionados`
                                      : "Seleccionar"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 bg-black border-yellow-500 w-full">
                                <Command className="bg-black">
                                  <CommandInput placeholder="Buscar productos..." className="text-yellow-500" />
                                  <CommandList>
                                    <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                    <CommandGroup>
                                      <CommandItem
                                        className="text-yellow-500 hover:bg-yellow-500/10"
                                        onSelect={() => {
                                          if (field.value.length === allStages.length) {
                                            field.onChange([])
                                          } else {
                                            field.onChange(allStages)
                                          }
                                        }}
                                      >
                                        <div
                                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value.length === allStages.length
                                            ? "bg-yellow-500 text-black"
                                            : "opacity-50"
                                            }`}
                                        >
                                          {field.value.length === allStages.length && "✓"}
                                        </div>
                                        Seleccionar Todas
                                      </CommandItem>
                                      {allStages.map((stage) => {
                                        const isSelected = field.value.some(
                                          (item) => item.documentId === stage.documentId,
                                        )
                                        return (
                                          <CommandItem
                                            key={stage.documentId}
                                            onSelect={() => {
                                              const current = field.value
                                              let newValues
                                              if (isSelected) {
                                                newValues = current.filter((v) => v.documentId !== stage.documentId)
                                              } else {
                                                newValues = [...current, stage]
                                              }
                                              field.onChange(newValues)
                                            }}
                                            className="text-yellow-500 hover:bg-yellow-500/10"
                                          >
                                            <div
                                              className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${isSelected ? "bg-yellow-500 text-black" : "opacity-50"
                                                }`}
                                            >
                                              {isSelected && "✓"}
                                            </div>
                                            {stage.name}
                                          </CommandItem>
                                        )
                                      })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder="Nuevo Stage"
                                value={customStagesInput}
                                onChange={(e) => setCustomStagesInput(e.target.value)}
                                className="border-gray-700 bg-transparent text-white"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleAddCustomStage(field)}
                                className="hover:bg-yellow-500/10"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {field.value.length > 0 && (
                              <div className="grid gap-2 pt-4">
                                {field.value.map((stage) => (
                                  <Card
                                    key={stage.documentId || stage.id}
                                    className="p-2 bg-yellow-500/10 border-yellow-500/20 flex justify-between items-center"
                                  >
                                    <span className="text-white">{stage.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        field.onChange(field.value.filter((v) => v.documentId !== stage.documentId))
                                      }}
                                      className="h-8 w-8 hover:bg-yellow-500/20"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button onClick={handleCreateSubmit} className="w-full bg-yellow-500 text-black hover:bg-yellow-400">
              Crear
            </Button>
          </form>
        </Form>
      )}
    </Card>
  );
}
