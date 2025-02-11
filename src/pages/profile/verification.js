"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { IdentificationIcon } from "@heroicons/react/24/outline";
import { useStrapiData } from "@/services/strapiServiceJWT";

// Carga Veriff dinámicamente para evitar errores en SSR
const Veriff = dynamic(() => import("@veriff/js-sdk"), { ssr: false });

const VeriffComponent = () => {
  const [veriffInstance, setVeriffInstance] = useState(null);
  const { data: session } = useSession();
  const token = session?.jwt;
  const { data, error: fetchError, isLoading } = useStrapiData("users/me", token);

  useEffect(() => {
    if (isLoading || !data || typeof window === "undefined") return; // Solo ejecutar en cliente

    import("@veriff/js-sdk").then(({ Veriff }) => {
      import("@veriff/incontext-sdk").then(({ createVeriffFrame }) => {
        const veriff = Veriff({
          host: "https://stationapi.veriff.com",
          apiKey: "1d5f457e-72b2-460a-b013-c42617aa9886",
          parentId: "veriff-root",
          onSession: (err, response) => {
            if (err) {
              console.error("Error en Veriff:", err);
            } else {
              console.log("Sesión iniciada:", response);
              createVeriffFrame({ url: response.verification.url }); // Ahora sí está definido
            }
          },
        });

        veriff.setParams({
          person: {
            givenName: data.firstName,
            lastName: data.lastName,
          },
          vendorData: String(data.id),
        });

        setVeriffInstance(veriff);
      });
    });
  }, [isLoading, data]);

  useEffect(() => {
    if (veriffInstance) {
      veriffInstance.mount({
        submitBtnText: "Obtener verificación",
        loadingText: "Por favor espera...",
      });
    }
  }, [veriffInstance]);

  return (
    <div className="mt-6">
      <p className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
        Verificación de cuenta
      </p>
      <div className="flex flex-col md:flex-row items-start p-6 dark:bg-black bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-shrink-0">
          <IdentificationIcon className="h-12 w-12 text-zinc-400 dark:text-white" />
        </div>
        <div>
          <p className="text-sm leading-6 text-gray-700 dark:text-white mb-6">
            Confirme su identidad. Para continuar, necesitará una identificación con foto válida y un dispositivo con
            cámara. Al proceder, acepta que Veriff procese sus datos personales, incluidos los datos biométricos.
          </p>
          {!isLoading && data && <div id="veriff-root"></div>}
        </div>
      </div>
    </div>
  );
};

export default VeriffComponent;
