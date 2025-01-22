function Identity() {
  return (
    <div className="bg-zinc-800 text-white p-6 rounded-lg shadow-lg shadow-black">
      <h2 className="text-xl font-bold mb-4">NEO Identity</h2>
      <div className="flex items-start space-x-4">
        {/* Icono */}
        <div className="flex items-center justify-center bg-gray-800 p-3 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 22c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm0-18c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
            />
          </svg>
        </div>
        {/* Contenido */}
        <p className="text-sm">
          La sección de NEO Identity se desbloqueará para usted una vez que esté a
          punto de firmar o cambiar un contrato con nosotros. Se desbloqueará
          automáticamente una vez que cumpla un Objetivo de Ganancia en una
          Verificación que no haya violado la Pérdida Máxima Diaria o la Pérdida
          Máxima.
        </p>
      </div>
    </div>
  );
}

export default Identity;
