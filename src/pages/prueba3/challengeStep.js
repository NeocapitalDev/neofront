"use strict";

module.exports = {
  async create(ctx) {
    try {
      const {
        name,
        stages = [],
        subcategories = [],
        ...rest
      } = ctx.request.body;

      // 1. Procesar STAGES
      const stageIDs = [];
      for (const stage of stages) {
        if (typeof stage.id === "number") {
          // Tiene id => ya existe en la BD
          stageIDs.push(stage.id);
        } else {
          // No tiene id => crearlo
          const newStage = await strapi.entityService.create(
            "api::challenge-stage.challenge-stage",
            {
              data: {
                name: stage.name,
                // ...otros campos que necesites
              },
            }
          );
          stageIDs.push(newStage.id);
        }
      }

      // 2. Procesar SUBCATEGORIES
      const subcategoryIDs = [];
      for (const subcat of subcategories) {
        if (typeof subcat.id === "number") {
          // Tiene id => ya existe
          subcategoryIDs.push(subcat.id);
        } else {
          // No tiene id => crearlo
          const newSubcat = await strapi.entityService.create(
            "api::challenge-subcategory.challenge-subcategory",
            {
              data: {
                name: subcat.name,
                // ...otros campos que necesites
              },
            }
          );
          subcategoryIDs.push(newSubcat.id);
        }
      }

      // 3. Crear el challenge-step y asociar los IDs
      const createdStep = await strapi.entityService.create(
        "api::challenge-step.challenge-step",
        {
          data: {
            name,
            ...rest,
            // Relacionamos los IDs internos
            challenge_stages: stageIDs,
            challenge_subcategories: subcategoryIDs,
          },
        }
      );

      return createdStep;
    } catch (error) {
      ctx.throw(400, error);
    }
  },
};
