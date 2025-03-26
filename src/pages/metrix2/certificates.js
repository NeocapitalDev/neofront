import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Certificados = ({ certificates }) => {
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    if (certificates && certificates.length > 0) {
      setCertificateData(certificates[0]); // Tomamos el primer certificado
    }
  }, [certificates]);

  return (
    <div className="flex justify-center items-center text-black bg-gray-100">
      {certificateData ? (
        <div className="bg-white p-8 rounded-lg shadow-lg w-[900px] h-[500px] flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold">🏆 Certificado de Logro</h2>
          <p className="text-lg mt-2">🎉 Otorgado a:</p>
          <h3 className="text-2xl font-semibold mt-1">✨ {certificateData.firstName} {certificateData.lastName} ✨</h3>
          <p className="text-md mt-4">📜 Por completar el challenge <strong>{certificateData.tipoChallenge}</strong></p>
          <p className="text-sm mt-2 text-gray-500">📅 Fecha de finalización: {certificateData.fechaFinChallenge}</p>
        </div>
      ) : (
        <p className="text-xl">⚠️ No hay certificados disponibles</p>
      )}
    </div>
  );
};

export default Certificados;
