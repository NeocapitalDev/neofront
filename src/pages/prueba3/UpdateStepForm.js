"use client";
import React, { useState, useEffect } from "react";
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

export function UpdateStepForm({ step, setNewData }) {
  // --- Datos desde Strapi ---
  const {
    data: subcategories,
    error: subError,
    isLoading: subLoading,
  } = useStrapiData("challenge-subcategories?filters[challenge_step][$null]=true");
  const {
    data: stageData,
    error: stageError,
    isLoading: stageLoading,
  } = useStrapiData("challenge-stages?filters[challenge_steps][$null]=true");

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
  const [customSubcategories, setCustomSubcategories] = useState([]);
  const [customSubcatInput, setCustomSubcatInput] = useState("");
  const [customStages, setCustomStages] = useState([]);
  const [customStagesInput, setCustomStagesInput] = useState("");

  const allSubcategories = [...subcategoriesData, ...customSubcategories];
  const allStages = [...(stageData || []), ...customStages];

  // --- useForm: se inicializa con los valores del step a actualizar ---
  const form = useForm({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      documentId: step?.documentId || "",
      name: step?.name || "",
      subcategories: step?.challenge_subcategories
        ? step.challenge_subcategories.map(({ id, documentId, name }) => ({
          id,
          documentId,
          name,
        }))
        : [],
      stages: step?.challenge_stages
        ? step.challenge_stages.map(({ id, documentId, name }) => ({
          id,
          documentId,
          name,
        }))
        : [],
    },
  });

  // Actualizar valores cuando "step" cambie
  useEffect(() => {
    if (step) {
      const defaultValues = {
        documentId: step.documentId || "",
        name: step.name || "",
        subcategories: step.challenge_subcategories
          ? step.challenge_subcategories.map(({ id, documentId, name }) => ({
            id,
            documentId,
            name,
          }))
          : [],
        stages: step.challenge_stages
          ? step.challenge_stages.map(({ id, documentId, name }) => ({
            id,
            documentId,
            name,
          }))
          : [],
      };
      form.reset(defaultValues);
      setCustomSubcategories(defaultValues.subcategories);
      setCustomStages(defaultValues.stages);
    }
  }, [step, form]);

  // --- Función para actualizar el Step y sus relaciones ---
  const updateStepWithRelations = async (stepPayload) => {
    console.log("Payload recibido:", stepPayload);
    try {
      let stepResponse, idstep, stepId;
      // Actualizar el challenge step
      stepResponse = await fetch(
        `http://localhost:1337/api/challenge-steps/${stepPayload.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({ data: { name: stepPayload.name } }),
        }
      );
      const stepResult = await stepResponse.json();
      console.log("Challenge Step actualizado:", stepResult);
      idstep = stepResult.data.id;
      stepId = stepResult.data.documentId;

      // Desasociar las subcategorías actuales
      const currentSubRes = await fetch(
        `http://localhost:1337/api/challenge-subcategories?filters[challenge_step][$eq]=${idstep}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        }
      );
      const currentSubData = await currentSubRes.json();
      const currentSubcategories = currentSubData.data || [];
      for (const existingSub of currentSubcategories) {
        await fetch(
          `http://localhost:1337/api/challenge-subcategories/${existingSub.documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify({ data: { challenge_step: null } }),
          }
        );
        console.log(
          `Subcategoría ${existingSub.name} desasociada del step ${stepId}`
        );
      }

      // Desasociar los stages actuales
      const currentStageRes = await fetch(
        `http://localhost:1337/api/challenge-stages?filters[challenge_steps][$eq]=${idstep}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        }
      );
      const currentStageData = await currentStageRes.json();
      const currentStages = currentStageData.data || [];
      for (const existingStage of currentStages) {
        await fetch(
          `http://localhost:1337/api/challenge-stages/${existingStage.documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify({ data: { challenge_steps: null } }),
          }
        );
        console.log(
          `Stage ${existingStage.name} desasociado del step ${stepId}`
        );
      }

      // Asociar las subcategorías seleccionadas
      for (const subcat of stepPayload.subcategories) {
        if (typeof subcat.id === "string" && subcat.id.startsWith("custom")) {
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

      // Asociar los stages seleccionados
      for (const stage of stepPayload.stages) {
        if (typeof stage.id === "string" && stage.id.startsWith("custom")) {
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
      console.log("Challenge Step y relaciones actualizados correctamente.");
    } catch (error) {
      console.error("Error al actualizar el challenge step y sus relaciones:", error);
    }
  };

  // --- Manejo del submit para actualizar ---
  const handleUpdateSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    setNewData(data);
    console.log("JSON final:", data);
    await updateStepWithRelations(data);
    form.reset();
    setCustomSubcategories([]);
    setCustomStages([]);
    setIsLoading(false);
  });

  // --- Handlers para agregar items custom ---
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
        <p className="text-center">Cargando</p>
      ) : (
        <Form {...form}>
          <form className="space-y-4">
            {/* Campo Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <input
                    {...field}
                    placeholder="Nombre del Step"
                    className="py-2 px-4 rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition w-[150px] lg:w-[250px]"
                  />

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
                    <FormLabel className="text-yellow-500">Subcategorías</FormLabel>
                    {subLoading ? (
                      <p className="text-center">Cargando</p>
                    ) : subError ? (
                      <p>Error: {subError.message}</p>
                    ) : (
                      <Popover open={openSubcat} onOpenChange={setOpenSubcat}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full text-white border border-gray-600">
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
                              <CommandEmpty>No se encontraron resultados</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  className="text-yellow-500 hover:bg-yellow-500/10"
                                  onSelect={() => {
                                    field.onChange(
                                      field.value.length === allSubcategories.length
                                        ? []
                                        : allSubcategories
                                    );
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
                                  const isSelected = field.value.some((item) => item.id === subcat.id);
                                  return (
                                    <CommandItem
                                      key={subcat.id}
                                      onSelect={() => {
                                        const current = field.value;
                                        let newValues = isSelected
                                          ? current.filter((v) => v.id !== subcat.id)
                                          : [...current, subcat];
                                        field.onChange(newValues);
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
                      <Input
                        placeholder="Nueva Subcategoría"
                        value={customSubcatInput}
                        onChange={(e) => setCustomSubcatInput(e.target.value)}
                        className="text-white"
                      />
                      <div onClick={() => handleAddCustomSubcat(field)}>
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
                            onClick={() =>
                              field.onChange(field.value.filter((v) => v.id !== subcat.id))
                            }
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
                    {stageLoading ? (
                      <p className="text-center">Cargando</p>
                    ) : stageError ? (
                      <p>Error: {stageError.message}</p>
                    ) : (
                      <Popover open={openStages} onOpenChange={setOpenStages}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full text-white border border-gray-600">
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
                              <CommandEmpty>No se encontraron resultados</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  className="text-yellow-500 hover:bg-yellow-500/10"
                                  onSelect={() => {
                                    field.onChange(
                                      field.value.length === allStages.length ? [] : allStages
                                    );
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
                                    (item) => item.documentId === stage.documentId
                                  );
                                  return (
                                    <CommandItem
                                      key={stage.documentId}
                                      onSelect={() => {
                                        const current = field.value;
                                        let newValues = isSelected
                                          ? current.filter(
                                            (v) => v.documentId !== stage.documentId
                                          )
                                          : [...current, stage];
                                        field.onChange(newValues);
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
                      <Input
                        placeholder="Nuevo Stage"
                        value={customStagesInput}
                        onChange={(e) => setCustomStagesInput(e.target.value)}
                        className="text-white"
                      />
                      <div onClick={() => handleAddCustomStage(field)}>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Mostrar badges de stages seleccionados */}
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((stage) => (
                          <Badge
                            key={stage.documentId || stage.id}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() =>
                              field.onChange(
                                field.value.filter(
                                  (v) => v.documentId !== stage.documentId
                                )
                              )
                            }
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

            {/* Botón para enviar la actualización */}
            <div className="grid grid-cols-1 text-center">
              <Button onClick={handleUpdateSubmit} className="bg-yellow-500 text-black w-full">
                Actualizar
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
