import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useStrapiData } from "src/services/strapiService";

const RuletaSorteo = ({ customOptions, width = 300, height = 300 }) => {
  // 1) Obtenemos datos desde Strapi o desde la prop customOptions.
  const { data, error, loading } = useStrapiData(
    "challenge-products?populate=*"
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [startAngle, setStartAngle] = useState(0);
  const canvasRef = useRef(null);

  let opciones = [];
  if (customOptions && customOptions.length > 0) {
    opciones = customOptions;
  } else if (data) {
    opciones = data.map((item) => ({
      name: item.name,
      documentId: item.documentId,
    }));
  }

  // 2) Offset para que “ángulo 0” esté en la parte superior.
  const angleOffset = -Math.PI / 2;

  // 3) Dibuja la ruleta, aplicando el offset al ángulo de cada sector.
  const drawWheel = (ctx, options, currentAngle) => {
    const numOptions = options.length;
    const arcSize = (2 * Math.PI) / numOptions;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Limpiar canvas y establecer fondo oscuro
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000"; // fondo negro
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibujar sectores con colores amarillos y dorados
    for (let i = 0; i < numOptions; i++) {
      const angle = angleOffset + currentAngle + i * arcSize;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
      // Alterna entre tonos amarillos y dorados
      ctx.fillStyle = i % 2 === 0 ? "#F7DC6F" : "#F4D03F";
      ctx.fill();
      ctx.strokeStyle = "#333"; // borde oscuro para contraste
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dibujar texto centrado en cada sector
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

  // 4) Animación de giro.
  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedOption(null);

    const duration = 3000;
    const startTime = performance.now();
    const initialAngle = startAngle;
    const randomRotation = Math.floor(Math.random() * 360) + 360 * 3;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle =
        initialAngle + easeOut * randomRotation * (Math.PI / 180);
      setStartAngle(currentAngle);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      drawWheel(ctx, opciones, currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const normalizedAngle = (currentAngle + angleOffset) % (2 * Math.PI);
        const arcSize = (2 * Math.PI) / opciones.length;
        const index = Math.floor(
          ((2 * Math.PI - normalizedAngle) % (2 * Math.PI)) / arcSize
        );
        setSelectedOption(opciones[index]);
      }
    };

    requestAnimationFrame(animate);
  };

  // 5) Dibuja la ruleta al montar y cuando cambien opciones/ángulo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      drawWheel(ctx, opciones, startAngle);
    }
  }, [opciones, startAngle, width, height]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#000", // fondo de contenedor oscuro
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
          {/* Contenedor relativo para el canvas y el puntero */}
          <div style={{ position: "relative", width, height }}>
            <canvas
              ref={canvasRef}
              style={{
                border: "5px solid #555",
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(255,255,0,0.5)",
              }}
            />
            {/* Flecha precisa en la parte superior */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: [-10, 0, -10] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                position: "absolute",
                top: "50%", // Ajusta según necesites (p.e. '5px' o '-10px')
                left: "95%",
                transform: "translateX(50%)",
                width: 0,
                height: 0,
                rotate: "90deg",
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderBottom: "25px solid #FFEB3B", // amarillo brillante
              }}
            />
          </div>
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
