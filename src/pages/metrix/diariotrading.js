import { useState } from 'react';
import Image from 'next/image';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../../components/ui/hover-card";

export default function Diariotrading() {
    const [search, setSearch] = useState("");
    const [order, setOrder] = useState("Hora de Cierre");
    const [showTooltip, setShowTooltip] = useState(false);
    const [dropdown, setDropdown] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    const orderOptions = [
        "Hora de apertura",
        "Hora de Apertura ↓",
        "Tipo de Orden",
        "Símbolo",
        "Volumen",
        "Hora de Cierre",
        "Ticket",
        "Objetivo de Ganancia",
        "Ganancia",
        "Duración",
    ];

    const dropdownOptions = {
        Tipo: ["Compra", "Venta", "Pendiente"],
        Volumen: ["1.0", "0.5", "0.25", "0.1"],
        Símbolo: ["EUR/USD", "GBP/USD", "XAU/USD"],
    };

    const data = []; // Aquí puedes agregar tus datos reales

    const toggleDropdown = (key) => {
        setDropdown(dropdown === key ? null : key);
    };

    return (
        <>
            <div className="my-4 flex items-center space-x-3 relative">
                <p className="text-lg font-semibold">Diario de trading</p>

                {/* HoverCard para la información */}
                <HoverCard>
                    <HoverCardTrigger className="ml-2 cursor-pointer">
                        <Image
                            src="/images/informacion/info.svg"
                            alt="Más información"
                            width={16}
                            height={16}
                        />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 bg-black text-white text-sm rounded-lg py-2 px-3 shadow-lg z-30">
                        <p>
                            El "Diario de Trading" te permite llevar un registro detallado de tus
                            operaciones, ayudando a mejorar tu disciplina y análisis de las
                            decisiones que tomas en cada trade. Es una herramienta clave para el
                            crecimiento como trader.
                        </p>
                    </HoverCardContent>
                </HoverCard>
            </div>


            {/* Contenedor de la tabla */}
            <div className="p-6 dark:bg-zinc-800 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-700 dark:shadow-black max-w-4xl mx-auto">
                {/* Filtros */}
                <div className="mb-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center">
                    {/* Orden */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <label htmlFor="order" className="text-sm font-medium dark:text-white text-gray-700">
                            Orden:
                        </label>
                        <select
                            id="order"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="border dark:border-0 dark:bg-zinc-700 dark:focus: border-gray-300 rounded-md p-2 text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {orderOptions.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Buscar */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <label htmlFor="search" className="text-sm font-medium dark:text-white text-gray-700">
                            Buscar:
                        </label>
                        <input
                            id="search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar tickets o etiquetas..."
                            className="border dark:bg-zinc-700 dark:border-0 dark:text-wrap border-gray-300 rounded-md p-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Contenedor con scroll horizontal */}
                <div className="overflow-x-auto border border-gray-300 rounded-md max-h-[400px] dark:border-zinc-700 dark:shadow-black">
                    <table className="min-w-[1200px] text-xs text-left h-52">
                        {/* Encabezado */}
                        <thead className="bg-gray-100 sticky  top-0 z-10 dark:bg-zinc-700 dark:text-white">
                            <tr>
                                {[
                                    "Ticket",
                                    "Abrir",
                                    "Tipo",
                                    "Volumen",
                                    "Símbolo",
                                    "Precio",
                                    "SL",
                                    "TP",
                                    "Cierre",
                                    "Precio",
                                    "Swap",
                                    "Comisión",
                                    "Beneficio",
                                    "Pips",
                                    "Tiempo de duración",
                                    "Registro",
                                ].map((header, index) => (
                                    <th
                                        key={index}
                                        className={`border-b p-4 ${["Tipo", "Volumen", "Símbolo", "Pips"].includes(header)
                                            ? "text-amber-400 cursor-pointer relative"
                                            : "text-gray-700 dark:text-white"
                                            }`}
                                        onClick={() => {
                                            if (["Tipo", "Volumen", "Símbolo"].includes(header)) {
                                                toggleDropdown(header);
                                            }
                                        }}
                                        onMouseEnter={() => header === "Pips" && setShowTooltip(true)}
                                        onMouseLeave={() => header === "Pips" && setShowTooltip(false)}
                                    >
                                        {header}
                                        {header === "Pips" && (
                                            <>
                                                {/* HoverCard para información de Pips */}
                                                <HoverCard>
                                                    <HoverCardTrigger className="inline-block ml-1 cursor-pointer">
                                                        <Image
                                                            src="/images/informacion/info.svg"
                                                            alt="Más información"
                                                            width={12}
                                                            height={12}
                                                        />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent className="w-60 bg-black text-white">
                                                        <p>
                                                            Los pips se muestran para los pares FX. Para los símbolos no FX, el valor muestra el cambio de
                                                            precio en su denotación por defecto. Por ejemplo, si el precio del oro cambió de 1800,00 a 1801,50 y
                                                            la posición era de compra, el valor mostrará 1,50. Más información en el enlace.
                                                        </p>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </>
                                        )}

                                        {/* Dropdown */}
                                        {dropdown === header && (
                                            <div className="absolute bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-md mt-2 z-20 p-3 w-40">
                                                {dropdownOptions[header]?.map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                                                        onClick={() => alert(`Seleccionaste: ${item}`)}
                                                    >
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {/* Cuerpo */}
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="16"
                                        className="text-center dark:text-white p-6 text-gray-500 italic"
                                    >
                                        Sin resultados
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0
                                            ? "bg-white dark:bg-zinc-800"
                                            : "bg-gray-50 dark:bg-zinc-700"
                                            }`}
                                    >
                                        <td className="border-b p-4 dark:text-white">{row.ticket}</td>
                                        <td className="border-b p-4 dark:text-white">{row.abrir}</td>
                                        <td className="border-b p-4 dark:text-white">{row.tipo}</td>
                                        <td className="border-b p-4 dark:text-white">{row.volumen}</td>
                                        <td className="border-b p-4 dark:text-white">{row.simbolo}</td>
                                        <td className="border-b p-4 dark:text-white">{row.precio}</td>
                                        <td className="border-b p-4 dark:text-white">{row.sl}</td>
                                        <td className="border-b p-4 dark:text-white">{row.tp}</td>
                                        <td className="border-b p-4 dark:text-white">{row.cierre}</td>
                                        <td className="border-b p-4 dark:text-white">{row.precio}</td>
                                        <td className="border-b p-4 dark:text-white">{row.swap}</td>
                                        <td className="border-b p-4 dark:text-white">{row.comision}</td>
                                        <td className="border-b p-4 dark:text-white">{row.beneficio}</td>
                                        <td className="border-b p-4 dark:text-white">{row.pips}</td>
                                        <td className="border-b p-4 dark:text-white">{row.duracion}</td>
                                        <td className="border-b p-4 dark:text-white">{row.registro}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
}
