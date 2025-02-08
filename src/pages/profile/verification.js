"use client";

import { useEffect, useState } from "react";
import { Veriff } from "@veriff/js-sdk";
import { createVeriffFrame } from "@veriff/incontext-sdk";
import { IdentificationIcon, UserIcon } from '@heroicons/react/24/outline';

const VeriffComponent = () => {
  const [veriffInstance, setVeriffInstance] = useState(null);

  useEffect(() => {
    const veriff = Veriff({
      host: "https://stationapi.veriff.com",
      apiKey: "dd8f7e39-0ef2-4c05-a872-b40235b2d24f",
      parentId: "veriff-root",
      onSession: (err, response) => {
        if (err) {
          console.error("Error en Veriff:", err);
        } else {
          console.log("Session iniciada:", response);
          createVeriffFrame({ url: response.verification.url }); // Muestra la verificación en la misma página
        }
      },
    });

    setVeriffInstance(veriff);
  }, []);

  const startVerification = () => {
    if (veriffInstance) {
      veriffInstance.mount({
        formLabel: {
          vendorData: "Order number",
        },
      });
    } else {
      console.error("Veriff aún no está listo.");
    }
  };

  return (
    <>
      <div className="mt-6">
        <p className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
          Verificación de cuenta
        </p>
        <div className="flex flex-col md:flex-row items-start p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black space-y-4 md:space-y-0 md:space-x-6">
          {/* Icono */}
          <div className="flex-shrink-0">
            <IdentificationIcon className="h-12 w-12 text-zinc-400 dark:text-zinc-400" />
          </div>

          {/* Contenido de texto */}
          <div>
            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
              Confirme su identidad. Para continuar, necesitará una identificación con foto válida y un dispositivo con cámara. Al proceder, acepta que Veriff procese sus datos personales, incluidos los datos biométricos.
            </p>


            {/* Botón de verificación */}
            <div className="flex flex-col items-start mt-6">
              <button
                onClick={startVerification}
                className="px-4 py-2 text-black font-semibold rounded-md shadow-lg transition bg-amber-500 hover:bg-amber-600"
              >
                Verificar Identidad
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="veriff-root"></div>
    </>
  );
};

export default VeriffComponent;
