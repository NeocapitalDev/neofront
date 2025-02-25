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

const nameSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
});

export default function IndexPage() {
  const [subcats, setSubcats] = useState([]);
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  // "subcategory" | "product" | "stage"
  const [currentTable, setCurrentTable] = useState(null);
  // Guardamos docId y name para editar
  const [editItem, setEditItem] = useState(null);

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  // ------------------------------
  // 1. Helpers de Strapi
  // ------------------------------
  async function fetchStrapiData(endpoint) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}`;
    console.log("[fetchStrapiData] GET =>", url);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Error al obtener datos de ${endpoint}: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    console.log("[fetchStrapiData] RESPONSE =>", json);
    return json.data;
  }

  async function createStrapiItem(endpoint, payload) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}`;
    console.log("[createStrapiItem] POST =>", url, payload);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });
    if (!res.ok) {
      throw new Error(`Error al crear en ${endpoint}: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    console.log("[createStrapiItem] CREATED =>", json);
    return json;
  }

  // NOTA: idOrDoc es el param que usaremos, sea docId o id
  async function updateStrapiItem(endpoint, idOrDoc, payload) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${endpoint}/${idOrDoc}`;
    console.log("[updateStrapiItem] PUT =>", url, payload);
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
    const json = await res.json();
    console.log("[updateStrapiItem] UPDATED =>", json);
    return json;
  }

  // ------------------------------
  // 2. Cargar datos al montar
  // ------------------------------
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [scData, prData, stData] = await Promise.all([
          fetchStrapiData("challenge-subcategories"),
          fetchStrapiData("challenge-products"),
          fetchStrapiData("challenge-stages"),
        ]);

        // Mapeamos { id, documentId, name }
        setSubcats(
          scData.map((item) => ({
            id: item.id,
            documentId: item.documentId, // UID
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

  // ------------------------------
  // 3. Crear / Editar
  // ------------------------------
  function handleOpenCreate(table) {
    setCurrentTable(table);
    setEditItem(null);
    form.reset({ name: "" });
    setOpenModal(true);
  }

  function handleOpenEdit(table, item) {
    setCurrentTable(table);
    // Guardamos docId (UID) y name
    setEditItem({
      docId: item.documentId, // este es el UID que usaremos en la ruta
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
        // Editar con docId (UID) en la ruta
        await updateStrapiItem(endpoint, editItem.docId, payload);
      } else {
        // Crear
        await createStrapiItem(endpoint, payload);
      }
      setOpenModal(false);

      // Refrescar data
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

  // ------------------------------
  // 4. Render
  // ------------------------------
  return (
    <div className="p-4 space-y-8">
      {/* Ejemplo de 3 tablas en horizontal */}
      <div className="flex gap-4">
        {/* Subcategory */}
        <div className="w-1/3">
          <ChallengeTable
            title="Challenge Subcategory"
            data={subcats}
            onCreate={() => handleOpenCreate("subcategory")}
            onEdit={(item) => handleOpenEdit("subcategory", item)}
          />
        </div>

        {/* Product */}
        <div className="w-1/3">
          <ChallengeTable
            title="Challenge Product"
            data={products}
            onCreate={() => handleOpenCreate("product")}
            onEdit={(item) => handleOpenEdit("product", item)}
          />
        </div>

        {/* Stage */}
        <div className="w-1/3">
          <ChallengeTable
            title="Challenge Stage"
            data={stages}
            onCreate={() => handleOpenCreate("stage")}
            onEdit={(item) => handleOpenEdit("stage", item)}
          />
        </div>
      </div>

      {/* Modal para Crear/Editar */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-black text-white border border-yellow-500">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              {editItem ? "Editar" : "Crear"}{" "}
              {currentTable === "subcategory"
                ? "Subcategory"
                : currentTable === "product"
                ? "Product"
                : "Stage"}
            </DialogTitle>
            <DialogDescription>
              {editItem
                ? "Modifica el nombre y confirma para guardar cambios."
                : "Ingresa el nombre para crear un nuevo registro."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-yellow-500">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre"
                        className="bg-transparent border border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
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
