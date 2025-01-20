import { useState } from 'react';

export default function MetrixDash() {
    const data = [12, 19, 3, 5, 2]; // Datos de ejemplo
    const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'];

    return (
        <div className="flex items-center justify-center  bg-gray-100">
            <div className="w-full  bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4">Gráfica de Ventas</h2>
                <div className="flex justify-between">
                    {data.map((value, index) => (
                        <div key={index} className="flex flex-col items-center ">
                            <div
                                style={{
                                    height: `${value * 10}px`, // Escalar la altura
                                    width: '100%', // Llenar el ancho disponible
                                    backgroundColor: 'rgba(255, 193, 7, 1)', // Ámbar sólido

                                    borderRadius: '4px',
                                }}
                            />
                            <span className="mt-2 text-sm">{labels[index]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}