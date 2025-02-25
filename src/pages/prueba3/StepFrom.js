"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
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

function ExampleForm() {
  // ------------------
  //  Data simulada
  // ------------------
  const {
    data: subcategories,
    error: subError,
    isLoading: subLoading,
  } = useStrapiData("challenge-subcategories?filters[challenge_step][$null]=true");

  // Stages
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
      .map(({ id, name }) => ({ id, name }))
    : [];
  // const stageData = stages
  //   ? stages
  //     .filter(
  //       (stage) =>
  //         !stage.challenge_steps ||
  //         stage.challenge_steps === "" ||
  //         stage.challenge_steps === null
  //     )
  //     .map(({ id, name }) => ({ id, name }))
  //   : [];

  // ------------------
  //   Estados locales
  // ------------------
  // Control de popover
  const [openSubcat, setOpenSubcat] = useState(false);
  const [openStages, setOpenStages] = useState(false);

  // Para crear "custom" subcategorías y productos
  const [customSubcategories, setCustomSubcategories] = useState([]);
  const [customSubcatInput, setCustomSubcatInput] = useState("");

  const [customStages, setCustomStages] = useState([]);
  const [customStagesInput, setCustomStagesInput] = useState("");

  // Combinar datos originales + custom
  const allSubcategories = [...subcategoriesData, ...customSubcategories];
  const allStages = [...(stageData || []), ...customStages]; // Solución: usa [] si stageData es null

  // ------------------
  //   useForm
  // ------------------
  const form = useForm({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      name: "",
      subcategories: [],
      stages: [],
    },
  });

  // Manejar envío
  const onSubmit = (data) => {
    console.log("JSON final:", data);
    /**
     *  Estructura de data:
     *  {
     *    name: "...",
     *    subcategories: [ { id, name }, { id, name } ],
     *    stages: [ { id, name }, ... ]
     *  }
     */
  };

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
    <div className="p-4 max-w-2xl mx-auto rounded-xl border-2 border-gray-800">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                              {/* Lista de productos */}
                              {allStages.map((prod) => {
                                const isSelected = field.value.some(
                                  (item) => item.id === prod.id
                                );
                                return (
                                  <CommandItem
                                    key={prod.id}
                                    onSelect={() => {
                                      const current = field.value;
                                      let newValues;
                                      if (isSelected) {
                                        newValues = current.filter(
                                          (v) => v.id !== prod.id
                                        );
                                      } else {
                                        newValues = [...current, prod];
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
                          key={prod.id}
                          className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                          onClick={() => {
                            field.onChange(
                              field.value.filter((v) => v.id !== prod.id)
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
          <Button type="submit" className="bg-yellow-500 text-black w-full">
            Crear / Guardar
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ExampleForm;
