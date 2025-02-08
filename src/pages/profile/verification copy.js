"use client";
import { useEffect } from "react";
import { Veriff } from "@veriff/js-sdk";
import { IdentificationIcon, UserIcon } from '@heroicons/react/24/outline';

const VeriffButton = () => {
    useEffect(() => {
      const veriff = Veriff({
        host: 'https://stationapi.veriff.com',
        apiKey: 'dd8f7e39-0ef2-4c05-a872-b40235b2d24f',
        parentId: "veriff-root",
        onSession: (err, response) => {
          if (err) {
            console.error("Error al iniciar sesión en Veriff:", err);
          } else {
            console.log("Sesión de Veriff iniciada:", response);
            window.location.href = response.verification.url; // Redirigir a Veriff
          }
        },
      });

    document.getElementById("veriff-btn")?.addEventListener("click", () => {
      veriff.mount();
    });
  }, []);

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
                {/* Botón de verificación */}
                <button
                  className="px-4 py-2 text-black font-semibold rounded-md shadow-lg transition bg-amber-500 hover:bg-amber-600">
                  Iniciar Verificacion
                </button>
              </div>
            </div>
          </div>
        </div>

      <button id="veriff-btn" className="bg-blue-600 text-white p-2 rounded">
        Verificar Identidad
      </button>
      <div id="veriff-root"></div>
    </>
  );
};

export default VeriffButton;
