"use client";

import React, { useEffect, useState } from "react";
import { ChallengeTable } from "./ChallengeTable";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Validación
const nameSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
});

export default function IndexPage() {
  // Datos
  const [subcats, setSubcats] = useState([]);
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Un solo pageSize para las 3 tablas
  const [pageSize, setPageSize] = useState(10);

  // Form
  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  // -------------------------------------
  // 1. Helpers de Strapi
  // -------------------------------------
  async function fetchStrapiData(endpoint) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        `Error al obtener datos de ${endpoint}: ${res.status} ${res.statusText}`
      );
    }
    const json = await res.json();
    return json.data;
  }

  async function createStrapiItem(endpoint, payload) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });
    if (!res.ok) {
      throw new Error(
        `Error al crear en ${endpoint}: ${res.status} ${res.statusText}`
      );
    }
    return res.json();
  }

  async function updateStrapiItem(endpoint, idOrDoc, payload) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}/${idOrDoc}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });
    if (!res.ok) {
      throw new Error(
        `Error al actualizar en ${endpoint}/${idOrDoc}: ${res.status} ${res.statusText}`
      );
    }
    return res.json();
  }

  // -------------------------------------
  // 2. Cargar datos
  // -------------------------------------
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [scData, prData, stData] = await Promise.all([
          fetchStrapiData("challenge-subcategories"),
          fetchStrapiData("challenge-products"),
          fetchStrapiData("challenge-stages"),
        ]);

        setSubcats(
          scData.map((item) => ({
            id: item.id,
            documentId: item.documentId,
            name: item.name,
          }))
        );
        setProducts(
          prData.map((item) => ({
            id: item.id,
            documentId: item.documentId,
            name: item.name,
          }))
        );
        setStages(
          stData.map((item) => ({
            id: item.id,
            documentId: item.documentId,
            name: item.name,
          }))
        );
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    loadAll();
  }, []);

  // -------------------------------------
  // 3. Crear / Editar
  // -------------------------------------
  function handleOpenCreate(table) {
    setCurrentTable(table);
    setEditItem(null);
    form.reset({ name: "" });
    setOpenModal(true);
  }

  function handleOpenEdit(table, item) {
    setCurrentTable(table);
    setEditItem({
      docId: item.documentId, // si usas UID
      name: item.name,
    });
    form.reset({ name: item.name });
    setOpenModal(true);
  }

  async function onSubmit(formValues) {
    const payload = { name: formValues.name };
    let endpoint = "";

    if (currentTable === "subcategory") endpoint = "challenge-subcategories";
    if (currentTable === "product") endpoint = "challenge-products";
    if (currentTable === "stage") endpoint = "challenge-stages";

    try {
      if (editItem) {
        // Editar con docId (UID) o id
        await updateStrapiItem(endpoint, editItem.docId, payload);
      } else {
        // Crear
        await createStrapiItem(endpoint, payload);
      }
      setOpenModal(false);

      // Refrescar
      const newData = await fetchStrapiData(endpoint);
      const mapped = newData.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
      }));

      if (currentTable === "subcategory") setSubcats(mapped);
      if (currentTable === "product") setProducts(mapped);
      if (currentTable === "stage") setStages(mapped);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar. Revisa la consola.");
    }
  }

  // -------------------------------------
  // 4. Render
  // -------------------------------------
  return (
    <div className="p-2 space-y-4 bg-black min-h-screen text-white">
      {/* Barra superior con Rows per page */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-yellow-400">
          Administración de Challenges
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 rounded px-10 py-1 text-white text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Subcategory */}
        <ChallengeTable
          title="Challenge Subcategory"
          data={subcats}
          pageSize={pageSize}
          onCreate={() => handleOpenCreate("subcategory")}
          onEdit={(item) => handleOpenEdit("subcategory", item)}
        />

        {/* Product */}
        <ChallengeTable
          title="Challenge Product"
          data={products}
          pageSize={pageSize}
          onCreate={() => handleOpenCreate("product")}
          onEdit={(item) => handleOpenEdit("product", item)}
        />

        {/* Stage */}
        <ChallengeTable
          title="Challenge Stage"
          data={stages}
          pageSize={pageSize}
          onCreate={() => handleOpenCreate("stage")}
          onEdit={(item) => handleOpenEdit("stage", item)}
        />
      </div>

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-black text-white border border-yellow-500 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-sm sm:text-base md:text-lg">
              {editItem ? "Editar" : "Crear"}{" "}
              {currentTable === "subcategory"
                ? "Subcategory"
                : currentTable === "product"
                ? "Product"
                : "Stage"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base">
              {editItem
                ? "Modifica el nombre y confirma para guardar cambios."
                : "Ingresa el nombre para crear un nuevo registro."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 mt-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500 text-sm">
                      Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre"
                        className="bg-transparent border border-gray-700 text-white text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                  className="px-3 py-1 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 text-black hover:bg-yellow-400 px-3 py-1 text-sm"
                >
                  {editItem ? "Guardar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
