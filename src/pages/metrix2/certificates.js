import { useEffect, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const Certificados = ({ certificates }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
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
        
        // Ajustar tamaños y posiciones según el dispositivo
        const detected = window.innerWidth < 768;
        
        // Escalar el tamaño de la fuente para móviles
        const scaleFactor = detected ? 0.7 : 1;
        const nameFontSize = 90 * scaleFactor;
        const dateFontSize = 45 * scaleFactor;
        const qrSize = 200 * scaleFactor;
        const qrBackgroundSize = 230 * scaleFactor;
        
        // Calcular posiciones usando porcentajes del tamaño del PDF
        const fullName = `${certificates.firstName} ${certificates.lastName}`;
        const nameWidth = font.widthOfTextAtSize(fullName, nameFontSize);
        
        // Posicionar usando porcentajes para mejor adaptabilidad
        let nameX, nameY, dateX, dateY, qrX, qrY, qrBgX, qrBgY, montoX, montoY, montoSize;
        
        if (isRetiro) {
          // Posiciones para certificado de retiro
          nameX = width / 2 - nameWidth / 2; // Centrado
          nameY = height * 0.48; // Posición relativa
          
          dateX = width * 0.25;
          dateY = height * 0.2;
          
          qrBgX = width * 0.68;
          qrBgY = height * 0.28;
          qrX = qrBgX + 15;
          qrY = qrBgY + 15;
          
          montoX = width * 0.38;
          montoY = height * 0.36;
          montoSize = 100 * scaleFactor;
        } else {
          // Posiciones para certificado normal
          nameX = width / 2 - nameWidth / 2; // Centrado
          nameY = height * 0.46; // Posición relativa
          
          dateX = width * 0.25;
          dateY = height * 0.2;
          
          qrBgX = width * 0.68;
          qrBgY = height * 0.28;
          qrX = qrBgX + 15;
          qrY = qrBgY + 15;
        }

        // Usar la imagen QR
        const qrImageBytes = await fetch(certificates.qrLink).then(res => res.arrayBuffer());
        const qrImage = await pdfDoc.embedPng(qrImageBytes);

        if (isRetiro) {
          firstPage.drawText(`${certificates.firstName} ${certificates.lastName}`, {
            x: nameX,
            y: nameY,
            size: nameFontSize,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          firstPage.drawText(`${certificates.fechaFinChallenge}`, {
            x: dateX,
            y: dateY,
            size: dateFontSize,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          // Dibujar fondo ámbar detrás del QR
          firstPage.drawRectangle({
            x: qrBgX,
            y: qrBgY,
            width: qrBackgroundSize,
            height: qrBackgroundSize,
            color: rgb(1, 0.8, 0),  // Color ámbar
            borderWidth: 0,
          });
          
          firstPage.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });

          firstPage.drawText(`$ ${certificates.monto}`, {
            x: montoX,
            y: montoY,
            size: montoSize,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });
        } else {
          firstPage.drawText(`${certificates.firstName} ${certificates.lastName}`, {
            x: nameX,
            y: nameY,
            size: nameFontSize,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          firstPage.drawText(`${certificates.fechaFinChallenge}`, {
            x: dateX,
            y: dateY,
            size: dateFontSize,
            font,
            color: rgb(0.8, 0.8, 0.8),
          });

          // Dibujar fondo ámbar detrás del QR
          firstPage.drawRectangle({
            x: qrBgX,
            y: qrBgY,
            width: qrBackgroundSize,
            height: qrBackgroundSize,
            color: rgb(1, 0.8, 0),  // Color ámbar
            borderWidth: 0,
          });
          
          firstPage.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize,
          });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el PDF:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadPdf();
    
    // Limpieza de URL al desmontar
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [certificates]);

  // Función para descargar el PDF
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Certificado_${certificates?.firstName || ''}_${certificates?.lastName || ''}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Si está cargando, mostramos un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-64 bg-gray-50 dark:bg-zinc-900 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {pdfUrl ? (
        <div className="flex flex-col w-full">
          {/* Contenedor responsivo para el PDF */}
          <div 
            className="w-full rounded-lg shadow-md overflow-hidden"
            style={{ 
              height: isMobile ? "450px" : "600px",
              backgroundColor: "#1c1c1c" // Fondo oscuro para mantener la estética
            }}
          >
            {isMobile ? (
              // Para móviles, usamos embed para mantener los controles
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="border-0"
              />
            ) : (
              // Para desktop, mantenemos el iframe original
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                className="border-0"
                title="Certificado PDF"
                style={{ overflow: 'auto' }}
              ></iframe>
            )}
          </div>
        </div>
      ) : error ? (
        <div className="w-full p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg shadow-sm">
          <p className="text-lg text-red-600 dark:text-red-400 flex items-center">
            <span className="mr-2">⚠️</span> 
            Error: {error}
          </p>
        </div>
      ) : (
        <div className="w-full p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg shadow-sm">
          <p className="text-lg text-amber-600 dark:text-amber-400 flex items-center">
            <span className="mr-2">⚠️</span>
            No hay certificados disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificados;