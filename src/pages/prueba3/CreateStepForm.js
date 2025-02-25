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
    <div className="p-4 max-w-2xl mx-auto rounded-xl border-2 border-gray-800">
      {isLoading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <Form {...form}>
          <form className="space-y-4">
            {/* Campo Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-yellow-500">Nombre</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Nombre del Step"
                      className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Subcategorías */}
              <FormField
                control={form.control}
                name="subcategories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">
                      Subcategorías
                    </FormLabel>
                    {subLoading ? (
                      <p className="text-center">Cargando</p>
                    ) : subError ? (
                      <p>Error: {subError.message}</p>
                    ) : (
                      <Popover open={openSubcat} onOpenChange={setOpenSubcat}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
                            >
                              {field.value.length > 0
                                ? `${field.value.length} seleccionadas`
                                : "Seleccionar Subcategorías"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 bg-black border-yellow-500 w-64">
                          <Command className="bg-black">
                            <CommandInput
                              placeholder="Buscar subcategorías..."
                              className="text-yellow-500 focus:outline-none focus:ring-0 outline-none border-0"
                            />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron resultados
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  className="text-yellow-500 hover:bg-yellow-500/10"
                                  onSelect={() => {
                                    if (
                                      field.value.length ===
                                      allSubcategories.length
                                    ) {
                                      field.onChange([]);
                                    } else {
                                      field.onChange(allSubcategories);
                                    }
                                  }}
                                >
                                  <div
                                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value.length ===
                                      allSubcategories.length
                                      ? "bg-yellow-500 text-black"
                                      : "opacity-50"
                                      }`}
                                  >
                                    {field.value.length === allSubcategories.length &&
                                      "✓"}
                                  </div>
                                  Seleccionar Todas
                                </CommandItem>
                                {allSubcategories.map((subcat) => {
                                  const isSelected = field.value.some(
                                    (item) => item.id === subcat.id
                                  );
                                  return (
                                    <CommandItem
                                      key={subcat.id}
                                      onSelect={() => {
                                        const current = field.value;
                                        let newValues;
                                        if (isSelected) {
                                          newValues = current.filter(
                                            (v) => v.id !== subcat.id
                                          );
                                        } else {
                                          newValues = [...current, subcat];
                                        }
                                        field.onChange(newValues);
                                      }}
                                      className="text-yellow-500 hover:bg-yellow-500/10"
                                    >
                                      <div
                                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${isSelected
                                          ? "bg-yellow-500 text-black"
                                          : "opacity-50"
                                          }`}
                                      >
                                        {isSelected && "✓"}
                                      </div>
                                      {subcat.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Campo para nueva subcategoría custom */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        placeholder="Nueva Subcategoría"
                        value={customSubcatInput}
                        onChange={(e) => setCustomSubcatInput(e.target.value)}
                        className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
                      />
                      <div onClick={() => handleAddCustomSubcat(field)} className="cursor-pointer hover:scale-105">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Mostrar badges de subcategorías seleccionadas */}
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((subcat) => (
                          <Badge
                            key={subcat.id}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() => {
                              field.onChange(
                                field.value.filter((v) => v.id !== subcat.id)
                              );
                            }}
                          >
                            {subcat.name}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stages */}
              <FormField
                control={form.control}
                name="stages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">Stages</FormLabel>
                    <br />
                    {stageLoading ? (
                      <p className="text-center">Cargando</p>
                    ) : stageError ? (
                      <p>Error: {stageError.message}</p>
                    ) : (
                      <Popover open={openStages} onOpenChange={setOpenStages}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
                            >
                              {field.value.length > 0
                                ? `${field.value.length} seleccionados`
                                : "Seleccionar Productos"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 bg-black border-yellow-500 w-64">
                          <Command className="bg-black">
                            <CommandInput
                              placeholder="Buscar productos..."
                              className="text-yellow-500 focus:outline-none focus:ring-0 outline-none border-0"
                            />
                            <CommandList>
                              <CommandEmpty>
                                No se encontraron resultados
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  className="text-yellow-500 hover:bg-yellow-500/10"
                                  onSelect={() => {
                                    if (
                                      field.value.length === allStages.length
                                    ) {
                                      field.onChange([]);
                                    } else {
                                      field.onChange(allStages);
                                    }
                                  }}
                                >
                                  <div
                                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value.length === allStages.length
                                      ? "bg-yellow-500 text-black"
                                      : "opacity-50"
                                      }`}
                                  >
                                    {field.value.length === allStages.length &&
                                      "✓"}
                                  </div>
                                  Seleccionar Todas
                                </CommandItem>
                                {allStages.map((stage) => {
                                  const isSelected = field.value.some(
                                    (item) =>
                                      item.documentId === stage.documentId
                                  );
                                  return (
                                    <CommandItem
                                      key={stage.documentId}
                                      onSelect={() => {
                                        const current = field.value;
                                        let newValues;
                                        if (isSelected) {
                                          newValues = current.filter(
                                            (v) =>
                                              v.documentId !== stage.documentId
                                          );
                                        } else {
                                          newValues = [...current, stage];
                                        }
                                        field.onChange(newValues);
                                      }}
                                      className="text-yellow-500 hover:bg-yellow-500/10"
                                    >
                                      <div
                                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${isSelected
                                          ? "bg-yellow-500 text-black"
                                          : "opacity-50"
                                          }`}
                                      >
                                        {isSelected && "✓"}
                                      </div>
                                      {stage.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Campo para nuevo stage custom */}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        placeholder="Nuevo Stage"
                        value={customStagesInput}
                        onChange={(e) => setCustomStagesInput(e.target.value)}
                        className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
                      />
                      <div onClick={() => handleAddCustomStage(field)} className="cursor-pointer hover:scale-105">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>

                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((stage) => (
                          <Badge
                            key={stage.documentId || stage.id}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() => {
                              field.onChange(
                                field.value.filter(
                                  (v) => v.documentId !== stage.documentId
                                )
                              );
                            }}
                          >
                            {stage.name}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botón para enviar el formulario de creación */}
            <div className="grid grid-cols-1 text-center">
              <Button onClick={handleCreateSubmit} className="bg-yellow-500 text-black w-full">
                Crear
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
