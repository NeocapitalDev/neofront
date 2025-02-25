"use client";
import React, { useState, useEffect } from "react";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepFormSchema } from "./schemas"; // <-- importa el esquema anterior
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

function ExampleForm({ step }) {
  // ------------------
  //  Data simulada
  // ------------------
  const {
    data: subcategories,
    error: subError,
    isLoading: subLoading,
  } = useStrapiData(
    "challenge-subcategories?filters[challenge_step][$null]=true"
  );

  // Stages
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

  // ------------------
  //   Estados locales
  // ------------------
  // Control de popover
  const [openSubcat, setOpenSubcat] = useState(false);
  const [openStages, setOpenStages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Para crear "custom" subcategorías y stages
  const [customSubcategories, setCustomSubcategories] = useState([]);
  const [customSubcatInput, setCustomSubcatInput] = useState("");

  const [customStages, setCustomStages] = useState([]);
  const [customStagesInput, setCustomStagesInput] = useState("");

  // Combinar datos originales + custom
  const allSubcategories = [...subcategoriesData, ...customSubcategories];
  const allStages = [...(stageData || []), ...customStages]; // usa [] si stageData es null

  // ------------------
  //   useForm
  // ------------------
  const form = useForm({
    resolver: zodResolver(stepFormSchema),
    defaultValues: step || {
      documentId: "",
      name: "",
      subcategories: [],
      stages: [],
    },
  });

  // Efecto para resetear el formulario cuando se actualice la fila seleccionada (step)
  // ...
  // Efecto para resetear el formulario cuando se actualice la fila seleccionada (step)
  useEffect(() => {
    if (step) {
      // Transformamos el step para que el formulario tenga las claves esperadas
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
      // Actualizamos los estados custom para que se combinen con los datos originales
      setCustomSubcategories(defaultValues.subcategories);
      setCustomStages(defaultValues.stages);
    } else {
      form.reset({
        documentId: "",
        name: "",
        subcategories: [],
        stages: [],
      });
    }
  }, [step, form]);

  const enviar = (data) => {
    console.log("JSON final a enviar:", data);

    async function createStepWithRelations(stepPayload) {
      try {
        let stepResponse, stepId, idstep;

        // BLOQUE 1: Si ya existe el step (tiene documentId), se actualiza y se eliminan todas las relaciones previas.
        if (stepPayload.documentId) {
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

          // Eliminar/desasociar todas las relaciones existentes de subcategorías
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
                body: JSON.stringify({
                  data: {
                    challenge_step: null,
                  },
                }),
              }
            );
            console.log(
              `Subcategoría ${existingSub.name} desasociada del step ${stepId}`
            );
          }

          // Eliminar/desasociar todas las relaciones existentes de stages
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
                body: JSON.stringify({
                  data: {
                    challenge_steps: null,
                  },
                }),
              }
            );
            console.log(
              `Stage ${existingStage.name} desasociado del step ${stepId}`
            );
          }
        } else {
          // BLOQUE 2: Si no existe el step, se crea.
          stepResponse = await fetch("http://localhost:1337/api/challenge-steps", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
            body: JSON.stringify({ data: { name: stepPayload.name } }),
          });
          const stepResult = await stepResponse.json();
          console.log("Challenge Step creado:", stepResult);
          idstep = stepResult.data.id;
          stepId = stepResult.data.documentId;
        }

        // Ahora, para ambos casos, se crean o actualizan las relaciones con las subcategorías.
        for (const subcat of stepPayload.subcategories) {
          if (typeof subcat.id === "string") {
            // Si es nuevo, se crea y se asocia
            const newSubcatResponse = await fetch(
              "http://localhost:1337/api/challenge-subcategories",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: JSON.stringify({
                  data: {
                    name: subcat.name,
                    challenge_step: stepId,
                  },
                }),
              }
            );
            const newSubcat = await newSubcatResponse.json();
            console.log("Subcategoría creada:", newSubcat);
          } else {
            // Si ya existe, se actualiza la relación para asignarle el step
            await fetch(
              `http://localhost:1337/api/challenge-subcategories/${subcat.documentId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: JSON.stringify({
                  data: {
                    challenge_step: stepId,
                  },
                }),
              }
            );
          }
        }

        // Y lo mismo para los stages.
        for (const stage of stepPayload.stages) {
          if (typeof stage.id === "string") {
            // Si es nuevo, se crea y se asocia
            const newStageResponse = await fetch(
              "http://localhost:1337/api/challenge-stages",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: JSON.stringify({
                  data: {
                    name: stage.name,
                    challenge_steps: stepId,
                  },
                }),
              }
            );
            const newStage = await newStageResponse.json();
            console.log("Stage creado:", newStage);
          } else {
            // Si ya existe, se actualiza la relación
            await fetch(
              `http://localhost:1337/api/challenge-stages/${stage.documentId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: JSON.stringify({
                  data: {
                    challenge_steps: stepId,
                  },
                }),
              }
            );
          }
        }

        console.log("Challenge Step y relaciones procesados correctamente.");
      } catch (error) {
        console.error(
          "Error al procesar el challenge step y sus relaciones:",
          error
        );
      }
    }



    // Ejecución de ejemplo
    createStepWithRelations(data);
  };
  const resetAll = () => {
    form.reset();
    setCustomSubcategories([]);
    setCustomStages([]);
  };
  // Manejar creacion
  const handleCreateSubmit = form.handleSubmit((data) => {
    setIsLoading(true);
    data.documentId = "";
    console.log("JSON final:", data);
    enviar(data);
    resetAll();
    setIsLoading(false);
    // ...
  });
  // Manejar actualizacion
  const handleUpdateSubmit = form.handleSubmit((data) => {
    setIsLoading(true);
    console.log("JSON final:", data);
    enviar(data);
    resetAll();
    setIsLoading(false);
    // ...
  });


  // ------------------
  //  Handlers custom
  // ------------------
  const handleAddCustomSubcat = (field) => {
    if (!customSubcatInput.trim()) return;
    const newSubcat = {
      id: `custom-${Date.now()}`,
      name: customSubcatInput.trim(),
    };
    // Agregar al array "custom"
    setCustomSubcategories((prev) => [...prev, newSubcat]);
    // Agregarlo también a la selección actual
    field.onChange([...field.value, newSubcat]);
    // Limpiar
    setCustomSubcatInput("");
  };

  const handleAddCustomProduct = (field) => {
    if (!customStagesInput.trim()) return;
    const newProduct = {
      id: `custom-${Date.now()}`,
      name: customStagesInput.trim(),
    };
    setCustomStages((prev) => [...prev, newProduct]);
    field.onChange([...field.value, newProduct]);
    setCustomStagesInput("");
  };

  return (

    <div className="p-4 max-w-2xl mx-auto rounded-xl border-2 border-gray-800" >
      {
        <Form {...form}>
          <form
            // onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4">
            {/* NOMBRE */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-yellow-500">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre del Step"
                      className="text-white bg-black border border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* SUBCATEGORÍAS */}
              <FormField
                control={form.control}
                name="subcategories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">Subcategorías</FormLabel>
                    {subLoading ? <p className="text-center">Cargando</p> : subError ? <p>Error: {subError.message}</p> : <Popover open={openSubcat} onOpenChange={setOpenSubcat}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full text-white border border-gray-600"
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
                            <CommandEmpty>No se encontraron resultados</CommandEmpty>
                            <CommandGroup>
                              {/* Seleccionar todas */}
                              <CommandItem
                                className="text-yellow-500 hover:bg-yellow-500/10"
                                onSelect={() => {
                                  // Si ya las tenemos todas seleccionadas, limpiamos. Si no, seleccionamos todas.
                                  if (
                                    field.value.length === allSubcategories.length
                                  ) {
                                    field.onChange([]);
                                  } else {
                                    field.onChange(allSubcategories);
                                  }
                                }}
                              >
                                <div
                                  className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value.length === allSubcategories.length
                                    ? "bg-yellow-500 text-black"
                                    : "opacity-50"
                                    }`}
                                >
                                  {field.value.length === allSubcategories.length &&
                                    "✓"}
                                </div>
                                Seleccionar Todas
                              </CommandItem>

                              {/* Lista de subcategorías */}
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
                    </Popover>}


                    {/* Campo para agregar una subcategoría custom */}
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Nueva Subcategoría"
                        value={customSubcatInput}
                        onChange={(e) => setCustomSubcatInput(e.target.value)}
                        className=" text-white"
                      />
                      <div
                        variant="outline"
                        onClick={() => handleAddCustomSubcat(field)}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Badges de subcategorías seleccionadas */}
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
                    {stageLoading ? <p className="text-center">Cargando</p> : stageError ? <p>Error: {stageError.message}</p> :
                      <Popover open={openStages} onOpenChange={setOpenStages}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full text-white border border-gray-600"
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
                              <CommandEmpty>No se encontraron resultados</CommandEmpty>
                              <CommandGroup>
                                {/* Seleccionar todos */}
                                <CommandItem
                                  className="text-yellow-500 hover:bg-yellow-500/10"
                                  onSelect={() => {
                                    if (field.value.length === allStages.length) {
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
                                    {field.value.length === allStages.length && "✓"}
                                  </div>
                                  Seleccionar Todos
                                </CommandItem>

                                {/* Lista de stages */}
                                {allStages.map((prod) => {
                                  // Compara el documentId en vez del id
                                  const isSelected = field.value.some(
                                    (item) => item.documentId === prod.documentId
                                  );

                                  return (
                                    <CommandItem
                                      key={prod.documentId} // También usamos documentId como key
                                      onSelect={() => {
                                        const current = field.value;
                                        let newValues;

                                        if (isSelected) {
                                          // Si ya estaba seleccionado, lo removemos
                                          newValues = current.filter(
                                            (v) => v.documentId !== prod.documentId
                                          );
                                        } else {
                                          // Si no estaba seleccionado, lo añadimos
                                          newValues = [...current, prod];
                                        }

                                        // Actualizamos el field con el nuevo array
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
                                      {prod.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>}

                    {/* Campo para agregar un producto custom */}
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Nuevo Stage"
                        value={customStagesInput}
                        onChange={(e) => setCustomStagesInput(e.target.value)}
                        className=" text-white"
                      />
                      <div
                        variant="outline"
                        onClick={() => handleAddCustomProduct(field)}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Badges de productos seleccionados */}
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((prod) => (
                          <Badge
                            key={prod.documentId}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() => {
                              field.onChange(
                                field.value.filter((v) => v.documentId !== prod.documentId)
                              );
                            }}
                          >
                            {prod.name}
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

            {/* BOTÓN SUBMIT */}
            {/* <Button type="submit" className="bg-yellow-500 text-black w-full">
            Crear / Guardar
          </Button> */}
            <di className="grid grid-cols-2 gap-4 text-center place-items-center">
              <div className="bg-yellow-500 text-black w-max rounded-xl py-2 px-4 text-sm hover:cursor-pointer hover:bg-[var(--app-secondary)]" onClick={handleCreateSubmit}>
                Crear
              </div>
              <div className="bg-yellow-500 text-black w-max rounded-xl py-2 px-4 text-sm hover:cursor-pointer hover:bg-[var(--app-secondary)]" onClick={handleUpdateSubmit}>
                Actualizar
              </div>
            </di>
          </form>
        </Form>
      }
    </div >

  );
}

export default ExampleForm;
