import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function Objetivos() {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const objetivos = [
        {
            nombre: 'Mínimo 2 Días de Trading',
            resultado: '-',
            estado: false,
            descripcion: 'Este valor representa el número de sus días de trading activos medidos en la zona horaria CE(S)T. Leer más',
            videoUrl: 'https://www.youtube.com/watch?v=lPd0uOoRzsY'
        },
        {
            nombre: 'Pérdida máxima del día - $2,500',
            resultado: '$0.00 (0.00%)',
            estado: true,
            descripcion: 'Este valor representa la caída de capital más baja registrada en un día concreto. Contiene su P/L flotante y sólo puede ser sustituido por una pérdida mayor.',
            videoUrl: 'https://www.youtube.com/watch?v=WaeBEto7Tkk'
        },
        {
            nombre: 'Pérdida Máx. - $5,000',
            resultado: '$0.00 (0.00%)',
            estado: true,
            descripcion: 'Este valor representa el capital registrado más bajo en su cuenta desde el momento en que se empezó a operar. Leer más',
            videoUrl: 'https://www.youtube.com/watch?v=AsNUg0O-9iQ'
        },
        {
            nombre: 'Objetivo de Beneficio $2,500',
            resultado: '$0.00 (0.00%)',
            estado: false,
            descripcion: 'Este valor representa su ganancia en el capital. Leer más',
            videoUrl: 'https://www.youtube.com/watch?v=DWJts3chO_I'
        },
    ];

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="p-3 dark:bg-zinc-800 bg-white rounded-md shadow-lg">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b">
                        <th className="px-4 py-2 text-md text-start">Objetivos de Trading</th>
                        <th className="px-4 py-2 text-md text-start">Resultados</th>
                        <th className="px-4 py-2 text-md text-start">Resumen</th>
                    </tr>
                </thead>
                <tbody>
                    {objetivos.map((obj, index) => (
                        <React.Fragment key={index}>
                            <tr
                                className="border-b cursor-pointer dark:hover:bg-zinc-700 hover:bg-gray-100"
                                onClick={() => toggleExpand(index)}
                            >
                                <td className="px-4 py-2 text-amber-500 font-semibold">
                                    {expandedIndex === index ? `- ${obj.nombre}` : `+ ${obj.nombre}`}
                                </td>
                                <td className="px-4 py-2">{obj.resultado}</td>
                                <td className="px-4 py-2">
                                    {obj.estado ? (
                                        <div className="flex items-center  ">
                                            <CheckIcon className="h-6 w-6 mr-2 rounded-lg text-white  bg-green-500" />
                                            <span>Aprobado</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center ">
                                            <XMarkIcon className="h-6 w-6 mr-2 rounded-lg   text-white bg-red-500" />
                                            <span>No aprobado</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            {expandedIndex === index && (
                                <tr>
                                    <td colSpan="3" className="text-center align-middle p-4">
                                        <div className="d-flex flex-column align-items-center">
                                            <p>{obj.descripcion}</p>
                                            <div className="mt-2 d-flex justify-content-center">

                                                <center>

                                                    <iframe
                                                        width="200"
                                                        src={obj.videoUrl.replace("watch?v=", "embed/")}
                                                        title="YouTube video"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        referrerPolicy="strict-origin-when-cross-origin"
                                                        allowFullScreen>
                                                    </iframe>

                                                </center>


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