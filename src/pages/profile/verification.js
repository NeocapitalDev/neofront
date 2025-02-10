"use client";

import { useEffect, useState } from "react";
import { Veriff } from "@veriff/js-sdk";
import { createVeriffFrame } from "@veriff/incontext-sdk";
import { IdentificationIcon } from "@heroicons/react/24/outline";
import { useStrapiData } from "@/services/strapiServiceJWT";
import { useSession } from "next-auth/react";

const VeriffComponent = () => {
  const [veriffInstance, setVeriffInstance] = useState(null);


  const { data: session } = useSession();
  const token = session?.jwt;

  const { data, error: fetchError, isLoading } = useStrapiData('users/me', token);

  console.log(data)

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

    // Configura los parámetros del usuario
    veriff.setParams({
      person: {
        givenName: data.firstName,
        lastName: data.lastName,
      },
      vendorData: data.documentId,
    });

    setVeriffInstance(veriff);
  }, []);

  useEffect(() => {
    if (veriffInstance) {
      veriffInstance.mount({
        submitBtnText: 'Obtener verificación',
        loadingText: 'Porfavor espera...'
      });
    }
  }, [veriffInstance]); // Inicia automáticamente cuando Veriff esté listo

  return (
    <>
      <div className="mt-6">
        <p className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
          Verificación de cuenta
        </p>
        <div className="flex flex-col md:flex-row items-start p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black space-y-4 md:space-y-0 md:space-x-6">
          {/* Icono */}
          <div className="flex-shrink-0">
            <IdentificationIcon className="h-12 w-12 text-zinc-400 dark:text-white" />
          </div>

          {/* Contenido de texto */}
          <div>
            <p className="text-sm leading-6 text-gray-700 dark:text-white mb-6">
              Confirme su identidad. Para continuar, necesitará una
              identificación con foto válida y un dispositivo con cámara. Al
              proceder, acepta que Veriff procese sus datos personales,
              incluidos los datos biométricos.
            </p>

            <div id="veriff-root"></div>

          </div>
        </div>
      </div>
    </>
  );
};

export default VeriffComponent;
