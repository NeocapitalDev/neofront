import React, { useEffect } from "react";

export default function Stats(props) {
  useEffect(() => {
    console.log("Datos recibidos en Stats:", props);
  }, [props]);

  // Validar props antes de acceder a sus valores
  const {
    endDate = "-",
    broker_account = {}, // Si es undefined, asigna un objeto vacío para evitar errores
    result = "-",
    startDate = "-",
  } = props;
  
  const data = [
    { label: "Resultado", value: result },
    { label: "Inicio", value: startDate || "-" },
    { label: "Fin", value: endDate || "-" },
    { label: "Tamaño de cuenta", value: broker_account.balance ? `$${broker_account.balance}` : "-" },
    { label: "Plataforma", value: broker_account.platform },
  ];

  return (
    <>
      <p className="text-lg font-semibold mb-4">Estadísticas</p>
      <div className="px-3 h-auto max-w-full border-2 border-gray-100 dark:border-zinc-800 dark:shadow-black bg-white rounded-md shadow-md dark:bg-zinc-800 dark:text-white">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b dark:border-zinc-500 border-zinc-300 last:border-none">
                <td className="py-4 font-medium dark:text-white text-black">{item.label}</td>
                <td className="text-right">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
