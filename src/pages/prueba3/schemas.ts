import { z } from "zod";

export const stepFormSchema = z.object({
  documentId: z.string(),
  name: z.string().nonempty("El nombre es requerido"),
  subcategories: z
    .array(
      z.object({
        id: z.any(), // si usas strings o numbers, ajusta aquí
        documentId: z.string().optional(),
        name: z.string(),
      })
    )
    .default([]),
  stages: z
    .array(
      z.object({
        id: z.any(),
        documentId: z.string().optional(),
        name: z.string(),
      })
    )
    .default([]),
});
