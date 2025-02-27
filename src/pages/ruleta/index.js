import React, { useState, useRef, useEffect } from 'react';

const RuletaSorteo = ({
    options = ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4', 'Opción 5'],
    width = 300,
    height = 300
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [startAngle, setStartAngle] = useState(0);
    const canvasRef = useRef(null);

    // Función para dibujar la ruleta
    const drawWheel = (ctx, options, startAngle) => {
        const numOptions = options.length;
        const arcSize = (2 * Math.PI) / numOptions;
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Fondo blanco para el canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Dibuja cada sector
        for (let i = 0; i < numOptions; i++) {
            const angle = startAngle + i * arcSize;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arcSize, false);
            // Colores en degradado entre dos tonos
            ctx.fillStyle = i % 2 === 0 ? '#6C63FF' : '#4E54C8';
            ctx.fill();

            // Borde de cada sector
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Texto en cada sector
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(options[i], radius - 10, 8);
            ctx.restore();
        }
    };

    // Función que anima el giro de la ruleta
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
            // Easing para desacelerar la animación
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentAngle = initialAngle + easeOut * randomRotation;
            setStartAngle(currentAngle);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawWheel(ctx, options, currentAngle);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                // Calcula la opción ganadora suponiendo un puntero fijo en la parte superior
                const normalizedAngle = currentAngle % (2 * Math.PI);
                const arcSize = (2 * Math.PI) / options.length;
                const index = Math.floor(((2 * Math.PI - normalizedAngle) % (2 * Math.PI)) / arcSize);
                setSelectedOption(options[index]);
            }
        };

        requestAnimationFrame(animate);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        drawWheel(ctx, options, startAngle);
    }, [options, startAngle, width, height]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f4f4f9',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            margin: 'auto'
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    border: '5px solid #ddd',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }}
            />
            <button
                onClick={spinWheel}
                disabled={isSpinning}
                style={{
                    marginTop: '20px',
                    padding: '12px 30px',
                    background: isSpinning ? '#aaa' : '#6C63FF',
                    color: '#fff',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s, transform 0.3s',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => !isSpinning && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {isSpinning ? 'Girando...' : 'Girar'}
            </button>
            {selectedOption && !isSpinning && (
                <p style={{
                    fontSize: '20px',
                    marginTop: '25px',
                    color: '#333',
                    fontWeight: 'bold'
                }}>
                    Resultado: {selectedOption}
                </p>
            )}
        </div>
    );
};

export default RuletaSorteo;
