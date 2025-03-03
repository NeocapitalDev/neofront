"use client";

import React, { useEffect, useState } from "react";
import { ChallengeTable } from "@/components/table/ChallengeTable";

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

// Importar toast desde sonner
import { toast } from "sonner";

// Validación
const nameSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
});

export function SubcategoriesManager({ pageSize }) {
  // Estado
  const [subcats, setSubcats] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // const [pageSize, setPageSize] = useState(10);

  // Form
  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  // --------------------------------------------------
  // 1. Helpers para consumir Strapi
  // --------------------------------------------------
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

  // --------------------------------------------------
  // 2. Cargar datos al montar
  // --------------------------------------------------
  useEffect(() => {
    const loadSubcategories = async () => {
      try {
        const data = await fetchStrapiData("challenge-subcategories");
        setSubcats(
          data.map((item) => ({
            id: item.id,
            documentId: item.documentId,
            name: item.name,
          }))
        );
      } catch (error) {
        console.error("Error al cargar subcategorías:", error);
      }
    };
    loadSubcategories();
  }, []);

  // --------------------------------------------------
  // 3. Crear / Editar
  // --------------------------------------------------
  function handleOpenCreate() {
    setEditItem(null);
    form.reset({ name: "" });
    setOpenModal(true);
  }

  function handleOpenEdit(item) {
    setEditItem({
      docId: item.documentId, // Usamos documentId como UID
      name: item.name,
    });
    form.reset({ name: item.name });
    setOpenModal(true);
  }

  async function onSubmit(formValues) {
    const payload = { name: formValues.name };
    const endpoint = "challenge-subcategories";

    try {
      if (editItem) {
        // Editar
        await updateStrapiItem(endpoint, editItem.docId, payload);
        toast.success("Subcategoría editada exitosamente");
      } else {
        // Crear
        await createStrapiItem(endpoint, payload);
        toast.success("Subcategoría creada exitosamente");
      }
      setOpenModal(false);

      // Refrescar datos
      const newData = await fetchStrapiData(endpoint);
      setSubcats(
        newData.map((item) => ({
          id: item.id,
          documentId: item.documentId,
          name: item.name,
        }))
      );
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Ocurrió un error al guardar. Revisa la consola.");
    }
  }

  // --------------------------------------------------
  // 4. Procesar datos para la tabla:
  //    - Eliminar nombres duplicados.
  //    - Enumerar secuencialmente (1,2,3,...) en lugar de usar el id real.
  // --------------------------------------------------
  const uniqueSubcats = subcats.filter(
    (item, index, self) => index === self.findIndex((t) => t.name === item.name)
  );
  const tableData = uniqueSubcats.map((item, index) => ({
    ...item,
    id: index + 1, // Reemplaza el id de la base de datos por el número de fila
  }));

  // --------------------------------------------------
  // 5. Render
  // --------------------------------------------------
  return (
    <div>
      {/*<RowsPerPage pageSize={pageSize} onPageSizeChange={setPageSize} />}*/}
      <ChallengeTable
        title="Challenge Subcategory"
        data={tableData}
        pageSize={pageSize}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
      />

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-black text-white border border-yellow-500 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-sm sm:text-base md:text-lg">
              {editItem ? "Editar" : "Crear"} Subcategory
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
