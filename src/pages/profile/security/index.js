import Profile from "../../../pages/profile/index";
import { useState } from "react";

function Security() {
  const [isOpen, setIsOpen] = useState(false);

  // Datos dinámicos desde un arreglo
  const data = [
    {
      title: "Autenticación de dos factores",
      status: "Desactivado",
      statusColor: "text-red-500 dark:text-red-400",
      description:
        "La autenticación de dos factores (2FA) es una medida de seguridad que ayuda a proteger su Área de Cliente frente a accesos no autorizados. Para activar la autenticación 2FA, debe tener la aplicación móvil Authenticator sincronizada con su registro. Tenga en cuenta que si pierde el acceso a su dispositivo autenticado, el restablecimiento de la 2FA sólo es posible realizando un KYC completo. Por favor, absténgase de dar acceso a terceras personas.",
      activateButton: "Activar",
      authenticationDevices: {
        title: "Dispositivos de autenticación",
        noDevicesMessage: "No ha añadido ningún dispositivo de autenticación",
        addDeviceButton: "Añadir nuevo",
      },
    },
  ];

  return (
    <Profile>
      <div className="w-full max-w-4xl mx-auto mt-6">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md shadow-lg mb-6 transition duration-200"
          >
            {/* Título del desplegable */}
            <div
              className="bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 px-6 py-4 flex justify-between items-center cursor-pointer rounded-t-md transition-colors duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              <h3 className="text-lg font-medium">{item.title}</h3>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {isOpen ? "Cerrar" : "Desplegar"}
              </span>
            </div>

            {/* Contenido del desplegable */}
            {isOpen && (
              <div className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-300 px-6 py-4 rounded-b-md transition duration-200">
                {/* Estado */}
                <div className="mb-4">
                  <span
                    className={`${item.statusColor} text-sm font-bold uppercase`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {item.description}
                </p>

                {/* Botón para activar */}
                <button className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-200">
                  {item.activateButton}
                </button>

                {/* Dispositivos de autenticación */}
                <div className="mt-6">
                  <h4 className="text-base font-semibold mb-2">
                    {item.authenticationDevices.title}
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 p-4 rounded-md flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.authenticationDevices.noDevicesMessage}
                    </p>
                    <button className="bg-gray-100 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 transition duration-200">
                      {item.authenticationDevices.addDeviceButton}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Profile>
  );
}

export default Security;
