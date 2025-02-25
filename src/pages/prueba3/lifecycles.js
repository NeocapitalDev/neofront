// Ubicación: src/api/challenge-step/content-types/challenge-step/lifecycles.js
module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Procesar las subcategorías (challenge_subcategories)
    if (data.challenge_subcategories && Array.isArray(data.challenge_subcategories)) {
      const subcategories = await Promise.all(
        data.challenge_subcategories.map(async (subcat) => {
          // Comprobamos que se provea un documentId para identificar el registro
          if (!subcat.id) return null;

          // Buscar si ya existe una subcategoría con ese documentId
          const existingSubcat = await strapi.db.query('api::challenge-subcategory.challenge-subcategory').findOne({
            where: { id: subcat.id },
          });

          if (existingSubcat) {
            // Si existe, devolver solo el id para relacionarlo
            return existingSubcat.id;
          } else {
            // Si no existe, crear la subcategoría y devolver su id
            const newSubcat = await strapi.db.query('api::challenge-subcategory.challenge-subcategory').create({
              data: subcat,
            });
            return newSubcat.id;
          }
        })
      );
      // Asignar el array de ids filtrando posibles valores nulos
      data.challenge_subcategories = subcategories.filter((id) => id !== null);
    }

    // Procesar los stages (challenge_stages)
    if (data.challenge_stages && Array.isArray(data.challenge_stages)) {
      const stages = await Promise.all(
        data.challenge_stages.map(async (stage) => {
          if (!stage.id) return null;

          // Buscar si ya existe un stage con ese documentId
          const existingStage = await strapi.db.query('api::challenge-stage.challenge-stage').findOne({
            where: { id: stage.id },
          });

          if (existingStage) {
            return existingStage.id;
          } else {
            // Crear el stage si no existe
            const newStage = await strapi.db.query('api::challenge-stage.challenge-stage').create({
              data: stage,
            });
            return newStage.id;
          }
        })
      );
      data.challenge_stages = stages.filter((id) => id !== null);
    }
  },
};
