"use client";

import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function Objetivos({ accountId, challengeId }) {
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://risk-management-api-v1.new-york.agiliumtrade.ai/users/current/accounts/${accountId}/trackers/${challengeId}/statistics`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, [accountId, challengeId]);

    const safeValue = (value, defaultValue = 0) => {
        return value !== undefined && value !== null ? value : defaultValue;
    };

    const objetivos = [
        {
            nombre: 'Mínimo 2 Días de Trading',
            resultado: data ? `${safeValue(data.tradeDayCount, 0)} días (${((safeValue(data.tradeDayCount, 0) / 2) * 100).toFixed(2)}%)` : '-',
            estado: data ? safeValue(data.tradeDayCount, 0) >= 2 : false,
            descripcion: 'Este valor representa el número de sus días de trading activos medidos en la zona horaria CE(S)T. Leer más',
            videoUrl: 'https://www.youtube.com/watch?v=lPd0uOoRzsY'
        },
        {
            nombre: 'Pérdida máxima del día - $2,500',
            resultado: data ? `$${safeValue(data.maxAbsoluteDrawdown, 0).toFixed(2)} (${((safeValue(data.maxAbsoluteDrawdown, 0) / 2500) * 100).toFixed(2)}%)` : '$0.00 (0.00%)',
            estado: data ? safeValue(data.maxAbsoluteDrawdown, 0) <= 2500 : false,
            descripcion: 'Este valor representa la caída de capital más baja registrada en un día concreto. Contiene su P/L flotante y sólo puede ser sustituido por una pérdida mayor.',
            videoUrl: 'https://www.youtube.com/watch?v=WaeBEto7Tkk'
        },
        {
            nombre: 'Pérdida Máx. - $5,000',
            resultado: data ? `$${safeValue(data.maxAbsoluteDrawdown, 0).toFixed(2)} (${((safeValue(data.maxAbsoluteDrawdown, 0) / 5000) * 100).toFixed(2)}%)` : '$0.00 (0.00%)',
            estado: data ? safeValue(data.maxAbsoluteDrawdown, 0) <= 5000 : false,
            descripcion: 'Este valor representa el capital registrado más bajo en su cuenta desde el momento en que se empezó a operar. Leer más',
            videoUrl: 'https://www.youtube.com/watch?v=AsNUg0O-9iQ'
        },
        {
            nombre: 'Objetivo de Beneficio $2,500',
            resultado: data ? `$${safeValue(data.maxRelativeProfit, 0).toFixed(2)} (${((safeValue(data.maxRelativeProfit, 0) / 2500) * 100).toFixed(2)}%)` : '$0.00 (0.00%)',
            estado: data ? safeValue(data.maxRelativeProfit, 0) >= 2.5 : false,
            descripcion: 'Este valor representa su ganancia en el capital. Leer más',
            videoUrl: 'https://www.youtube.com/watch?v=DWJts3chO_I'
        }
    ];

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 p-3 bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-zinc-300 dark:border-zinc-400">
                        <th className="px-4 py-2 text-md text-start text-gray-600 dark:text-gray-300">Objetivos de Trading</th>
                        <th className="px-4 py-2 text-md text-start text-gray-600 dark:text-gray-300">Resultados</th>
                        <th className="px-4 py-2 text-md text-start text-gray-600 dark:text-gray-300">Resumen</th>
                    </tr>
                </thead>
                <tbody>
                    {objetivos.map((obj, index) => (
                        <React.Fragment key={index}>
                            <tr
                                className={`cursor-pointer border-b border-zinc-300 dark:border-zinc-400 dark:hover:bg-zinc-700 hover:bg-gray-100 ${index === objetivos.length - 1 ? 'border-b-0' : ''}`}
                                onClick={() => toggleExpand(index)}
                            >
                                <td className="px-4 py-4 text-amber-500 font-semibold">
                                    {expandedIndex === index ? `- ${obj.nombre}` : `+ ${obj.nombre}`}
                                </td>
                                <td className="px-4 py-4">{obj.resultado}</td>
                                <td className="px-4 py-4">
                                    {obj.estado ? (
                                        <div className="flex items-center">
                                            <CheckIcon className="h-6 w-6 mr-2 rounded-lg text-white bg-green-500" />
                                            <span className="dark:text-white">Aprobado</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <XMarkIcon className="h-6 w-6 mr-2 rounded-lg text-white bg-red-500" />
                                            <span className="dark:text-white">No aprobado</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {expandedIndex === index && (
                                <tr>
                                    <td colSpan="3" className="text-center align-middle p-4 bg-gray-100 dark:bg-zinc-900 dark:text-gray-300">
                                        <p>{obj.descripcion}</p>
                                        <div className="mt-2 flex justify-center">
                                            <iframe
                                                width="200"
                                                className="rounded-md"
                                                src={obj.videoUrl.replace("watch?v=", "embed/")}
                                                title="YouTube video"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
