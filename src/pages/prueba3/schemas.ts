import { z } from "zod";

export const stepFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  subcategories: z
    .array(
      z.object({
        id: z.any(), // si usas strings o numbers, ajusta aquí
        name: z.string(),
      })
    )
    .default([]),
  stages: z
    .array(
      z.object({
        id: z.any(),
        name: z.string(),
      })
    )
    .default([]),
});
