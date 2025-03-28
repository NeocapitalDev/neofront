import { useEffect, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const Certificados = ({ certificates }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        console.log("Certificates recibido:", certificates);

        if (!certificates) {
          throw new Error("No se proporcionaron datos de certificados");
        }

        const isRetiro = certificates.tipoChallenge === "retirado";
        const pdfBasePath = isRetiro ? "/pdf/Retiro.pdf" : "/pdf/Certificado2.pdf";

        console.log("Intentando cargar PDF desde:", pdfBasePath);
        const existingPdfBytes = await fetch(pdfBasePath).then(res => {
          if (!res.ok) throw new Error(`No se pudo cargar el PDF: ${res.status}`);
          return res.arrayBuffer();
        });

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { width, height } = firstPage.getSize();

        // Usar directamente la imagen QR en base64
        const qrImageBytes = await fetch(certificates.qrLink).then(res => res.arrayBuffer());
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        if (isRetiro) {
          firstPage.drawText(`${certificates.firstName} ${certificates.lastName}`, {
            x: width / 2 - 420,
            y: height / 2 - 140,
            size: 90,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          firstPage.drawText(`${certificates.fechaFinChallenge}`, {
            x: width / 2 - 420,
            y: height / 2 - 540,
            size: 45,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          // Dibujar fondo ámbar detrás del QR
          firstPage.drawRectangle({
            x: width / 2 + 865,
            y: height / 2 - 455,
            width: 250,
            height: 250,
            color: rgb(1, 0.8, 0),  // Color ámbar
            borderWidth: 0,
          });
          
          firstPage.drawImage(qrImage, {
            x: width / 2 + 880,
            y: height / 2 - 440,
            width: 220,
            height: 220,
          });

          firstPage.drawText(`$ ${certificates.monto}`, {
            x: width / 2 - 190,
            y: height / 2 - 320,
            size: 100,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });
        } else {
          firstPage.drawText(`${certificates.firstName} ${certificates.lastName}`, {
            x: width / 2 - 460,
            y: height / 2 - 130,
            size: 100,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          firstPage.drawText(`${certificates.fechaFinChallenge}`, {
            x: width / 2 - 450,
            y: height / 2 - 530,
            size: 50,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          // Nuevo posicionamiento del QR para que aparezca a la derecha como en el certificado de retiro
          // Dibujar fondo ámbar detrás del QR
          firstPage.drawRectangle({
            x: width / 2 + 865,
            y: height / 2 - 455,
            width: 250,
            height: 250,
            color: rgb(1, 0.8, 0),  // Color ámbar
            borderWidth: 0,
          });
          
          firstPage.drawImage(qrImage, {
            x: width / 2 + 880,
            y: height / 2 - 440,
            width: 220,
            height: 220,
          });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
      } catch (error) {
        console.error("Error al cargar el PDF:", error);
        setError(error.message);
      }
    };

    loadPdf();
  }, [certificates]);

  return (
    <div className="flex justify-center items-center w-full">
      {pdfUrl ? (
        <div className="flex justify-center items-center w-full">
          <iframe
            src={pdfUrl}
            width="90%"
            height="610px"
            className="border rounded-lg shadow-lg w-full"
          ></iframe>
        </div>
      ) : error ? (
        <p className="text-xl text-red-600">⚠️ Error: {error}</p>
      ) : (
        <p className="text-xl">⚠️ No hay certificados disponibles</p>
      )}
    </div>
  );
};

export default Certificados;