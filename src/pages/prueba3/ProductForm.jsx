"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
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

// Opciones para los selects
const challengeProducts = [
  { value: "fundingpips", label: "FundingPips" },
  { value: "fundingpips-pro", label: "FundingPips Pro" },
  { value: "fundingpips-zero", label: "FundingPips Zero" },
];

const stages = [
  { value: "evaluation", label: "Evaluation" },
  { value: "verification", label: "Verification" },
  { value: "funded", label: "Funded" },
  { value: "completed", label: "Completed" },
];

// Esquema de validación con Zod
const productFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  idChallengeproduct: z.string().optional(),
  challenge_products: z
    .array(
      z.enum(["fundingpips", "fundingpips-pro", "fundingpips-zero"], {
        errorMap: () => ({ message: "Producto no válido" }),
      })
    )
    .min(1, "Selecciona al menos un producto"),
  stage: z
    .array(
      z.enum(["evaluation", "verification", "funded", "completed"], {
        errorMap: () => ({ message: "Stage no válido" }),
      })
    )
    .min(1, "Selecciona al menos un stage"),
});

export default function ProductForm() {
  const [formData, setFormData] = useState(null);
  const [openProducts, setOpenProducts] = useState(false);
  const [openStages, setOpenStages] = useState(false);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      idChallengeproduct: "",
      challenge_products: [],
      stage: [],
      woocomerce_id: "",
    },
  });

  function onSubmit(data) {
    setFormData(data);
    console.log(data);
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-6">
      <h3 className="text-white text-xl">Crear Product</h3>
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
                    <FormLabel className="text-yellow-500">Productos</FormLabel>
                    <Popover open={openProducts} onOpenChange={setOpenProducts}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between rounded-md border border-gray-700 bg-transparent text-white p-3 ${
                              !field.value?.length && "text-muted-foreground"
                            }`}
                          >
                            {field.value?.length > 0
                              ? `${field.value.length} seleccionados`
                              : "Seleccionar Productos"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
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
                              <CommandItem
                                onSelect={() => {
                                  if (
                                    field.value &&
                                    field.value.length ===
                                      challengeProducts.length
                                  ) {
                                    field.onChange([]);
                                  } else {
                                    field.onChange(
                                      challengeProducts.map((p) => p.value)
                                    );
                                  }
                                }}
                                className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                              >
                                <div
                                  className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${
                                    field.value &&
                                    field.value.length ===
                                      challengeProducts.length
                                      ? "bg-yellow-500 text-black"
                                      : "opacity-50"
                                  }`}
                                >
                                  {field.value &&
                                  field.value.length ===
                                    challengeProducts.length
                                    ? "✓"
                                    : ""}
                                </div>
                                Seleccionar Todos
                              </CommandItem>
                              {challengeProducts.map((product) => (
                                <CommandItem
                                  key={product.value}
                                  onSelect={() => {
                                    const currentValues = field.value || [];
                                    const newValues = currentValues.includes(
                                      product.value
                                    )
                                      ? currentValues.filter(
                                          (value) => value !== product.value
                                        )
                                      : [...currentValues, product.value];
                                    field.onChange(newValues);
                                  }}
                                  className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                >
                                  <div
                                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${
                                      field.value?.includes(product.value)
                                        ? "bg-yellow-500 text-black"
                                        : "opacity-50"
                                    }`}
                                  >
                                    {field.value?.includes(product.value) &&
                                      "✓"}
                                  </div>
                                  {product.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value?.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {field.value.map((value) => (
                          <Badge
                            key={value}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() =>
                              field.onChange(
                                field.value.filter((v) => v !== value)
                              )
                            }
                          >
                            {
                              challengeProducts.find((p) => p.value === value)
                                ?.label
                            }
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
                            className={`w-full justify-between rounded-md border border-gray-700 bg-transparent text-yellow-500 p-3 ${
                              !field.value?.length && "text-muted-foreground"
                            }`}
                          >
                            {field.value?.length > 0
                              ? `${field.value.length} seleccionados`
                              : "Seleccionar Stage"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
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
                                    field.value.length === stages.length
                                  ) {
                                    field.onChange([]);
                                  } else {
                                    field.onChange(stages.map((p) => p.value));
                                  }
                                }}
                                className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                              >
                                <div
                                  className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${
                                    field.value &&
                                    field.value.length === stages.length
                                      ? "bg-yellow-500 text-black"
                                      : "opacity-50"
                                  }`}
                                >
                                  {field.value &&
                                  field.value.length === stages.length
                                    ? "✓"
                                    : ""}
                                </div>
                                Seleccionar Todos
                              </CommandItem>
                              {stages.map((stage) => (
                                <CommandItem
                                  key={stage.value}
                                  onSelect={() => {
                                    const currentValues = field.value || [];
                                    const newValues = currentValues.includes(
                                      stage.value
                                    )
                                      ? currentValues.filter(
                                          (value) => value !== stage.value
                                        )
                                      : [...currentValues, stage.value];
                                    field.onChange(newValues);
                                  }}
                                  className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
                                >
                                  <div
                                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-yellow-500 ${
                                      field.value?.includes(stage.value)
                                        ? "bg-yellow-500 text-black"
                                        : "opacity-50"
                                    }`}
                                  >
                                    {field.value?.includes(stage.value) && "✓"}
                                  </div>
                                  {stage.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value?.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {field.value.map((value) => (
                          <Badge
                            key={value}
                            className="bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                            onClick={() =>
                              field.onChange(
                                field.value.filter((v) => v !== value)
                              )
                            }
                          >
                            {stages.find((s) => s.value === value)?.label}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Woocommerce id */}
              <FormField
                control={form.control}
                name="woocommerce_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">
                      Woocommerce id
                    </FormLabel>
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
