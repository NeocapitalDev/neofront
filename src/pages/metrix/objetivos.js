"use client";

import React, { useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Objetivos({ data }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const safeValue = (value, defaultValue = 0) => value ?? defaultValue;
    const balance = safeValue(data?.balance, 0).toFixed(2);

    const objetivos = [
        {
            nombre: "Mínimo 3 Días de Trading",
            resultado: `${safeValue(data?.tradeDayCount, 0)} días (${(
                (safeValue(data?.tradeDayCount, 0) / 3) *
                100
            ).toFixed(2)}%)`,
            estado: safeValue(data?.tradeDayCount, 0) >= 3,
            descripcion: "Este valor representa el número de sus días de trading activos medidos en la zona horaria CE(S)T.",
            videoUrl: "https://www.youtube.com/watch?v=lPd0uOoRzsY",
        },
        {
            nombre: `Pérdida máxima del día - $${(balance * 0.05).toFixed(2)}`,
            resultado: `$${safeValue(data?.maxDailyDrawdown, 0).toFixed(2)} (${(
                (safeValue(data?.maxDailyDrawdown, 0) / (balance * 0.05)) *
                100
            ).toFixed(2)}%)`,
            estado: safeValue(data?.maxDailyDrawdown, 0) <= balance * 0.05,
            descripcion:
                "Este valor representa la caída de capital más baja registrada en un día concreto. Contiene su P/L flotante y sólo puede ser sustituido por una pérdida mayor.",
            videoUrl: "https://www.youtube.com/watch?v=WaeBEto7Tkk",
        },
        {
            nombre: `Pérdida Máx. - $${(balance * 0.1).toFixed(2)}`,
            resultado: `$${safeValue(data?.maxAbsoluteDrawdown, 0).toFixed(2)} (${(
                (safeValue(data?.maxAbsoluteDrawdown, 0) / (balance * 0.1)) *
                100
            ).toFixed(2)}%)`,
            estado: safeValue(data?.maxAbsoluteDrawdown, 0) <= balance * 0.1,
            descripcion: "Este valor representa el capital registrado más bajo en su cuenta desde el momento en que se empezó a operar.",
            videoUrl: "https://www.youtube.com/watch?v=AsNUg0O-9iQ",
        },
        {
            nombre: `Objetivo de Beneficio - $${(balance * 0.08).toFixed(2)}`,
            resultado: `$${safeValue(data?.maxRelativeProfit, 0).toFixed(2)} (${(
                (safeValue(data?.maxRelativeProfit, 0) / (balance * 0.08)) *
                100
            ).toFixed(2)}%)`,
            estado: safeValue(data?.maxRelativeProfit, 0) >= balance * 0.08,
            descripcion: "Este valor representa su ganancia en el capital.",
            videoUrl: "https://www.youtube.com/watch?v=DWJts3chO_I",
        },
    ];

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="border-gray-200 border-2 dark:border-zinc-800 p-3 bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-zinc-300 dark:border-zinc-400">
                        <th className="px-4 py-2 text-md text-start text-gray-600 dark:text-gray-300">
                            Objetivos de Trading
                        </th>
                        <th className="px-4 py-2 text-md text-start text-gray-600 dark:text-gray-300">
                            Resultados
                        </th>
                        <th className="px-4 py-2 text-md text-start text-gray-600 dark:text-gray-300">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {objetivos.map((obj, index) => (
                        <React.Fragment key={index}>
                            <tr
                                className="cursor-pointer border-b border-zinc-300 dark:border-zinc-400 dark:hover:bg-zinc-700 hover:bg-gray-100"
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
                                    <td colSpan="3" className="text-center align-middle p-4">
                                        <div className="flex flex-col items-center">
                                            <p>{obj.descripcion}</p>
                                            <div className="mt-2">
                                                <iframe
                                                    width="300"
                                                    src={obj.videoUrl.replace("watch?v=", "embed/")}
                                                    title="YouTube video"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen
                                                    className="rounded-lg"
                                                ></iframe>
                                            </div>
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
