"use client";

import { useEffect, useState } from "react";
import { Veriff } from "@veriff/js-sdk";
import { createVeriffFrame } from "@veriff/incontext-sdk";

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
    <div>
      <button
        onClick={startVerification}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Verificar Identidad
      </button>
      <div id="veriff-root"></div>
    </div>
  );
};

export default VeriffComponent;
