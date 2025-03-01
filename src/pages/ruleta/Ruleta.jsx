"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStrapiData } from "src/services/strapiService";
import { useSession } from "next-auth/react";

const RuletaSorteo = ({ customOptions, width = 300, height = 300 }) => {
  // 1) Obtenemos datos desde Strapi o desde la prop customOptions.
  const { data: session, status } = useSession();

  console.log("Sesión actual:", session);
  const { data, error, loading } = useStrapiData(
    "provisional-products?populate=*"
  );
  console.log("data", data);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [startAngle, setStartAngle] = useState(0);
  const canvasRef = useRef(null);
  const [intento, setIntento] = useState("");

  let opciones = [];
  if (customOptions && customOptions.length > 0) {
    opciones = customOptions;
  } else if (data) {
    opciones = data.map((item) => ({
      name: item.precio,
      documentId: item.documentId,
    }));
  }
  console.log("opciones", opciones);
  // 2) Offset para que “ángulo 0” esté en la parte superior.
  const angleOffset = -Math.PI / 2;

  // 3) Dibuja la ruleta con el esquema de colores adecuado.
  const drawWheel = (ctx, options, currentAngle) => {
    const numOptions = options.length;
    const arcSize = (2 * Math.PI) / numOptions;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000"; // Fondo negro
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < numOptions; i++) {
      const angle = angleOffset + currentAngle + i * arcSize;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
      ctx.fillStyle = i % 2 === 0 ? "#F7DC6F" : "#F4D03F"; // Tonos amarillos/dorados
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto centrado en cada sector
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(options[i].name, radius - 10, 8);
      ctx.restore();
    }
  };

  // 4) Calcula el ángulo final según el índice ganador.
  const calculateFinalAngle = (currentAngle, winningIndex) => {
    const numOptions = opciones.length;
    const arcSize = (2 * Math.PI) / numOptions;
    // Se determina el ángulo objetivo para centrar el sector ganador en el puntero.
    const targetAngle =
      2 * Math.PI - (winningIndex * arcSize + arcSize / 2) - angleOffset;
    const vueltasCompletas = 3;
    let finalAngle = currentAngle + vueltasCompletas * 2 * Math.PI;
    // Aseguramos que el ángulo final tenga el residuo deseado.
    while (finalAngle % (2 * Math.PI) < targetAngle) {
      finalAngle += 2 * Math.PI;
    }
    finalAngle = finalAngle - (finalAngle % (2 * Math.PI)) + targetAngle;
    return finalAngle;
  };

  // 5) Función de giro que consulta el resultado en el backend.
  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedOption(null);

    try {
      const response = await fetch(
        "https://n8n.neocapitalfunding.com/webhook-test/webhook/ruleta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({
            usuario: session.user.email,
            docu
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      // Se asume que el backend retorna el objeto ganador { name, documentId }
      const winningOption = await response.json();
      // Se busca el índice de la opción ganadora en el array.
      const winningIndex = opciones.findIndex(
        (opcion) =>
          opcion.documentId === winningOption.documentId &&
          opcion.name === winningOption.name
      );

      if (winningIndex === -1) {
        throw new Error("La opción ganadora no coincide con ninguna opción");
      }

      const finalAngle = calculateFinalAngle(startAngle, winningIndex);
      const duration = 3000;
      const startTime = performance.now();
      const initialAngle = startAngle;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAngle =
          initialAngle + easeOut * (finalAngle - initialAngle);
        setStartAngle(currentAngle);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        drawWheel(ctx, opciones, currentAngle);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          setSelectedOption(opciones[winningIndex]);
        }
      };

      requestAnimationFrame(animate);
    } catch (err) {
      console.error(err);
      setIsSpinning(false);
      // Aquí podrías mostrar un mensaje de error en la interfaz
    }
  };

  // 6) Dibuja la ruleta al montar o cuando cambien opciones/ángulo.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      drawWheel(ctx, opciones, startAngle);
    }
  }, [opciones, startAngle, width, height]);
  const handlePerder = async () => {
    try {
      const ticket = await fetch(
        "https://n8n.neocapitalfunding.com/webhook-test/user/lose",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({
            usuario: session.user.email,
          }),
        }
      );

      if (!ticket.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      // Aquí convertimos la respuesta a JSON
      const responseData = await ticket.json();
      console.log("Response data:", responseData);

      // Si tu JSON contiene algo como `documentId`, podrías usarlo así:
      setIntento(responseData.data.documentId);
    } catch (error) {
      console.error("Error al manejar la respuesta:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#000",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.8)",
        maxWidth: "400px",
        margin: "auto",
      }}
    >
      {!customOptions && loading && (
        <p style={{ color: "#fff" }}>Cargando...</p>
      )}
      {!customOptions && error && (
        <p style={{ color: "#fff" }}>Ocurrió un error al cargar los datos</p>
      )}
      {opciones.length === 0 ? (
        <p style={{ color: "#fff" }}>No hay opciones disponibles</p>
      ) : (
        <>
          <div style={{ position: "relative", width, height }}>
            <canvas
              ref={canvasRef}
              style={{
                border: "5px solid #555",
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(255,255,0,0.5)",
              }}
            />
            {/* Puntero animado */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: [-10, 0, -10] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                position: "absolute",
                top: "0",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 0,
                height: 0,
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderBottom: "25px solid #FFEB3B",
              }}
            />
          </div>
          <div className="flex justify-center gap-4 items-center">
            <button
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                background: "#FFEB3B",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "30px",
                cursor: "pointer",
                transition: "background 0.3s, transform 0.3s",
                boxShadow: "0 4px 8px rgba(255,235,59,0.6)",
              }}
              onClick={handlePerder}
            >
              {" "}
              perder
            </button>
            <motion.button
              onClick={spinWheel}
              disabled={isSpinning}
              whileHover={!isSpinning ? { scale: 1.05 } : {}}
              whileTap={!isSpinning ? { scale: 0.95 } : {}}
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                background: isSpinning ? "#777" : "#FFEB3B",
                color: "#000",
                fontSize: "16px",
                fontWeight: "bold",
                border: "none",
                borderRadius: "30px",
                cursor: isSpinning ? "not-allowed" : "pointer",
                transition: "background 0.3s, transform 0.3s",
                boxShadow: "0 4px 8px rgba(255,235,59,0.6)",
              }}
            >
              {isSpinning ? "Girando..." : "Girar"}
            </motion.button>
          </div>
          {selectedOption && !isSpinning && (
            <p
              style={{
                fontSize: "20px",
                marginTop: "25px",
                color: "#FFEB3B",
                fontWeight: "bold",
              }}
            >
              Resultado: {selectedOption.name}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
};

export default RuletaSorteo;
