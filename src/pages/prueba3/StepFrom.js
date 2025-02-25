"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { useStrapiData } from "../../services/strapiService";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Esquema de validación modificado para permitir valores personalizados
const stepFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  idChallengeStep: z.string().optional(),
  challenge_products: z
    .array(z.string().nonempty("Producto no válido"))
    .min(1, "Selecciona al menos un producto"),
  stage: z
    .array(z.string().nonempty("Stage no válido"))
    .min(1, "Selecciona al menos un stage"),
  challenge_accounts: z
    .array(
      z.enum(["5k", "10k", "20k", "50k", "100k"], {
        errorMap: () => ({ message: "Cuenta no válida" }),
      })
    )
    .min(1, "Selecciona al menos una cuenta"),
});

function StepForm() {
  const [formData, setFormData] = useState(null);
  const [openProducts, setOpenProducts] = useState(false);
  const [openStages, setOpenStages] = useState(false);

  // Estados para agregar nuevos elementos a productos
  const [customProducts, setCustomProducts] = useState([]);
  const [addingCustomProduct, setAddingCustomProduct] = useState(false);
  const [customProductInput, setCustomProductInput] = useState("");

  // Estados para agregar nuevos elementos a stage
  const [customStages, setCustomStages] = useState([]);
  const [addingCustomStage, setAddingCustomStage] = useState(false);
  const [customStageInput, setCustomStageInput] = useState("");

  // Datos para productos (subcategories)
  const {
    data: products,
    error: productError,
    isLoading: productsLoading,
  } = useStrapiData("challenge-subcategories?populate=*");

  // Datos para stage
  const {
    data: stagesData,
    error: stageError,
    isLoading: stageLoading,
  } = useStrapiData("challenge-stages?populate=*");

  // Procesamos los productos disponibles: se filtran los que no tienen challenge_step asignado
  const challengeProducts = products
    ? products
      .filter(
        (product) =>
          !product.challenge_step ||
          product.challenge_step === "" ||
          product.challenge_step === null
      )
      .map(({ id, name }) => ({ id, name }))
    : [];

  // Se combinan los productos provenientes de la API con los agregados manualmente
  const allProducts = [...challengeProducts, ...customProducts];

  // Para stage, asumimos que el endpoint retorna un arreglo de objetos con propiedades { id, name }
  const defaultStages = stagesData || [];
  // Combinamos los stage por defecto con los agregados manualmente
  const allStages = [...defaultStages, ...customStages];

  const form = useForm({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      name: "",
      idChallengeStep: "",
      challenge_products: [],
      challenge_accounts: [],
      stage: [],
    },
  });

  function onSubmit(data) {
    setFormData(data);
    console.log(data);
  }

  // Función para agregar nuevo producto
  const handleAddProduct = (field) => {
    if (!customProductInput.trim()) return;
    const newProduct = {
      id: `custom-${Date.now()}`,
      name: customProductInput.trim(),
    };
    setCustomProducts((prev) => [...prev, newProduct]);
    // Seleccionamos automáticamente el nuevo producto
    field.onChange([...field.value, newProduct.id]);
    setCustomProductInput("");
    setAddingCustomProduct(false);
  };

  // Función para agregar nuevo stage
  const handleAddStage = (field) => {
    if (!customStageInput.trim()) return;
    const newStage = {
      id: `custom-${Date.now()}`,
      name: customStageInput.trim(),
    };
    setCustomStages((prev) => [...prev, newStage]);
    // Seleccionamos automáticamente el nuevo stage
    field.onChange([...field.value, newStage.id]);
    setCustomStageInput("");
    setAddingCustomStage(false);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-6">
      <h3 className="text-white text-xl">Crear Step</h3>
      <Card className="w-full max-w-md bg-black">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ingresa el nombre"
                        className="w-full rounded-md border border-gray-700 bg-transparent text-white placeholder-gray-500 p-3 focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] transition"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Productos */}
              <FormField
                control={form.control}
                name="challenge_products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">
                      Productos
                    </FormLabel>
                    <Popover open={openProducts} onOpenChange={setOpenProducts}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={productsLoading || productError}
                            className={`w-full justify-between rounded-md border border-gray-700 bg-transparent text-white p-3 ${!field.value?.length && "text-muted-foreground"
                              }`}
                          >
                            {productsLoading
                              ? "Cargando productos..."
                              : productError
                                ? "Error al cargar productos"
                                : field.value?.length > 0
                                  ? `${field.value.length} seleccionados`
                                  : "Seleccionar Productos"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      {!productsLoading && !productError && (
                        <PopoverContent className="w-full p-0 bg-black border-yellow-500">
                          <Command className="bg-black border-2">
                            <CommandInput
                              placeholder="Buscar productos..."
                              className="text-yellow-500"
                            />
                            <CommandList>
                              <CommandEmpty className="text-yellow-500">
                                No se encontraron productos.
                              </CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {/* Opción para seleccionar/deseleccionar todos */}
                                <CommandItem
                                  onSelect={() => {
                                    if (
                                      field.value &&
                                      field.value.length === allProducts.length
                                    ) {
                                      field.onChange([]);
                                    } else {
                                      field.onChange(
                                        allProducts.map((p) => p.id)
                                      );
                                    }
                                  }}
                                  className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                >
                                  <div
                                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value &&
                                        field.value.length === allProducts.length
                                        ? "bg-yellow-500 text-black"
                                        : "opacity-50"
                                      }`}
                                  >
                                    {field.value &&
                                      field.value.length === allProducts.length &&
                                      "✓"}
                                  </div>
                                  Seleccionar Todos
                                </CommandItem>
                                {allProducts.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    onSelect={() => {
                                      const current = field.value || [];
                                      const newValues = current.includes(product.id)
                                        ? current.filter((v) => v !== product.id)
                                        : [...current, product.id];
                                      field.onChange(newValues);
                                    }}
                                    className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                  >
                                    <div
                                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value?.includes(product.id)
                                          ? "bg-yellow-500 text-black"
                                          : "opacity-50"
                                        }`}
                                    >
                                      {field.value?.includes(product.id) && "✓"}
                                    </div>
                                    {product.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              {/* Opción para agregar nuevo producto */}
                              {addingCustomProduct ? (
                                <div className="p-2 flex gap-2">
                                  <Input
                                    placeholder="Nuevo producto"
                                    value={customProductInput}
                                    onChange={(e) =>
                                      setCustomProductInput(e.target.value)
                                    }
                                    className="bg-gray-800 text-white"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddProduct(field)}
                                  >
                                    Agregar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setAddingCustomProduct(false)
                                    }
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <CommandItem
                                  onSelect={() => setAddingCustomProduct(true)}
                                  className="text-green-500 hover:bg-green-500/10 hover:text-green-400"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Agregar nuevo producto
                                </CommandItem>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      )}
                    </Popover>
                    {field.value?.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {field.value.map((value) => (
                          <Badge
                            key={value}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() =>
                              field.onChange(field.value.filter((v) => v !== value))
                            }
                          >
                            {allProducts.find((p) => p.id === value)?.name || value}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Stage */}
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">Stage</FormLabel>
                    <Popover open={openStages} onOpenChange={setOpenStages}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={stageLoading || stageError}
                            className={`w-full justify-between rounded-md border border-gray-700 bg-transparent text-yellow-500 p-3 ${!field.value?.length && "text-muted-foreground"
                              }`}
                          >
                            {stageLoading
                              ? "Cargando stage..."
                              : stageError
                                ? "Error al cargar stage"
                                : field.value?.length > 0
                                  ? `${field.value.length} seleccionados`
                                  : "Seleccionar Stage"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      {!stageLoading && !stageError && (
                        <PopoverContent className="w-full p-0 bg-black border-yellow-500">
                          <Command className="bg-black">
                            <CommandInput
                              placeholder="Buscar stage..."
                              className="text-yellow-500"
                            />
                            <CommandList>
                              <CommandEmpty className="text-yellow-500">
                                No se encontraron stage.
                              </CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                <CommandItem
                                  onSelect={() => {
                                    if (
                                      field.value &&
                                      field.value.length === allStages.length
                                    ) {
                                      field.onChange([]);
                                    } else {
                                      field.onChange(allStages.map((p) => p.id));
                                    }
                                  }}
                                  className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                >
                                  <div
                                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value &&
                                        field.value.length === allStages.length
                                        ? "bg-yellow-500 text-black"
                                        : "opacity-50"
                                      }`}
                                  >
                                    {field.value &&
                                      field.value.length === allStages.length &&
                                      "✓"}
                                  </div>
                                  Seleccionar Todos
                                </CommandItem>
                                {allStages.map((stage) => (
                                  <CommandItem
                                    key={stage.id}
                                    onSelect={() => {
                                      const currentValues = field.value || [];
                                      const newValues = currentValues.includes(stage.id)
                                        ? currentValues.filter((value) => value !== stage.id)
                                        : [...currentValues, stage.id];
                                      field.onChange(newValues);
                                    }}
                                    className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                  >
                                    <div
                                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${field.value?.includes(stage.id)
                                          ? "bg-yellow-500 text-black"
                                          : "opacity-50"
                                        }`}
                                    >
                                      {field.value?.includes(stage.id) && "✓"}
                                    </div>
                                    {stage.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      )}
                    </Popover>
                    {field.value?.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {field.value.map((value) => (
                          <Badge
                            key={value}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() =>
                              field.onChange(field.value.filter((v) => v !== value))
                            }
                          >
                            {allStages.find((s) => s.id === value)?.name}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-yellow-500 text-black hover:bg-yellow-400 focus:ring-yellow-500"
              >
                Crear
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {formData && (
        <Card className="w-full max-w-md border-yellow-500 bg-black">
          <CardContent className="pt-6">
            <pre className="text-yellow-500 whitespace-pre-wrap">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StepForm;
