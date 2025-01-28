import React from "react";

export default function MostrarDatosButton({ data }) {
  const handleButtonClick = () => {
    console.log("Datos desde MostrarDatosButton:", data);
  };

  return (
    <button
      onClick={handleButtonClick}
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg"
    >
      Mostrar datos en consola
    </button>
  );
}
